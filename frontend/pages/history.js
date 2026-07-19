import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card, Typography, Skeleton, Select, Popconfirm, Spin,
  Pagination, Button, Space, DatePicker
} from 'antd';
import { HistoryOutlined, EyeOutlined, CalendarOutlined, FilterOutlined, DeleteOutlined, BookOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { showError, showWarning, showInfo } from '@/utils/errorHandler';
import { getToken, getUserId, authHeaders } from '@/utils/auth';
import AIMemoModal from '@/components/AIMemoModal';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

export default function History() {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [userId, setUserId] = useState(null);
  const [filterDate, setFilterDate] = useState(null);
  const [reviewStatusFilter, setReviewStatusFilter] = useState(undefined);

  const debounceTimer = useRef(null);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewWord, setReviewWord] = useState(null);

  useEffect(() => {
    const uid = getUserId();
    if (!uid || !getToken()) {
      showInfo('请先登录再查看背诵历史');
      setTimeout(() => router.push('/login'), 800);
      return;
    }
    setUserId(uid);
  }, [router]);

  const fetchRecords = useCallback(async (p, s, date, rs) => {
    setLoading(true);
    try {
      let url = `${API_BASE}/api/study/list?page=${p}&size=${s}`;
      if (date) url += `&date=${dayjs(date).format('YYYY-MM-DD')}`;
      if (rs !== undefined && rs !== null) url += `&review_status=${rs}`;
      const res = await fetch(url, { headers: authHeaders() });
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
  }, []);

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
      const res = await fetch(`${API_BASE}/api/study/${recordId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json.code === 200) {
        showInfo(json.msg || '记录已删除');
        setRecords(prev => prev.filter(r => r.id !== recordId));
        setTotal(prev => prev - 1);
      } else {
        showError(json.msg || '删除失败，请稍后重试');
      }
    } catch (err) {
      showError(err, '删除学习记录失败，请稍后重试');
    }
  }, []);

  // 加载中 - 过渡
  if (!userId) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 20, color: 'var(--text-secondary)', fontSize: 14 }}>
          正在校验登录状态...
        </div>
      </div>
    );
  }

  // 空状态
  const renderEmpty = () => (
    <div className="empty-state">
      <div className="empty-icon type-search">
        <BookOutlined style={{ fontSize: 32 }} />
      </div>
      <div className="empty-text">
        {filterDate || reviewStatusFilter !== undefined
          ? '没有符合当前筛选条件的学习记录'
          : '还没有背诵记录，去首页选个单词开始吧！'}
      </div>
      <div className="empty-actions">
        {(filterDate || reviewStatusFilter !== undefined) && <Button onClick={() => { clearDateFilter(); setReviewStatusFilter(undefined); }}>清除全部筛选</Button>}
        <Button type="primary" onClick={() => router.push('/')}>去背单词</Button>
      </div>
    </div>
  );

  // 加载骨架
  const renderSkeleton = () => (
    <div>
      {[1, 2, 3].map((i) => (
        <Card key={i} style={{ marginBottom: 12 }}>
          <Skeleton active paragraph={{ rows: 2 }} title={{ width: '30%' }} />
        </Card>
      ))}
    </div>
  );

  return (
    <div>
      {/* 页面标题 */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2, flexWrap: 'wrap' }}>
          <HistoryOutlined style={{ fontSize: 24, color: 'var(--primary)' }} />
          <h1 className="page-title" style={{ margin: 0 }}>背诵历史</h1>
        </div>
        <p className="page-subtitle">
          以下是你的全部学习记录，点击「复习」可重新查看 AI 记忆素材
        </p>
      </div>

      {/* 筛选区 */}
      <div style={{
        marginBottom: 24, padding: '16px 20px',
        background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)',
        borderRadius: 14, border: '1px solid var(--border-light)',
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        <CalendarOutlined style={{ color: 'var(--primary)', fontSize: 16 }} />
        <DatePicker
          value={filterDate}
          onChange={handleDateChange}
          placeholder="按日期筛选学习记录"
          style={{ borderRadius: 10 }}
          allowClear={false}
        />
        <FilterOutlined style={{ color: 'var(--primary)', fontSize: 16, marginLeft: 4 }} />
        <Select
          value={reviewStatusFilter}
          onChange={(val) => { setReviewStatusFilter(val); setPage(1); }}
          placeholder="复习状态"
          style={{ width: 130 }}
          allowClear
          onClear={() => { setReviewStatusFilter(undefined); setPage(1); }}
          options={[
            { value: 0, label: '待复习' },
            { value: 1, label: '已掌握' },
          ]}
        />
        {(filterDate || reviewStatusFilter !== undefined) && (
          <Button
            size="small"
            onClick={() => { clearDateFilter(); setReviewStatusFilter(undefined); }}
            style={{ borderRadius: 8 }}
          >
            清除全部筛选
          </Button>
        )}
      </div>

      {/* 内容区 */}
      {loading ? renderSkeleton() : records.length === 0 ? renderEmpty() : (
        <>
          {records.map((item) => (
            <Card
              key={item.id}
              hoverable
              style={{ borderRadius: 14, marginBottom: 12 }}
              extra={
                <Space size={8}>
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => handleReview(item)}
                    style={{ color: 'var(--primary)', fontWeight: 500 }}
                  >
                    复习
                  </Button>
                  <Popconfirm
                    title="确定删除此学习记录？"
                    onConfirm={() => handleDeleteRecord(item.id)}
                    okText="删除"
                    cancelText="取消"
                  >
                    <Button type="link" danger icon={<DeleteOutlined />} size="small">删除</Button>
                  </Popconfirm>
                </Space>
              }
            >
              {/* 单词头部 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                <Title level={4} style={{ margin: 0, color: 'var(--primary)', fontSize: 18, fontWeight: 600 }}>
                  {item.word}
                </Title>
                <Text style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{item.phonetic}</Text>
                {item.review_status !== undefined && item.review_status !== null && (
                  <span className={`status-tag ${item.review_status === 1 ? 'mastered' : 'review'}`}>
                    {item.review_status === 1 ? '已掌握' : '待复习'}
                  </span>
                )}
              </div>

              {/* 释义 */}
              <div style={{
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
                borderRadius: 10,
                marginBottom: 12,
                display: 'inline-block',
                maxWidth: '100%',
              }}>
                <Text style={{
                  fontSize: 14, color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                  {item.meaning}
                </Text>
              </div>

              {/* 日期 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CalendarOutlined style={{ color: 'var(--text-tertiary)', fontSize: 12 }} />
                <Text style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  {item.study_date ? dayjs(item.study_date).format('YYYY-MM-DD HH:mm') : ''}
                </Text>
              </div>
            </Card>
          ))}

          {/* 分页 */}
          <div style={{ textAlign: 'center', marginTop: 32 }}>
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
