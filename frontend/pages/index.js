import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card, Typography, Skeleton, Row, Col,
  Pagination, Button, Space, Input, Tag, Tooltip
} from 'antd';
import { SoundOutlined, ReloadOutlined, SearchOutlined, CheckOutlined, UndoOutlined } from '@ant-design/icons';
import { showError, showWarning, showSuccess } from '@/utils/errorHandler';
import { authHeaders } from '@/utils/auth';
import AIMemoModal from '@/components/AIMemoModal';

const { Title, Text } = Typography;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:5000';

export default function Home() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(6);
  const [keyword, setKeyword] = useState('');

  const debounceTimer = useRef(null);
  const searchValRef = useRef('');

  // AI 弹窗
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [currentWord, setCurrentWord] = useState(null);
  const [fetchError, setFetchError] = useState(false);

  const fetchWords = useCallback(async (p, s, kw) => {
    setLoading(true);
    setFetchError(false);
    try {
      let url = `${API_BASE}/api/words?page=${p}&size=${s}`;
      if (kw) url += `&keyword=${encodeURIComponent(kw)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.code === 200 && json.data) {
        setWords(json.data.list || []);
        setTotal(json.data.total || 0);
      } else {
        showWarning(json.msg || '获取单词列表失败，请稍后重试');
      }
    } catch (err) {
      setFetchError(true);
      showError(err, '无法连接后端服务，请确认 Flask 已启动');
    } finally {
      setLoading(false);
    }
  }, []);

  // 统一防抖：page/size/keyword 任一变化都 300ms 防抖请求
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchWords(page, size, keyword), 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [page, size, keyword, fetchWords]);

  // 搜索输入防抖（仅触发一次 keyword 变化）
  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      searchValRef.current = val;
      setKeyword(val);
      setPage(1);
    }, 400);
  }, []);

  const closeAiModal = useCallback(() => {
    setAiModalOpen(false);
    setCurrentWord(null);
  }, []);

  const handleCardClick = useCallback((item) => {
    setCurrentWord(item);
    setAiModalOpen(true);
  }, []);

  const handlePageChange = useCallback((p, s) => {
    setPage(p);
    setSize(s);
  }, []);

  // 单词掌握状态切换
  const [statusUpdating, setStatusUpdating] = useState({});
  const toggleReviewStatus = useCallback(async (e, item) => {
    e.stopPropagation();
    setStatusUpdating(prev => ({ ...prev, [item.id]: true }));
    try {
      const newStatus = (item.review_status === 1) ? 0 : 1;
      const res = await fetch(`${API_BASE}/api/words/${item.id}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ review_status: newStatus }),
      });
      const json = await res.json();
      if (json.code === 200) {
        setWords(prev => prev.map(w => w.id === item.id ? { ...w, review_status: newStatus } : w));
        newStatus === 1 ? showSuccess('已标记为"已掌握"') : showWarning('已标记为"待复习"');
      } else {
        showError(json.msg || '状态更新失败');
      }
    } catch (err) {
      showError(err, '状态更新失败，请稍后重试');
    } finally {
      setStatusUpdating(prev => ({ ...prev, [item.id]: false }));
    }
  }, []);

  // 渲染加载骨架
  const renderSkeleton = () => (
    <Row gutter={[16, 16]}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Col xs={24} sm={12} lg={8} key={i}>
          <Card>
            <Skeleton
              active
              paragraph={{ rows: 3 }}
              title={{ width: '40%' }}
              avatar={{ shape: 'square', style: { borderRadius: 8, width: 36, height: 36 } }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );

  // 渲染错误状态
  const renderError = () => (
    <div className="error-state">
      <div className="error-icon">!</div>
      <span className="error-text">无法连接后端服务，请确认 Flask 已启动</span>
      <Button icon={<ReloadOutlined />} type="primary" onClick={() => fetchWords(page, size, keyword)}>
        重新加载
      </Button>
    </div>
  );

  // 渲染空状态
  const renderEmpty = () => (
    <div className="empty-state">
      <div className="empty-icon type-search">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
      </div>
      <div className="empty-text">
        {keyword ? `未找到包含"${keyword}"的单词` : '暂无单词数据，请先在 Supabase 导入单词'}
      </div>
      {keyword && (
        <div className="empty-actions">
          <Button onClick={() => { setKeyword(''); setPage(1); }}>清除搜索</Button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* 页面标题 */}
      <div className="page-header">
        <h1 className="page-title">单词记忆</h1>
        <p className="page-subtitle">
          点击单词卡片获取 AI 生成趣味记忆素材，或使用搜索框快速查找单词
        </p>
      </div>

      {/* 搜索框 */}
      <div className="search-input-wrapper" style={{ marginBottom: 24 }}>
        <Input
          size="large"
          placeholder="搜索单词或释义（如：abandon / 放弃）"
          prefix={<SearchOutlined style={{ color: 'var(--text-tertiary)' }} />}
          onChange={handleSearchChange}
          allowClear
          style={{ maxWidth: 480, height: 46 }}
        />
      </div>

      {/* 内容区 */}
      {loading ? renderSkeleton() : fetchError ? renderError() : words.length === 0 ? renderEmpty() : (
        <>
          <Row gutter={[16, 16]}>
            {words.map((item) => (
              <Col xs={24} sm={12} lg={8} key={item.id}>
                <Card
                  hoverable
                  onClick={() => handleCardClick(item)}
                  style={{ height: '100%', cursor: 'pointer' }}
                >
                  {/* 单词头部 */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                      <h3 style={{
                        margin: 0, color: 'var(--primary)', fontSize: 20, fontWeight: 600,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {item.word}
                      </h3>
                      <Tooltip title="点击发音（开发中）">
                        <SoundOutlined style={{ color: 'var(--primary-lighter)', fontSize: 16, flexShrink: 0 }} />
                      </Tooltip>
                    </div>
                    {/* 复习状态小标签 */}
                    {item.review_status === 1 && (
                      <span className="status-tag mastered" style={{ flexShrink: 0, marginLeft: 8 }}>
                        <CheckOutlined style={{ fontSize: 10 }} /> 已掌握
                      </span>
                    )}
                  </div>

                  {/* 音标 */}
                  <Text style={{ fontSize: 13, color: 'var(--text-tertiary)', display: 'block', marginBottom: 10 }}>
                    {item.phonetic || '—'}
                  </Text>

                  {/* 释义 */}
                  <div style={{
                    padding: '10px 14px',
                    background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
                    borderRadius: 10,
                    marginBottom: 12,
                  }}>
                    <Text style={{
                      fontSize: 'var(--font-body)', color: 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      lineHeight: 1.6
                    }}>
                      {item.basic_meaning}
                    </Text>
                  </div>

                  {/* 底部操作区 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                      size="small"
                      type={item.review_status === 1 ? 'default' : 'primary'}
                      icon={item.review_status === 1 ? <UndoOutlined /> : <CheckOutlined />}
                      loading={!!statusUpdating[item.id]}
                      onClick={(e) => toggleReviewStatus(e, item)}
                      style={{
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 500,
                        ...(item.review_status === 1 ? { color: 'var(--success)', borderColor: 'var(--success)' } : {}),
                      }}
                    >
                      {item.review_status === 1 ? '取消掌握' : '标记掌握'}
                    </Button>
                    <Text style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>点击查看详解 →</Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* 分页 */}
          <div style={{ textAlign: 'center', marginTop: 32, paddingBottom: 4 }}>
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
      <AIMemoModal
        open={aiModalOpen}
        word={currentWord}
        onClose={closeAiModal}
        showSaveBtn
      />
    </div>
  );
}
