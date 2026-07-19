import { Modal, Typography, Button, Space, Divider, Progress, Select, Tag, Skeleton } from 'antd';
import { ReloadOutlined, SaveOutlined, ThunderboltOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useState, useRef, useEffect, useCallback } from 'react';
import { showError, showSuccess } from '@/utils/errorHandler';
import { authHeaders } from '@/utils/auth';

const { Text } = Typography;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';
const AI_TIMEOUT = 35000;
const STYLE_OPTIONS = [
  { value: 'simple', label: '极简干货' },
  { value: 'story', label: '趣味故事' },
  { value: 'mnemonic', label: '谐音口诀' },
];
const STYLE_COLOR = { simple: '#6366f1', story: '#f59e0b', mnemonic: '#10b981' };
const STYLE_GRADIENT = {
  simple: 'linear-gradient(135deg, #f8f9ff 0%, #eef2ff 100%)',
  story: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
  mnemonic: 'linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%)',
};
const STYLE_BORDER = {
  simple: '#c7d2fe',
  story: '#fde68a',
  mnemonic: '#a7f3d0',
};

export default function AIMemoModal({ open, word, onClose, showSaveBtn = true, onSave }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [timeout, setTimeout_] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [style, setStyle] = useState('simple');

  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const abortRef = useRef(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (abortRef.current) abortRef.current.abort();
  }, []);

  useEffect(() => { return cleanup; }, [cleanup]);

  // 请求 AI 生成素材
  const requestMemo = useCallback((wordId, styleOpt) => {
    setLoading(true);
    setData(null);
    setTimeout_(false);
    setCountdown(0);
    cleanup();

    let cd = Math.ceil(AI_TIMEOUT / 1000);
    setCountdown(cd);
    countdownRef.current = setInterval(() => {
      cd--;
      setCountdown(cd);
      if (cd <= 0) clearInterval(countdownRef.current);
    }, 1000);

    timerRef.current = setTimeout(() => {
      setTimeout_(true);
      setLoading(false);
      if (abortRef.current) abortRef.current.abort();
      clearInterval(countdownRef.current);
    }, AI_TIMEOUT);

    abortRef.current = new AbortController();

    fetch(`${API_BASE}/api/ai/generate`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ word_id: wordId, style: styleOpt }),
      signal: abortRef.current.signal,
    })
      .then((res) => res.json())
      .then((json) => {
        clearTimeout(timerRef.current);
        clearInterval(countdownRef.current);
        if (json.code === 200) {
          setData(json.data);
          if (json.data?.from_cache) {
            // 缓存命中静默处理，无需提示
          }
        } else {
          showError(json.msg || 'AI 生成失败，请稍后重试');
          setData(json.data || null);
        }
      })
      .catch((err) => {
        clearTimeout(timerRef.current);
        clearInterval(countdownRef.current);
        if (err.name !== 'AbortError') {
          showError(err, 'AI 生成失败，请稍后重试');
        }
      })
      .finally(() => setLoading(false));
  }, [cleanup]);

  // 弹窗打开 / 单词变化 / 风格切换时请求
  useEffect(() => {
    if (!open || !word) return;
    requestMemo(word.id, style);
  }, [open, word, style, requestMemo]);

  // 保存学习记录
  const handleSave = useCallback(async () => {
    if (!word) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/study/add`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ word_id: word.id }),
      });
      const json = await res.json();
      if (json.code === 200) {
        showSuccess(json.msg || '学习记录已保存');
        if (onSave) onSave(json.msg || '学习记录已保存');
      } else {
        showError(json.msg || '保存失败，请稍后重试');
      }
    } catch (err) {
      showError(err, '保存学习记录失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  }, [word, onSave]);

  const handleStyleChange = useCallback((val) => setStyle(val), []);

  const handleClose = useCallback(() => {
    cleanup();
    setData(null);
    setLoading(false);
    setTimeout_(false);
    onClose();
  }, [onClose, cleanup]);

  // 渲染例句
  const renderExamples = () => {
    if (!data) return null;
    if (data.examples && Array.isArray(data.examples)) {
      return data.examples.map((ex, i) => {
        // 尝试拆分中英文（按常见模式）
        const parts = ex.split(/(?<=\w)[.?!]\s*(?=[\u4e00-\u9fa5])/);
        const enPart = parts[0] || ex;
        const cnPart = parts.length > 1 ? parts.slice(1).join('. ') : '';
        return (
          <div key={i} style={{
            marginBottom: 8, padding: '12px 16px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            borderRadius: 10, border: '1px solid #a7f3d0',
          }}>
            <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 600, marginBottom: cnPart ? 4 : 0, lineHeight: 1.6 }}>
              {enPart}
            </div>
            {cnPart && (
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
                {cnPart}
              </div>
            )}
          </div>
        );
      });
    }
    if (data.extra_example) {
      return (
        <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', borderRadius: 10, border: '1px solid #a7f3d0', fontSize: 14, color: '#065f46', lineHeight: 1.7 }}>
          {data.extra_example}
        </div>
      );
    }
    return null;
  };

  const rootText = data?.root || data?.root_analysis || '';
  const mnemonicText = data?.mnemonic || '';

  // 加载骨架屏 — 贴合实际内容结构
  const renderSkeleton = () => (
    <div style={{ padding: '4px 0' }}>
      {/* 词根解析 skeleton */}
      <div style={{ marginBottom: 20 }}>
        <Skeleton.Input active size="small" style={{ width: 120, marginBottom: 10, borderRadius: 6 }} />
        <Skeleton.Input active block style={{ height: 52, borderRadius: 10 }} />
      </div>
      <Divider style={{ margin: '16px 0' }} />
      {/* 记忆口诀 skeleton */}
      <div style={{ marginBottom: 20 }}>
        <Skeleton.Input active size="small" style={{ width: 140, marginBottom: 10, borderRadius: 6 }} />
        <Skeleton.Input active block style={{ height: 80, borderRadius: 10 }} />
      </div>
      <Divider style={{ margin: '16px 0' }} />
      {/* 例句 skeleton */}
      <div style={{ marginBottom: 8 }}>
        <Skeleton.Input active size="small" style={{ width: 100, marginBottom: 10, borderRadius: 6 }} />
        <Skeleton.Input active block style={{ height: 52, borderRadius: 10, marginBottom: 8 }} />
        <Skeleton.Input active block style={{ height: 52, borderRadius: 10 }} />
      </div>
    </div>
  );

  const currentStyleLabel = STYLE_OPTIONS.find(o => o.value === style)?.label || '极简干货';

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 17, fontWeight: 600 }}>
            {word ? `"${word.word}" 记忆素材` : 'AI 记忆素材'}
          </span>
          <Space size={8}>
            <ThunderboltOutlined style={{ color: '#f59e0b', fontSize: 14 }} />
            <Select
              size="small"
              value={style}
              onChange={handleStyleChange}
              options={STYLE_OPTIONS}
              style={{ width: 110, borderRadius: 8 }}
              popupMatchSelectWidth={false}
            />
          </Space>
        </div>
      }
      open={open}
      onCancel={handleClose}
      footer={
        <Space>
          {showSaveBtn && (
            <Button icon={<SaveOutlined />} type="primary" loading={saving} onClick={handleSave}>
              保存学习记录
            </Button>
          )}
          <Button onClick={handleClose}>关闭</Button>
        </Space>
      }
      width={680}
      destroyOnClose
      style={{ top: 40 }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          {renderSkeleton()}
          <div style={{ marginTop: 16, color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>
            AI 正在生成{currentStyleLabel}风格素材...
            <span style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <ClockCircleOutlined style={{ fontSize: 12 }} />
              超时剩余 {countdown} 秒
            </span>
          </div>
          <Progress
            percent={Math.max(5, Math.round(((AI_TIMEOUT / 1000 - countdown) / (AI_TIMEOUT / 1000)) * 100))}
            showInfo={false}
            strokeColor={{ from: '#6366f1', to: '#818cf8' }}
            style={{ maxWidth: 280, margin: '0 auto' }}
          />
        </div>
      ) : timeout ? (
        <div className="empty-state" style={{ padding: '50px 20px' }}>
          <div className="empty-icon type-error">!</div>
          <Text style={{ fontSize: 15, color: 'var(--text-secondary)', display: 'block', marginBottom: 20 }}>
            AI 生成超时，请稍后重试
          </Text>
          <Button type="primary" icon={<ReloadOutlined />} onClick={() => word && requestMemo(word.id, style)}>
            重新生成
          </Button>
        </div>
      ) : data ? (
        <div style={{ lineHeight: 1.8 }}>
          {/* 缓存命中提示 */}
          {data.from_cache && (
            <div style={{
              marginBottom: 16, padding: '6px 12px',
              background: '#f0fdf4', borderRadius: 8, border: '1px solid #a7f3d0',
              fontSize: 12, color: '#065f46', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <ClockCircleOutlined style={{ fontSize: 12 }} />
              缓存命中（5 分钟内相同单词+风格复用）
            </div>
          )}

          {/* 词根解析 */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 4, height: 18, borderRadius: 2, background: 'linear-gradient(180deg, var(--primary) 0%, var(--primary-light) 100%)' }} />
              <Text strong style={{ fontSize: 15, color: 'var(--text-primary)' }}>词根 / 词缀解析</Text>
            </div>
            <div style={{
              padding: '14px 16px',
              background: 'linear-gradient(135deg, #fafbff 0%, #f5f3ff 100%)',
              borderRadius: 12,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              color: '#334155',
              lineHeight: 1.8
            }}>
              {rootText}
            </div>
          </div>

          <Divider style={{ margin: '20px 0' }} />

          {/* 趣味记忆口诀 */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 4, height: 18, borderRadius: 2, background: 'linear-gradient(180deg, #f59e0b 0%, #fbbf24 100%)' }} />
              <Text strong style={{ fontSize: 15, color: '#92400e' }}>趣味记忆口诀</Text>
              {style && (
                <Tag
                  color="gold"
                  style={{ fontSize: 11, lineHeight: '18px', borderRadius: 6 }}
                >
                  {currentStyleLabel}
                </Tag>
              )}
            </div>
            <div style={{
              padding: '16px 18px',
              background: STYLE_GRADIENT[style] || STYLE_GRADIENT.simple,
              borderRadius: 12,
              border: `1px solid ${STYLE_BORDER[style] || STYLE_BORDER.simple}`,
              fontSize: 14,
              color: '#4a3700',
              lineHeight: 1.9,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {mnemonicText}
            </div>
          </div>

          <Divider style={{ margin: '20px 0' }} />

          {/* 日常例句 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 4, height: 18, borderRadius: 2, background: 'linear-gradient(180deg, var(--success) 0%, #34d399 100%)' }} />
              <Text strong style={{ fontSize: 15, color: '#065f46' }}>日常例句</Text>
            </div>
            {renderExamples()}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Text style={{ fontSize: 15, color: 'var(--text-secondary)', display: 'block', marginBottom: 16 }}>
            未能获取 AI 记忆素材
          </Text>
          <Button type="link" icon={<ReloadOutlined />} onClick={() => word && requestMemo(word.id, style)}>重试</Button>
        </div>
      )}
    </Modal>
  );
}
