import { useState, useEffect } from 'react';
import {
  Card, Typography, Empty, Skeleton, Row, Col,
  Modal, Spin, message, Pagination, Button, Space, Divider
} from 'antd';
import { SoundOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:5000';

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
  const [saving, setSaving] = useState(false);

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

  const saveStudyRecord = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      message.warning('请先登录再保存学习记录，点击顶部导航「用户登录」');
      return;
    }
    if (!currentWord) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/study/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: Number(userId), word_id: currentWord.id }),
      });
      const json = await res.json();
      if (json.code === 200) {
        message.success('学习记录已保存');
      } else {
        message.error(json.msg || '保存失败');
      }
    } catch (err) {
      message.error('保存学习记录失败');
      console.error('saveStudyRecord error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Title level={2} style={{ marginBottom: 6 }}>单词记忆首页</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24, fontSize: 14 }}>
        点击单词卡片，获取 AI 生成的趣味记忆素材
      </Text>

      {loading ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Col xs={24} sm={12} lg={8} key={i}>
              <Card>
                <Skeleton
                  active
                  paragraph={{ rows: 3 }}
                  title={{ width: '40%' }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      ) : words.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, #f0f2ff 0%, #e8ebff 100%)',
              margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, color: '#bcc3ff',
            }}
          >
            ?
          </div>
          <Text type="secondary" style={{ fontSize: 16 }}>
            暂无单词数据，请先在 Supabase words 表中导入单词
          </Text>
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {words.map((item) => (
              <Col xs={24} sm={12} lg={8} key={item.id}>
                <Card
                  hoverable
                  onClick={() => handleCardClick(item)}
                  style={{
                    borderRadius: 14,
                    height: '100%',
                    cursor: 'pointer',
                    border: '1px solid #f0f0f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <Title level={3} style={{ margin: 0, marginRight: 10, color: '#4a54c9' }}>
                      {item.word}
                    </Title>
                    <SoundOutlined
                      style={{ color: '#8b98ff', fontSize: 18, cursor: 'pointer' }}
                    />
                  </div>

                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {item.phonetic}
                  </Text>

                  <div
                    style={{
                      marginTop: 12,
                      padding: '8px 12px',
                      background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 15, color: '#4a4a4a' }}>
                      {item.basic_meaning || item.meaning}
                    </Text>
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 12,
                      color: '#b0b0b0',
                      textAlign: 'right',
                    }}
                  >
                    点击查看 AI 记忆口诀 →
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <Pagination
              current={page}
              pageSize={size}
              total={total}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={['6', '10', '20']}
              showTotal={(t) => `共 ${t} 个单词`}
              responsive
            />
          </div>
        </>
      )}

      {/* AI 记忆素材弹窗 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>
              {currentWord ? `"${currentWord.word}" AI 记忆素材` : 'AI 记忆素材'}
            </span>
          </div>
        }
        open={aiModalOpen}
        onCancel={() => { setAiModalOpen(false); setAiData(null); }}
        footer={
          <Space>
            <Button
              icon={<SaveOutlined />}
              type="primary"
              loading={saving}
              onClick={saveStudyRecord}
            >
              保存学习记录
            </Button>
            <Button onClick={() => { setAiModalOpen(false); setAiData(null); }}>
              关闭
            </Button>
          </Space>
        }
        width={680}
        destroyOnClose
        style={{ top: 40 }}
      >
        {aiLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 20, color: '#8c8c8c', fontSize: 15 }}>
              AI 正在生成记忆素材...
            </div>
          </div>
        ) : aiData ? (
          <div style={{ lineHeight: 1.8 }}>
            {/* 词根 / 词缀解析 */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div
                  style={{
                    width: 4, height: 18, borderRadius: 2,
                    background: 'linear-gradient(180deg, #6c7cfc 0%, #8b98ff 100%)',
                  }}
                />
                <Text strong style={{ fontSize: 15, color: '#4a54c9' }}>词根 / 词缀解析</Text>
              </div>
              <div
                style={{
                  padding: '12px 16px',
                  background: '#fafbff',
                  borderRadius: 10,
                  border: '1px solid #f0f2ff',
                  fontSize: 14,
                  color: '#555',
                }}
              >
                {aiData.root_analysis}
              </div>
            </div>

            <Divider style={{ margin: '16px 0', borderColor: '#f0f0f0' }} />

            {/* 趣味记忆口诀 */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div
                  style={{
                    width: 4, height: 18, borderRadius: 2,
                    background: 'linear-gradient(180deg, #f5a623 0%, #ffc53d 100%)',
                  }}
                />
                <Text strong style={{ fontSize: 15, color: '#d48806' }}>趣味记忆口诀</Text>
              </div>
              <div
                style={{
                  padding: '14px 18px',
                  background: 'linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%)',
                  borderRadius: 10,
                  border: '1px solid #ffe58f',
                  fontSize: 14,
                  color: '#5c4a00',
                  lineHeight: 1.8,
                }}
              >
                {aiData.mnemonic}
              </div>
            </div>

            <Divider style={{ margin: '16px 0', borderColor: '#f0f0f0' }} />

            {/* 日常例句 */}
            <div style={{ marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div
                  style={{
                    width: 4, height: 18, borderRadius: 2,
                    background: 'linear-gradient(180deg, #52c41a 0%, #73d13d 100%)',
                  }}
                />
                <Text strong style={{ fontSize: 15, color: '#389e0d' }}>日常例句</Text>
              </div>
              <div
                style={{
                  padding: '12px 16px',
                  background: '#f6ffed',
                  borderRadius: 10,
                  border: '1px solid #d9f7be',
                  fontSize: 14,
                  color: '#3d5a1e',
                  fontStyle: 'italic',
                }}
              >
                {aiData.extra_example}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Text type="secondary" style={{ fontSize: 15 }}>
              未能获取 AI 记忆素材
            </Text>
            <br />
            <Button
              type="link"
              icon={<ReloadOutlined />}
              style={{ marginTop: 12 }}
              onClick={() => currentWord && handleCardClick(currentWord)}
            >
              重试
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
