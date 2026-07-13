import { useState, useEffect } from 'react';
import {
  Card, Typography, Empty, Skeleton, Tag,
  Pagination, message, Modal, Spin, Button, Space,
} from 'antd';
import { HistoryOutlined, EyeOutlined, LoginOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

const { Title, Text, Paragraph } = Typography;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:5000';

const getPosColor = (pos) => {
  const map = { verb: 'blue', adj: 'green', noun: 'orange', adverb: 'purple', 'verb/noun': 'cyan' };
  return map[pos] || 'default';
};

export default function History() {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [userId, setUserId] = useState(null);

  // AI 复习弹窗
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [reviewWord, setReviewWord] = useState(null);

  useEffect(() => {
    const uid = localStorage.getItem('user_id');
    if (!uid) {
      message.warning('请先登录再查看背诵历史');
      setTimeout(() => router.push('/login'), 800);
      return;
    }
    setUserId(Number(uid));
  }, []);

  useEffect(() => {
    if (userId) {
      fetchRecords(page, size);
    }
  }, [userId, page, size]);

  const fetchRecords = async (p, s) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/study/list?user_id=${userId}&page=${p}&size=${s}`);
      const json = await res.json();
      if (json.code === 200 && json.data) {
        setRecords(json.data.list || []);
        setTotal(json.data.total || 0);
      } else {
        message.warning(json.msg || '获取学习记录失败');
      }
    } catch (err) {
      message.error('无法连接后端服务');
      console.error('fetchRecords error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (item) => {
    setReviewWord(item);
    setReviewModalOpen(true);
    setReviewLoading(true);
    setReviewData(null);

    try {
      const res = await fetch(`${API_BASE}/api/ai/memo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word_id: item.word_id }),
      });
      const json = await res.json();
      if (json.code === 200) {
        setReviewData(json.data);
      } else {
        message.error(json.msg || '获取记忆素材失败');
      }
    } catch (err) {
      message.error('AI 接口请求失败');
      console.error('review error:', err);
    } finally {
      setReviewLoading(false);
    }
  };

  const handlePageChange = (p, s) => {
    setPage(p);
    setSize(s);
  };

  if (!userId) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" tip="正在校验登录状态..." />
      </div>
    );
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 8 }}>
        <HistoryOutlined style={{ marginRight: 8 }} />
        背诵历史
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24, fontSize: 15 }}>
        以下是你的全部学习记录，点击"复习"可重新查看 AI 记忆素材
      </Text>

      {loading ? (
        <div>
          {[1, 2, 3].map((i) => (
            <Card key={i} style={{ marginBottom: 12 }}>
              <Skeleton active paragraph={{ rows: 2 }} />
            </Card>
          ))}
        </div>
      ) : records.length === 0 ? (
        <Empty
          description="还没有背诵记录，去首页选个单词开始吧！"
          style={{ marginTop: 60 }}
        >
          <Button type="primary" onClick={() => router.push('/')}>
            去背单词
          </Button>
        </Empty>
      ) : (
        <>
          {records.map((item) => (
            <Card
              key={item.id}
              hoverable
              style={{ borderRadius: 12, marginBottom: 12 }}
              extra={
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => handleReview(item)}
                >
                  复习
                </Button>
              }
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                <Title level={4} style={{ margin: 0 }}>{item.word}</Title>
                <Text type="secondary">{item.phonetic}</Text>
                {item.part_of_speech && (
                  <Tag color={getPosColor(item.part_of_speech)}>{item.part_of_speech}</Tag>
                )}
              </div>
              <Text style={{ fontSize: 15 }}>{item.meaning}</Text>
              <br />
              <Space style={{ marginTop: 8 }}>
                <Tag color="blue">已复习 {item.review_count} 次</Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {item.last_reviewed_at ? new Date(item.last_reviewed_at).toLocaleString('zh-CN') : ''}
                </Text>
              </Space>
            </Card>
          ))}

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Pagination
              current={page}
              pageSize={size}
              total={total}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={['5', '10', '20']}
              showTotal={(t) => `共 ${t} 条记录`}
            />
          </div>
        </>
      )}

      {/* 复习弹窗 */}
      <Modal
        title={reviewWord ? `复习 "${reviewWord.word}"` : '复习记忆素材'}
        open={reviewModalOpen}
        onCancel={() => setReviewModalOpen(false)}
        footer={
          <Button onClick={() => {
            setReviewModalOpen(false);
            setReviewData(null);
          }}>关闭</Button>
        }
        width={640}
        destroyOnClose
      >
        {reviewLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin tip="正在加载记忆素材..." size="large">
              <div style={{ height: 80 }} />
            </Spin>
          </div>
        ) : reviewData ? (
          <div style={{ lineHeight: 2 }}>
            <Title level={5}>词根 / 词缀解析</Title>
            <Paragraph>{reviewData.root_analysis}</Paragraph>
            <Title level={5}>趣味记忆口诀</Title>
            <Paragraph style={{ background: '#fff7e6', padding: '10px 14px', borderRadius: 8 }}>
              {reviewData.mnemonic}
            </Paragraph>
            <Title level={5}>日常例句</Title>
            <Paragraph>{reviewData.extra_example}</Paragraph>
          </div>
        ) : (
          <Empty description="未能获取记忆素材" />
        )}
      </Modal>
    </div>
  );
}
