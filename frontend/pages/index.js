import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card, Typography, Empty, Skeleton, Row, Col,
  Modal, Spin, message, Pagination, Button, Space, Divider, Progress
} from 'antd';
import { SoundOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { showError, showWarning } from '@/utils/errorHandler';

const { Title, Text, Paragraph } = Typography;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:5000';
const AI_TIMEOUT = 30000; // AI 接口超时30秒

export default function Home() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(6);

  // 分页防抖
  const debounceTimer = useRef(null);
  const lastFetchRef = useRef(0);

  // AI 弹窗状态
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [currentWord, setCurrentWord] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // AI 超时
  const [aiTimeout, setAiTimeout] = useState(false);
  const [aiCountdown, setAiCountdown] = useState(0);
  const aiTimerRef = useRef(null);
  const aiCountdownRef = useRef(null);
  const aiAbortRef = useRef(null);

  // 页面加载拉取单词（带防抖）
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchWords(page, size), 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [page, size]);

  // 组件卸载清理
  useEffect(() => {
    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      if (aiCountdownRef.current) clearInterval(aiCountdownRef.current);
      if (aiAbortRef.current) aiAbortRef.current.abort();
    };
  }, []);

  const fetchWords = async (p, s) => {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await fetch(`${API_BASE}/api/words?page=${p}&size=${s}`);
      const json = await res.json();
      if (json.code === 200 && json.data) {
        setWords(json.data.list || []);
        setTotal(json.data.total || 0);
      } else {
        showWarning(json.msg || '获取单词列表失败');
      }
    } catch (err) {
      setFetchError(true);
      showError(err, '无法连接后端服务，请确认 Flask 已启动');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (item) => {
    setCurrentWord(item);
    setAiModalOpen(true);
    setAiLoading(true);
    setAiData(null);
    setAiTimeout(false);
    setAiCountdown(0);

    // 清理旧定时器
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    if (aiCountdownRef.current) clearInterval(aiCountdownRef.current);

    // 超时倒计时
    let countdown = Math.ceil(AI_TIMEOUT / 1000);
    setAiCountdown(countdown);
    aiCountdownRef.current = setInterval(() => {
      countdown--;
      setAiCountdown(countdown);
      if (countdown <= 0) clearInterval(aiCountdownRef.current);
    }, 1000);

    // 超时定时器
    aiTimerRef.current = setTimeout(() => {
      setAiTimeout(true);
      setAiLoading(false);
      if (aiAbortRef.current) aiAbortRef.current.abort();
      clearInterval(aiCountdownRef.current);
    }, AI_TIMEOUT);

    // AbortController 用于超时取消
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
        showError(json.msg || 'AI 接口返回异常');
      }
    } catch (err) {
      clearTimeout(aiTimerRef.current);
      clearInterval(aiCountdownRef.current);
      if (err.name !== 'AbortError') {
        showError(err, 'AI 接口请求失败');
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handlePageChange = useCallback((p, s) => {
    setPage(p);
    setSize(s);
  }, []);

  const saveStudyRecord = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      showWarning('请先登录再保存学习记录，点击顶部导航「用户登录」');
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
        message.success(json.msg || '学习记录已保存');
      } else {
        showError(json.msg || '保存失败');
      }
    } catch (err) {
      showError(err, '保存学习记录失败');
    } finally {
      setSaving(false);
    }
  };

  const retryAi = () => {
    if (currentWord) handleCardClick(currentWord);
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
                <Skeleton active paragraph={{ rows: 3 }} title={{ width: '40%' }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : fetchError ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%)',
              margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, color: '#ff7875',
            }}
          >
            !
          </div>
          <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
            无法连接后端服务，请确认 Flask 已启动
          </Text>
          <Button icon={<ReloadOutlined />} onClick={() => fetchWords(page, size)}>
            重新加载
          </Button>
        </div>
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
                  <Text type="secondary" style={{ fontSize: 13 }}>{item.phonetic}</Text>
                  <div
                    style={{
                      marginTop: 12, padding: '8px 12px',
                      background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 15, color: '#4a4a4a' }}>
                      {item.basic_meaning || item.meaning}
                    </Text>
                  </div>
                  <div style={{ marginTop: 12, fontSize: 12, color: '#b0b0b0', textAlign: 'right' }}>
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
        onCancel={() => {
          setAiModalOpen(false);
          setAiData(null);
          if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
          if (aiCountdownRef.current) clearInterval(aiCountdownRef.current);
        }}
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
            <Button
              onClick={() => {
                setAiModalOpen(false);
                setAiData(null);
              }}
            >
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
              AI 正在生成记忆素材... 预计剩余 {aiCountdown} 秒超时
            </div>
            <Progress
              percent={Math.max(0, Math.round(((AI_TIMEOUT / 1000 - aiCountdown) / (AI_TIMEOUT / 1000)) * 100))}
              showInfo={false}
              strokeColor={{ from: '#6c7cfc', to: '#8b98ff' }}
              style={{ maxWidth: 300, margin: '12px auto 0' }}
            />
          </div>
        ) : aiTimeout ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div
              style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%)',
                margin: '0 auto 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, color: '#ff7875',
              }}
            >
              !
            </div>
            <Text type="secondary" style={{ fontSize: 15, display: 'block', marginBottom: 20 }}>
              AI 生成超时，可能服务繁忙，请稍后重试
            </Text>
            <Button type="primary" icon={<ReloadOutlined />} onClick={retryAi}>
              重新生成
            </Button>
          </div>
        ) : aiData ? (
          <div style={{ lineHeight: 1.8 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 4, height: 18, borderRadius: 2, background: 'linear-gradient(180deg, #6c7cfc 0%, #8b98ff 100%)' }} />
                <Text strong style={{ fontSize: 15, color: '#4a54c9' }}>词根 / 词缀解析</Text>
              </div>
              <div style={{ padding: '12px 16px', background: '#fafbff', borderRadius: 10, border: '1px solid #f0f2ff', fontSize: 14, color: '#555' }}>
                {aiData.root_analysis}
              </div>
            </div>
            <Divider style={{ margin: '16px 0', borderColor: '#f0f0f0' }} />
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 4, height: 18, borderRadius: 2, background: 'linear-gradient(180deg, #f5a623 0%, #ffc53d 100%)' }} />
                <Text strong style={{ fontSize: 15, color: '#d48806' }}>趣味记忆口诀</Text>
              </div>
              <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%)', borderRadius: 10, border: '1px solid #ffe58f', fontSize: 14, color: '#5c4a00', lineHeight: 1.8 }}>
                {aiData.mnemonic}
              </div>
            </div>
            <Divider style={{ margin: '16px 0', borderColor: '#f0f0f0' }} />
            <div style={{ marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 4, height: 18, borderRadius: 2, background: 'linear-gradient(180deg, #52c41a 0%, #73d13d 100%)' }} />
                <Text strong style={{ fontSize: 15, color: '#389e0d' }}>日常例句</Text>
              </div>
              <div style={{ padding: '12px 16px', background: '#f6ffed', borderRadius: 10, border: '1px solid #d9f7be', fontSize: 14, color: '#3d5a1e', fontStyle: 'italic' }}>
                {aiData.extra_example}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Text type="secondary" style={{ fontSize: 15 }}>未能获取 AI 记忆素材</Text>
            <br />
            <Button type="link" icon={<ReloadOutlined />} style={{ marginTop: 12 }} onClick={retryAi}>
              重试
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
