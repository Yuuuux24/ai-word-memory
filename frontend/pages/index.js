import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card, Typography, Skeleton, Row, Col,
  Modal, Spin, Pagination, Button, Space, Divider, Progress, Input
} from 'antd';
import { SoundOutlined, SaveOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { showError, showWarning, showSuccess, showInfo } from '@/utils/errorHandler';

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
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [currentWord, setCurrentWord] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [aiTimeout, setAiTimeout] = useState(false);
  const [aiCountdown, setAiCountdown] = useState(0);
  const aiTimerRef = useRef(null);
  const aiCountdownRef = useRef(null);
  const aiAbortRef = useRef(null);

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

  useEffect(() => {
    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      if (aiCountdownRef.current) clearInterval(aiCountdownRef.current);
      if (aiAbortRef.current) aiAbortRef.current.abort();
    };
  }, []);

  const closeAiModal = useCallback(() => {
    setAiModalOpen(false);
    setAiData(null);
    setCurrentWord(null);
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    if (aiCountdownRef.current) clearInterval(aiCountdownRef.current);
    if (aiAbortRef.current) aiAbortRef.current.abort();
  }, []);

  const handleCardClick = useCallback(async (item) => {
    setCurrentWord(item);
    setAiModalOpen(true);
    setAiLoading(true);
    setAiData(null);
    setAiTimeout(false);
    setAiCountdown(0);

    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    if (aiCountdownRef.current) clearInterval(aiCountdownRef.current);

    let countdown = Math.ceil(AI_TIMEOUT / 1000);
    setAiCountdown(countdown);
    aiCountdownRef.current = setInterval(() => {
      countdown--;
      setAiCountdown(countdown);
      if (countdown <= 0) clearInterval(aiCountdownRef.current);
    }, 1000);

    aiTimerRef.current = setTimeout(() => {
      setAiTimeout(true);
      setAiLoading(false);
      if (aiAbortRef.current) aiAbortRef.current.abort();
      clearInterval(aiCountdownRef.current);
    }, AI_TIMEOUT);

    aiAbortRef.current = new AbortController();

    try {
      const res = await fetch(`${API_BASE}/api/ai/memo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word_id: item.id }),
        signal: aiAbortRef.current.signal,
      });
      clearTimeout(aiTimerRef.current);
      clearInterval(aiCountdownRef.current);
      const json = await res.json();
      if (json.code === 200) {
        setAiData(json.data);
      } else {
        showError(json.msg || 'AI 生成失败，请稍后重试');
      }
    } catch (err) {
      clearTimeout(aiTimerRef.current);
      clearInterval(aiCountdownRef.current);
      if (err.name !== 'AbortError') {
        showError(err, 'AI 生成失败，请稍后重试');
      }
    } finally {
      setAiLoading(false);
    }
  }, []);

  const handlePageChange = useCallback((p, s) => {
    setPage(p);
    setSize(s);
  }, []);

  const saveStudyRecord = useCallback(async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      showInfo('请先登录再保存学习记录，点击顶部「用户登录」');
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
        showSuccess(json.msg || '学习记录已保存');
      } else {
        showError(json.msg || '保存失败，请稍后重试');
      }
    } catch (err) {
      showError(err, '保存学习记录失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  }, [currentWord]);

  // Actually let me use the imported showSuccess... let me import message directly
  const retryAi = useCallback(() => {
    if (currentWord) handleCardClick(currentWord);
  }, [currentWord, handleCardClick]);

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
                  <div style={{ marginTop: 10, fontSize: 12, color: '#b0b0b0', textAlign: 'right' }}>点击查看 AI 记忆口诀 →</div>
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
        title={<span style={{ fontSize: 18 }}>{currentWord ? `"${currentWord.word}" AI 记忆素材` : 'AI 记忆素材'}</span>}
        open={aiModalOpen}
        onCancel={closeAiModal}
        footer={
          <Space>
            <Button icon={<SaveOutlined />} type="primary" loading={saving} onClick={saveStudyRecord}>保存学习记录</Button>
            <Button onClick={closeAiModal}>关闭</Button>
          </Space>
        }
        width={680}
        destroyOnClose
        style={{ top: 40 }}
      >
        {aiLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 20, color: '#8c8c8c', fontSize: 14 }}>AI 正在生成记忆素材... 超时剩余 {aiCountdown} 秒</div>
            <Progress percent={Math.max(0, Math.round(((AI_TIMEOUT / 1000 - aiCountdown) / (AI_TIMEOUT / 1000)) * 100))} showInfo={false} strokeColor={{ from: '#6c7cfc', to: '#8b98ff' }} style={{ maxWidth: 300, margin: '12px auto 0' }} />
          </div>
        ) : aiTimeout ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#ff7875' }}>!</div>
            <Text type="secondary" style={{ fontSize: 15, display: 'block', marginBottom: 20 }}>AI 生成超时，请稍后重试</Text>
            <Button type="primary" icon={<ReloadOutlined />} onClick={retryAi}>重新生成</Button>
          </div>
        ) : aiData ? (
          <div style={{ lineHeight: 1.8 }}>
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 4, height: 16, borderRadius: 2, background: 'linear-gradient(180deg, #6c7cfc 0%, #8b98ff 100%)' }} />
                <Text strong style={{ fontSize: 15, color: '#4a54c9' }}>词根 / 词缀解析</Text>
              </div>
              <div style={{ padding: '12px 16px', background: '#fafbff', borderRadius: 10, border: '1px solid #f0f2ff', fontSize: 14, color: '#555' }}>{aiData.root_analysis}</div>
            </div>
            <Divider style={{ margin: '16px 0' }} />
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 4, height: 16, borderRadius: 2, background: 'linear-gradient(180deg, #f5a623 0%, #ffc53d 100%)' }} />
                <Text strong style={{ fontSize: 15, color: '#d48806' }}>趣味记忆口诀</Text>
              </div>
              <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%)', borderRadius: 10, border: '1px solid #ffe58f', fontSize: 14, color: '#5c4a00', lineHeight: 1.8 }}>{aiData.mnemonic}</div>
            </div>
            <Divider style={{ margin: '16px 0' }} />
            <div style={{ marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 4, height: 16, borderRadius: 2, background: 'linear-gradient(180deg, #52c41a 0%, #73d13d 100%)' }} />
                <Text strong style={{ fontSize: 15, color: '#389e0d' }}>日常例句</Text>
              </div>
              <div style={{ padding: '12px 16px', background: '#f6ffed', borderRadius: 10, border: '1px solid #d9f7be', fontSize: 14, color: '#3d5a1e', fontStyle: 'italic' }}>{aiData.extra_example}</div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Text type="secondary" style={{ fontSize: 15 }}>未能获取 AI 记忆素材</Text>
            <br />
            <Button type="link" icon={<ReloadOutlined />} style={{ marginTop: 12 }} onClick={retryAi}>重试</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
