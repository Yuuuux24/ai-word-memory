import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card, Typography, Skeleton, Select, Popconfirm, Spin, message,
  Pagination, Button, Space, DatePicker
} from 'antd';
import { HistoryOutlined, EyeOutlined, CalendarOutlined, FilterOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { showError, showWarning, showInfo } from '@/utils/errorHandler';
import AIMemoModal from '@/components/AIMemoModal';
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
  const [reviewStatusFilter, setReviewStatusFilter] = useState(undefined); // 0=待复习, 1=已掌握, undefined=全部

  const debounceTimer = useRef(null);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewWord, setReviewWord] = useState(null);

  useEffect(() => {
    const uid = localStorage.getItem('user_id');
    if (!uid) {
      showInfo('请先登录再查看背诵历史');
      setTimeout(() => router.push('/login'), 800);
      return;
    }
    setUserId(Number(uid));
  }, [router]);

  const fetchRecords = useCallback(async (p, s, date, rs) => {
    setLoading(true);
    try {
      let url = `${API_BASE}/api/study/list?user_id=${userId}&page=${p}&size=${s}`;
      if (date) url += `&date=${dayjs(date).format('YYYY-MM-DD')}`;
      if (rs !== undefined && rs !== null) url += `&review_status=${rs}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.code === 200 && json.data) {
        setRecords(json.data.list || []);
        setTotal(json.data.total || 0);
      } else {
        showWarning(json.msg || '获取学习记录失败，请稍后重试');
      }
    } catch (err) {
      showError(err, '无法连接后端服务');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => fetchRecords(page, size, filterDate, reviewStatusFilter), 300);
      return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
    }
  }, [userId, page, size, filterDate, reviewStatusFilter, fetchRecords]);

  const handleReview = useCallback((item) => {
    setReviewWord({ id: item.word_id, word: item.word });
    setReviewModalOpen(true);
  }, []);

  const handlePageChange = useCallback((p, s) => {
    setPage(p);
    setSize(s);
  }, []);

  const handleDateChange = useCallback((date) => {
    setFilterDate(date);
    setPage(1);
  }, []);

  const clearDateFilter = useCallback(() => {
    setFilterDate(null);
    setPage(1);
  }, []);

  const closeReviewModal = useCallback(() => {
    setReviewModalOpen(false);
    setReviewWord(null);
  }, []);

  const handleDeleteRecord = useCallback(async (recordId) => {
    try {
      const res = await fetch(`${API_BASE}/api/study/${recordId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.code === 200) {
        message.success(json.msg || '记录已删除');
        setRecords(prev => prev.filter(r => r.id !== recordId));
        setTotal(prev => prev - 1);
      } else {
        showError(json.msg || '删除失败，请稍后重试');
      }
    } catch (err) {
      showError(err, '删除学习记录失败，请稍后重试');
    }
  }, []);

  if (!userId) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 20, color: '#8c8c8c', fontSize: 14 }}>正在校验登录状态...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2, flexWrap: 'wrap' }}>
          <HistoryOutlined style={{ fontSize: 22, color: '#6c7cfc' }} />
          <Title level={2} style={{ margin: 0, fontSize: 24 }}>背诵历史</Title>
        </div>
        <Text type="secondary" style={{ fontSize: 14 }}>以下是你的全部学习记录，点击「复习」可重新查看 AI 记忆素材</Text>

        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <CalendarOutlined style={{ color: '#6c7cfc', fontSize: 16 }} />
          <DatePicker
            value={filterDate}
            onChange={handleDateChange}
            placeholder="按日期筛选学习记录"
            style={{ borderRadius: 8 }}
            allowClear={false}
          />
          <FilterOutlined style={{ color: '#6c7cfc', fontSize: 16, marginLeft: 4 }} />
          <Select
            value={reviewStatusFilter}
            onChange={(val) => { setReviewStatusFilter(val); setPage(1); }}
            placeholder="复习状态"
            style={{ width: 130, borderRadius: 8 }}
            allowClear
            onClear={() => { setReviewStatusFilter(undefined); setPage(1); }}
            options={[
              { value: 0, label: '待复习' },
              { value: 1, label: '已掌握' },
            ]}
          />
          {(filterDate || reviewStatusFilter !== undefined) && (
            <Button size="small" onClick={() => { clearDateFilter(); setReviewStatusFilter(undefined); }}>
              清除全部筛选
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div>
          {[1, 2, 3].map((i) => (
            <Card key={i} style={{ marginBottom: 12 }}><Skeleton active paragraph={{ rows: 2 }} title={{ width: '30%' }} /></Card>
          ))}
        </div>
      ) : records.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #f0f2ff 0%, #e8ebff 100%)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#bcc3ff' }}>?</div>
          <Text type="secondary" style={{ fontSize: 15, display: 'block', marginBottom: 16 }}>
            {filterDate ? '该日期没有学习记录' : '还没有背诵记录，去首页选个单词开始吧！'}
          </Text>
          <Space>
            {filterDate && <Button onClick={clearDateFilter}>查看全部记录</Button>}
            <Button type="primary" onClick={() => router.push('/')}>去背单词</Button>
          </Space>
        </div>
      ) : (
        <>
          {records.map((item) => (
            <Card key={item.id} hoverable style={{ borderRadius: 14, marginBottom: 12, border: '1px solid #f0f0f0' }}
              extra={
                <Space>
                  <Button type="link" icon={<EyeOutlined />} onClick={() => handleReview(item)} style={{ color: '#6c7cfc' }}>复习</Button>
                  <Popconfirm title="确定删除此学习记录？" onConfirm={() => handleDeleteRecord(item.id)} okText="删除" cancelText="取消">
                    <Button type="link" danger icon={<DeleteOutlined />} size="small">删除</Button>
                  </Popconfirm>
                </Space>
              }>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                <Title level={4} style={{ margin: 0, color: '#4a54c9', fontSize: 18 }}>{item.word}</Title>
                <Text type="secondary" style={{ fontSize: 13 }}>{item.phonetic}</Text>
                {item.review_status !== undefined && item.review_status !== null && (
                  <span style={{
                    fontSize: 12,
                    padding: '1px 8px',
                    borderRadius: 4,
                    background: item.review_status === 1 ? '#f6ffed' : '#fff7e6',
                    color: item.review_status === 1 ? '#52c41a' : '#faad14',
                    border: `1px solid ${item.review_status === 1 ? '#b7eb8f' : '#ffe58f'}`,
                  }}>
                    {item.review_status === 1 ? '已掌握' : '待复习'}
                  </span>
                )}
              </div>
              <div style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)', borderRadius: 8, display: 'inline-block' }}>
                <Text style={{ fontSize: 14, color: '#4a4a4a' }}>{item.meaning}</Text>
              </div>
              <div style={{ marginTop: 10 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  {item.study_date ? new Date(item.study_date).toLocaleString('zh-CN') : ''}
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
      <AIMemoModal
        open={reviewModalOpen}
        word={reviewWord}
        onClose={closeReviewModal}
        showSaveBtn={false}
      />
    </div>
  );
}
