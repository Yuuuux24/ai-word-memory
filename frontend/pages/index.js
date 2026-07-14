import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card, Typography, Skeleton, Row, Col,
  Pagination, Button, Space, Input
} from 'antd';
import { SoundOutlined, ReloadOutlined, SearchOutlined, CheckOutlined, UndoOutlined } from '@ant-design/icons';
import { showError, showWarning, showSuccess } from '@/utils/errorHandler';
import AIMemoModal from '@/components/AIMemoModal';

const { Title, Text } = Typography;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:5000';
const AI_TIMEOUT = 30000;

export default function Home() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(6);
  const [keyword, setKeyword] = useState('');

  const debounceTimer = useRef(null);
  const searchTimer = useRef(null);

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

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchWords(page, size, keyword), 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [page, size, keyword, fetchWords]);

  // 搜索输入防抖
  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
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
    e.stopPropagation(); // 阻止冒泡到卡片点击
    setStatusUpdating(prev => ({ ...prev, [item.id]: true }));
    try {
      const newStatus = (item.review_status === 1) ? 0 : 1;
      const res = await fetch(`${API_BASE}/api/words/${item.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_status: newStatus }),
      });
      const json = await res.json();
      if (json.code === 200) {
        // 本地更新状态（避免重新请求全量数据）
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

  return (
    <div>
      <Title level={2} style={{ marginBottom: 4, fontSize: 24 }}>单词记忆首页</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 20, fontSize: 14 }}>
        点击单词卡片获取 AI 生成趣味记忆素材，或使用搜索框快速查找单词
      </Text>

      {/* 搜索框 */}
      <div style={{ marginBottom: 20 }}>
        <Input
          size="large"
          placeholder="搜索单词或释义（如：abandon / 放弃）"
          prefix={<SearchOutlined style={{ color: '#b0b0b0' }} />}
          onChange={handleSearchChange}
          allowClear
          style={{ maxWidth: 480, borderRadius: 10 }}
        />
      </div>

      {loading ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Col xs={24} sm={12} lg={8} key={i}>
              <Card><Skeleton active paragraph={{ rows: 3 }} title={{ width: '40%' }} /></Card>
            </Col>
          ))}
        </Row>
      ) : fetchError ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#ff7875' }}>!</div>
          <Text type="secondary" style={{ fontSize: 15, display: 'block', marginBottom: 16 }}>无法连接后端服务，请确认 Flask 已启动</Text>
          <Button icon={<ReloadOutlined />} onClick={() => fetchWords(page, size, keyword)}>重新加载</Button>
        </div>
      ) : words.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #f0f2ff 0%, #e8ebff 100%)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#bcc3ff' }}>?</div>
          <Text type="secondary" style={{ fontSize: 15 }}>
            {keyword ? `未找到包含"${keyword}"的单词` : '暂无单词数据，请先在 Supabase 导入单词'}
          </Text>
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {words.map((item) => (
              <Col xs={24} sm={12} lg={8} key={item.id}>
                <Card hoverable onClick={() => handleCardClick(item)} style={{ borderRadius: 14, height: '100%', cursor: 'pointer', border: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <Title level={3} style={{ margin: 0, marginRight: 10, color: '#4a54c9', fontSize: 22 }}>{item.word}</Title>
                    <SoundOutlined style={{ color: '#8b98ff', fontSize: 18 }} />
                  </div>
                  <Text type="secondary" style={{ fontSize: 13 }}>{item.phonetic}</Text>
                  <div style={{ marginTop: 12, padding: '8px 12px', background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)', borderRadius: 8 }}>
                    <Text style={{ fontSize: 14, color: '#4a4a4a' }}>{item.basic_meaning}</Text>
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                      size="small"
                      type={item.review_status === 1 ? 'default' : 'primary'}
                      icon={item.review_status === 1 ? <UndoOutlined /> : <CheckOutlined />}
                      loading={!!statusUpdating[item.id]}
                      onClick={(e) => toggleReviewStatus(e, item)}
                      style={{
                        borderRadius: 6,
                        fontSize: 12,
                        ...(item.review_status === 1 ? { color: '#52c41a', borderColor: '#52c41a' } : {}),
                      }}
                    >
                      {item.review_status === 1 ? '已掌握' : '标记掌握'}
                    </Button>
                    <span style={{ fontSize: 12, color: '#b0b0b0' }}>点击查看 AI 记忆口诀 →</span>
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
      <AIMemoModal
        open={aiModalOpen}
        word={currentWord}
        onClose={closeAiModal}
        showSaveBtn
      />
    </div>
  );
}
