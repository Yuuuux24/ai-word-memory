import { useState, useEffect } from 'react';
import {
  Card, Tag, Typography, Empty, Skeleton, Row, Col,
  Modal, Spin, message, Pagination
} from 'antd';
import { SoundOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:5000';

const getPosColor = (pos) => {
  const colorMap = { verb: 'blue', adj: 'green', noun: 'orange', adverb: 'purple', 'verb/noun': 'cyan' };
  return colorMap[pos] || 'default';
};

export default function Home() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(6);

  // AI 弹窗状态
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [currentWord, setCurrentWord] = useState(null);

  // 页面加载自动拉取分页单词
  useEffect(() => {
    fetchWords(page, size);
  }, [page, size]);

  const fetchWords = async (p, s) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/words?page=${p}&size=${s}`);
      const json = await res.json();
      if (json.code === 200 && json.data) {
        setWords(json.data.list || []);
        setTotal(json.data.total || 0);
      } else {
        message.warning(json.msg || '获取单词列表失败');
      }
    } catch (err) {
      message.error('无法连接后端服务，请确认 Flask 已启动');
      console.error('fetchWords error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (item) => {
    setCurrentWord(item);
    setAiModalOpen(true);
    setAiLoading(true);
    setAiData(null);

    try {
      const res = await fetch(`${API_BASE}/api/ai/memo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word_id: item.id }),
      });
      const json = await res.json();
      if (json.code === 200) {
        setAiData(json.data);
      } else {
        message.error(json.msg || 'AI 接口返回异常');
      }
    } catch (err) {
      message.error('AI 接口请求失败，请检查后端服务');
      console.error('aiMemo error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handlePageChange = (p, s) => {
    setPage(p);
    setSize(s);
  };

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>单词记忆首页</Title>

      {loading ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Col xs={24} sm={12} lg={8} key={i}>
              <Card><Skeleton active paragraph={{ rows: 3 }} /></Card>
            </Col>
          ))}
        </Row>
      ) : words.length === 0 ? (
        <Empty description="暂无单词数据，请先在 Supabase words 表中导入" style={{ marginTop: 60 }} />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {words.map((item) => (
              <Col xs={24} sm={12} lg={8} key={item.id}>
                <Card
                  hoverable
                  style={{ borderRadius: 12, height: '100%' }}
                  onClick={() => handleCardClick(item)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <Title level={3} style={{ margin: 0, marginRight: 10 }}>
                      {item.word}
                    </Title>
                    <SoundOutlined style={{ color: '#1677ff', fontSize: 18, cursor: 'pointer' }} />
                  </div>

                  <Text type="secondary" style={{ fontSize: 14 }}>
                    {item.phonetic}
                  </Text>

                  <div style={{ marginTop: 10 }}>
                    <Tag color={getPosColor(item.part_of_speech)}>{item.part_of_speech}</Tag>
                    <Text style={{ fontSize: 15 }}>{item.meaning}</Text>
                  </div>

                  <Paragraph
                    type="secondary"
                    italic
                    style={{
                      marginTop: 12, fontSize: 13, background: '#f5f5f5',
                      padding: '8px 12px', borderRadius: 6
                    }}
                  >
                    "{item.example_sentence}"
                  </Paragraph>

                  <Text type="secondary" style={{ fontSize: 12 }}>
                    点击查看 AI 记忆口诀
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Pagination
              current={page}
              pageSize={size}
              total={total}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={['6', '10', '20']}
              showTotal={(t) => `共 ${t} 个单词`}
            />
          </div>
        </>
      )}

      {/* AI 记忆素材弹窗 */}
      <Modal
        title={currentWord ? `"${currentWord.word}" AI 记忆素材` : 'AI 记忆素材'}
        open={aiModalOpen}
        onCancel={() => setAiModalOpen(false)}
        footer={null}
        width={640}
        destroyOnClose
      >
        {aiLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin tip="AI 正在生成记忆素材..." size="large">
              <div style={{ height: 80 }} />
            </Spin>
          </div>
        ) : aiData ? (
          <div style={{ lineHeight: 2 }}>
            <Title level={5}>词根 / 词缀解析</Title>
            <Paragraph>{aiData.root_analysis}</Paragraph>

            <Title level={5}>趣味记忆口诀</Title>
            <Paragraph style={{ background: '#fff7e6', padding: '10px 14px', borderRadius: 8 }}>
              {aiData.mnemonic}
            </Paragraph>

            <Title level={5}>日常例句</Title>
            <Paragraph>
              <Tag color="blue">{aiData.part_of_speech}</Tag> {aiData.extra_example}
            </Paragraph>

            <Title level={5}>原文例句</Title>
            <Paragraph type="secondary" italic>
              "{aiData.original_example}"
            </Paragraph>
          </div>
        ) : (
          <Empty description="未能获取 AI 记忆素材" />
        )}
      </Modal>
    </div>
  );
}
