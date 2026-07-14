import { Modal, Spin, Typography, Button, Space, Divider, Progress } from 'antd';
import { ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import { useState, useRef, useEffect, useCallback } from 'react';
import { showError } from '@/utils/errorHandler';

const { Text } = Typography;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:5000';
const AI_TIMEOUT = 30000;

/**
 * 公共 AI 记忆素材弹窗
 * @param {boolean}  open          - 弹窗是否可见
 * @param {object}   word          - 当前单词对象 { id, word }
 * @param {function} onClose       - 关闭回调
 * @param {boolean}  showSaveBtn   - 是否显示"保存学习记录"按钮，默认 true
 * @param {function} onSave        - 保存学习记录回调（可选，不传则内部调用 /api/study/add）
 */
export default function AIMemoModal({ open, word, onClose, showSaveBtn = true, onSave }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [timeout, setTimeout_] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const abortRef = useRef(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (abortRef.current) abortRef.current.abort();
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  useEffect(() => {
    if (!open || !word) return;

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

    fetch(`${API_BASE}/api/ai/memo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word_id: word.id }),
      signal: abortRef.current.signal,
    })
      .then((res) => res.json())
      .then((json) => {
        clearTimeout(timerRef.current);
        clearInterval(countdownRef.current);
        if (json.code === 200) {
          setData(json.data);
        } else {
          showError(json.msg || 'AI 生成失败，请稍后重试');
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
  }, [open, word, cleanup]);

  const handleSave = useCallback(async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId || !word) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/study/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: Number(userId), word_id: word.id }),
      });
      const json = await res.json();
      if (json.code === 200) {
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

  const handleRetry = useCallback(() => {
    if (word) {
      setData(null);
      setTimeout_(false);
      setLoading(true);
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

      fetch(`${API_BASE}/api/ai/memo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word_id: word.id }),
        signal: abortRef.current.signal,
      })
        .then((res) => res.json())
        .then((json) => {
          clearTimeout(timerRef.current);
          clearInterval(countdownRef.current);
          if (json.code === 200) setData(json.data);
          else showError(json.msg || 'AI 生成失败，请稍后重试');
        })
        .catch((err) => {
          clearTimeout(timerRef.current);
          clearInterval(countdownRef.current);
          if (err.name !== 'AbortError') showError(err, 'AI 生成失败，请稍后重试');
        })
        .finally(() => setLoading(false));
    }
  }, [word, cleanup]);

  const handleClose = useCallback(() => {
    cleanup();
    setData(null);
    setLoading(false);
    setTimeout_(false);
    onClose();
  }, [onClose, cleanup]);

  return (
    <Modal
      title={<span style={{ fontSize: 18 }}>{word ? `"${word.word}" AI 记忆素材` : 'AI 记忆素材'}</span>}
      open={open}
      onCancel={handleClose}
      footer={
        <Space>
          {showSaveBtn && <Button icon={<SaveOutlined />} type="primary" loading={saving} onClick={handleSave}>保存学习记录</Button>}
          <Button onClick={handleClose}>关闭</Button>
        </Space>
      }
      width={680}
      destroyOnClose
      style={{ top: 40 }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 20, color: '#8c8c8c', fontSize: 14 }}>AI 正在生成记忆素材... 超时剩余 {countdown} 秒</div>
          <Progress percent={Math.max(0, Math.round(((AI_TIMEOUT / 1000 - countdown) / (AI_TIMEOUT / 1000)) * 100))} showInfo={false} strokeColor={{ from: '#6c7cfc', to: '#8b98ff' }} style={{ maxWidth: 300, margin: '12px auto 0' }} />
        </div>
      ) : timeout ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#ff7875' }}>!</div>
          <Text type="secondary" style={{ fontSize: 15, display: 'block', marginBottom: 20 }}>AI 生成超时，请稍后重试</Text>
          <Button type="primary" icon={<ReloadOutlined />} onClick={handleRetry}>重新生成</Button>
        </div>
      ) : data ? (
        <div style={{ lineHeight: 1.8 }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 4, height: 16, borderRadius: 2, background: 'linear-gradient(180deg, #6c7cfc 0%, #8b98ff 100%)' }} />
              <Text strong style={{ fontSize: 15, color: '#4a54c9' }}>词根 / 词缀解析</Text>
            </div>
            <div style={{ padding: '12px 16px', background: '#fafbff', borderRadius: 10, border: '1px solid #f0f2ff', fontSize: 14, color: '#555' }}>{data.root_analysis}</div>
          </div>
          <Divider style={{ margin: '16px 0' }} />
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 4, height: 16, borderRadius: 2, background: 'linear-gradient(180deg, #f5a623 0%, #ffc53d 100%)' }} />
              <Text strong style={{ fontSize: 15, color: '#d48806' }}>趣味记忆口诀</Text>
            </div>
            <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%)', borderRadius: 10, border: '1px solid #ffe58f', fontSize: 14, color: '#5c4a00', lineHeight: 1.8 }}>{data.mnemonic}</div>
          </div>
          <Divider style={{ margin: '16px 0' }} />
          <div style={{ marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 4, height: 16, borderRadius: 2, background: 'linear-gradient(180deg, #52c41a 0%, #73d13d 100%)' }} />
              <Text strong style={{ fontSize: 15, color: '#389e0d' }}>日常例句</Text>
            </div>
            <div style={{ padding: '12px 16px', background: '#f6ffed', borderRadius: 10, border: '1px solid #d9f7be', fontSize: 14, color: '#3d5a1e', fontStyle: 'italic' }}>{data.extra_example}</div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Text type="secondary" style={{ fontSize: 15 }}>未能获取 AI 记忆素材</Text>
          <br />
          <Button type="link" icon={<ReloadOutlined />} style={{ marginTop: 12 }} onClick={handleRetry}>重试</Button>
        </div>
      )}
    </Modal>
  );
}
