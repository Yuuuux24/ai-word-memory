import { useState, useEffect, useRef } from 'react';
import {
  Card, Typography, Empty, Skeleton,
  Pagination, message, Modal, Spin, Button, Space, Divider, DatePicker
} from 'antd';
import { HistoryOutlined, EyeOutlined, ReloadOutlined, CalendarOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { showError, showWarning } from '@/utils/errorHandler';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:5000';

export default function History() {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [userId, setUserId] = useState(null);
  const [filterDate, setFilterDate] = useState(null);

  // 分页防抖
  const debounceTimer = useRef(null);

  // AI 复习弹窗
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [reviewWord, setReviewWord] = useState(null);

  useEffect(() => {
    const uid = localStorage.getItem('user_id');
    if (!uid) {
      showWarning('请先登录再查看背诵历史');
      setTimeout(() => router.push('/login'), 800);
      return;
    }
    setUserId(Number(uid));
  }, []);

  useEffect(() => {
    if (userId) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => fetchRecords(page, size, filterDate), 300);
      return () => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
      };
    }
  }, [userId, page, size, filterDate]);

  const fetchRecords = async (p, s, date) => {
    setLoading(true);
    try {
      let url = `${API_BASE}/api/study/list?user_id=${userId}&page=${p}&size=${s}`;
      if (date) {
        url += `&date=${dayjs(date).format('YYYY-MM-DD')}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      if (json.code === 200 && json.data) {
        setRecords(json.data.list || []);
        setTotal(json.data.total || 0);
      } else {
        showWarning(json.msg || '获取学习记录失败');
      }
    } catch (err) {
      showError(err, '无法连接后端服务');
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
        showError(json.msg || '获取记忆素材失败');
      }
    } catch (err) {
      showError(err, 'AI 接口请求失败');
    } finally {
      setReviewLoading(false);
    }
  };

  const handlePageChange = (p, s) => {
    setPage(p);
    setSize(s);
  };

  const handleDateChange = (date) => {
    setFilterDate(date);
    setPage(1); // 切换日期重置到第一页
  };

  const clearDateFilter = () => {
    setFilterDate(null);
    setPage(1);
  };

  if (!userId) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 20, color: '#8c8c8c', fontSize: 15 }}>
          正在校验登录状态...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
          <HistoryOutlined style={{ fontSize: 22, color: '#6c7cfc' }} />
          <Title level={2} style={{ margin: 0 }}>背诵历史</Title>
        </div>
        <Text type="secondary" style={{ fontSize: 14 }}>
          以下是你的全部学习记录，点击「复习」可重新查看 AI 记忆素材
        </Text>

        {/* 日期筛选 */}
        <div
          style={{
            marginTop: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <CalendarOutlined style={{ color: '#6c7cfc', fontSize: 16 }} />
          <DatePicker
            value={filterDate}
            onChange={handleDateChange}
            placeholder="按日期筛选学习记录"
            style={{ borderRadius: 8 }}
            allowClear={false}
          />
          {filterDate && (
            <Button size="small" onClick={clearDateFilter}>
              清除筛选
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div>
          {[1, 2, 3].map((i) => (
            <Card key={i} style={{ marginBottom: 12 }}>
              <Skeleton active paragraph={{ rows: 2 }} title={{ width: '30%' }} />
            </Card>
          ))}
        </div>
      ) : records.length === 0 ? (
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
          <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
            {filterDate ? '该日期没有学习记录' : '还没有背诵记录，去首页选个单词开始吧！'}
          </Text>
          <Space>
            {filterDate && (
              <Button onClick={clearDateFilter}>查看全部记录</Button>
            )}
            <Button type="primary" onClick={() => router.push('/')}>
              去背单词
            </Button>
          </Space>
        </div>
      ) : (
        <>
          {records.map((item) => (
            <Card
              key={item.id}
              hoverable
              style={{
                borderRadius: 14,
                marginBottom: 12,
                border: '1px solid #f0f0f0',
              }}
              extra={
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => handleReview(item)}
                  style={{ color: '#6c7cfc' }}
                >
                  复习
                </Button>
              }
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 12,
                  marginBottom: 8,
                  flexWrap: 'wrap',
                }}
              >
                <Title level={4} style={{ margin: 0, color: '#4a54c9' }}>
                  {item.word}
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {item.phonetic}
                </Text>
              </div>
              <div
                style={{
                  padding: '8px 14px',
                  background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
                  borderRadius: 8,
                  display: 'inline-block',
                }}
              >
                <Text style={{ fontSize: 15, color: '#4a4a4a' }}>
                  {item.meaning}
                </Text>
              </div>
              <div style={{ marginTop: 10 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  {item.study_date
                    ? new Date(item.study_date).toLocaleString('zh-CN')
                    : ''}
                </Text>
              </div>
            </Card>
          ))}

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <Pagination
              current={page}
              pageSize={size}
              total={total}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={['5', '10', '20']}
              showTotal={(t) => `共 ${t} 条记录`}
              responsive
            />
          </div>
        </>
      )}

      {/* 复习弹窗 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>
              {reviewWord ? `复习 "${reviewWord.word}"` : '复习记忆素材'}
            </span>
          </div>
        }
        open={reviewModalOpen}
        onCancel={() => { setReviewModalOpen(false); setReviewData(null); }}
        footer={
          <Button onClick={() => { setReviewModalOpen(false); setReviewData(null); }}>
            关闭
          </Button>
        }
        width={680}
        destroyOnClose
        style={{ top: 40 }}
      >
        {reviewLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 20, color: '#8c8c8c', fontSize: 15 }}>
              正在加载记忆素材...
            </div>
          </div>
        ) : reviewData ? (
          <div style={{ lineHeight: 1.8 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 4, height: 18, borderRadius: 2, background: 'linear-gradient(180deg, #6c7cfc 0%, #8b98ff 100%)' }} />
                <Text strong style={{ fontSize: 15, color: '#4a54c9' }}>词根 / 词缀解析</Text>
              </div>
              <div style={{ padding: '12px 16px', background: '#fafbff', borderRadius: 10, border: '1px solid #f0f2ff', fontSize: 14, color: '#555' }}>
                {reviewData.root_analysis}
              </div>
            </div>
            <Divider style={{ margin: '16px 0', borderColor: '#f0f0f0' }} />
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 4, height: 18, borderRadius: 2, background: 'linear-gradient(180deg, #f5a623 0%, #ffc53d 100%)' }} />
                <Text strong style={{ fontSize: 15, color: '#d48806' }}>趣味记忆口诀</Text>
              </div>
              <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%)', borderRadius: 10, border: '1px solid #ffe58f', fontSize: 14, color: '#5c4a00', lineHeight: 1.8 }}>
                {reviewData.mnemonic}
              </div>
            </div>
            <Divider style={{ margin: '16px 0', borderColor: '#f0f0f0' }} />
            <div style={{ marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 4, height: 18, borderRadius: 2, background: 'linear-gradient(180deg, #52c41a 0%, #73d13d 100%)' }} />
                <Text strong style={{ fontSize: 15, color: '#389e0d' }}>日常例句</Text>
              </div>
              <div style={{ padding: '12px 16px', background: '#f6ffed', borderRadius: 10, border: '1px solid #d9f7be', fontSize: 14, color: '#3d5a1e', fontStyle: 'italic' }}>
                {reviewData.extra_example}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Text type="secondary" style={{ fontSize: 15 }}>未能获取记忆素材</Text>
            <br />
            <Button type="link" icon={<ReloadOutlined />} style={{ marginTop: 12 }} onClick={() => reviewWord && handleReview(reviewWord)}>
              重试
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
