import { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Typography, Spin, Progress, Modal } from 'antd';
import {
  ArrowLeftOutlined, CheckCircleFilled, CloseCircleFilled,
  TrophyOutlined, RightOutlined, ReloadOutlined, SoundOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { showError } from '@/utils/errorHandler';

const { Title, Text } = Typography;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:5000';
const REQUIRED_CORRECT = 3;

function pickWrongOptions(correctWord, allWords) {
  const correctMeaning = correctWord.basic_meaning;
  const pool = allWords
    .filter(w => w.id !== correctWord.id && w.basic_meaning)
    .map(w => w.basic_meaning)
    .filter((v, i, arr) => arr.indexOf(v) === i);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(3, shuffled.length));
}

function shuffleOptions(correctMeaning, wrongMeanings) {
  const opts = [
    { text: correctMeaning, isCorrect: true },
    ...wrongMeanings.map(t => ({ text: t, isCorrect: false })),
  ];
  return opts.sort(() => Math.random() - 0.5);
}

export default function Practice() {
  const router = useRouter();

  // -- 用户身份 --
  const userIdRef = useRef(null);

  // -- 单词数据 --
  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(true);

  // -- 游戏状态（ref 避免闭包陷阱）--
  const correctRef = useRef({});    // { wordId: 0..3 }
  const cooldownRef = useRef({});    // { wordId: remaining }
  const [totalMastered, setTotalMastered] = useState(0);
  const lastMilestoneRef = useRef(0);

  // -- 当前题目 --
  const [currentWord, setCurrentWord] = useState(null);
  const [options, setOptions] = useState([]);

  // -- 答题 UI --
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const correctIdxRef = useRef(-1);

  // -- 里程碑弹窗 --
  const [milestoneOpen, setMilestoneOpen] = useState(false);
  const [milestoneMsg, setMilestoneMsg] = useState('');

  // ========== 加载单词 + 恢复进度 ==========
  useEffect(() => {
    (async () => {
      // 检查登录
      const uid = localStorage.getItem('userId');
      if (!uid) {
        router.replace('/login');
        return;
      }
      userIdRef.current = parseInt(uid, 10);

      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/words?page=1&size=10`);
        const json = await res.json();
        if (json.code === 200 && json.data?.list?.length) {
          const words = json.data.list;
          setAllWords(words);

          // 从数据库加载进度
          const c = {}, d = {};
          words.forEach(w => { c[w.id] = 0; d[w.id] = 0; });

          try {
            const pgRes = await fetch(`${API_BASE}/api/practice/load?user_id=${userIdRef.current}`);
            const pgJson = await pgRes.json();
            if (pgJson.code === 200 && pgJson.data?.progress) {
              const saved = pgJson.data.progress;
              Object.keys(saved).forEach(wid => {
                const widNum = parseInt(wid);
                c[widNum] = saved[wid].correct_count || 0;
                d[widNum] = saved[wid].cooldown_remaining || 0;
              });
            }
          } catch (_) {
            // 加载进度失败不影响游戏，使用默认值
          }

          correctRef.current = c;
          cooldownRef.current = d;
          const mastered = Object.values(c).filter(v => v >= REQUIRED_CORRECT).length;
          setTotalMastered(mastered);
          lastMilestoneRef.current = mastered;
        } else {
          showError(json.msg || '获取单词列表失败');
        }
      } catch (err) {
        showError(err, '无法连接后端服务');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ========== 选取下一题 ==========
  const pickNext = useCallback(() => {
    setShowResult(false);
    setSelectedIdx(null);
    setIsCorrect(false);
    correctIdxRef.current = -1;

    const words = allWords;
    if (!words.length) return;

    // 递减所有冷却
    const cds = { ...cooldownRef.current };
    const cnts = correctRef.current;
    words.forEach(w => {
      if ((cnts[w.id] || 0) < REQUIRED_CORRECT) {
        cds[w.id] = Math.max(0, (cds[w.id] || 0) - 1);
      }
    });
    cooldownRef.current = cds;

    // 候选：未掌握 + 冷却=0
    let candidates = words.filter(
      w => (cnts[w.id] || 0) < REQUIRED_CORRECT && (cds[w.id] || 0) <= 0,
    );

    if (candidates.length === 0) {
      // 全部冷却中 → 取冷却最短的
      const active = words.filter(w => (cnts[w.id] || 0) < REQUIRED_CORRECT);
      if (active.length === 0) {
        // 全部已掌握 → 随机取一个（无限循环）
        const rand = words[Math.floor(Math.random() * words.length)];
        setCurrentWord(rand);
        const wrongs = pickWrongOptions(rand, words);
        const opts = shuffleOptions(rand.basic_meaning, wrongs);
        correctIdxRef.current = opts.findIndex(o => o.isCorrect);
        setOptions(opts);
        return;
      }
      const minCd = Math.min(...active.map(w => cds[w.id] || 0));
      candidates = active.filter(w => (cds[w.id] || 0) === minCd);
    }

    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    setCurrentWord(chosen);
    const wrongs = pickWrongOptions(chosen, words);
    const opts = shuffleOptions(chosen.basic_meaning, wrongs);
    correctIdxRef.current = opts.findIndex(o => o.isCorrect);
    setOptions(opts);
  }, [allWords]);

  // 数据就绪后出第一题
  const startedRef = useRef(false);
  useEffect(() => {
    if (!loading && allWords.length > 0 && !startedRef.current) {
      startedRef.current = true;
      pickNext();
    }
  }, [loading, allWords, pickNext]);

  // ========== 保存单条进度到数据库 ==========
  const saveProgress = useCallback((wordId) => {
    const uid = userIdRef.current;
    if (!uid) return;
    const cnts = correctRef.current;
    const cds = cooldownRef.current;
    fetch(`${API_BASE}/api/practice/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: uid,
        word_id: wordId,
        correct_count: cnts[wordId] || 0,
        cooldown_remaining: cds[wordId] || 0,
      }),
    }).catch(() => {});
  }, []);

  // ========== 点击选项 ==========
  const handleOptionClick = useCallback((opt, idx) => {
    if (showResult || !currentWord) return;

    const correct = opt.isCorrect;
    setSelectedIdx(idx);
    setIsCorrect(correct);
    setShowResult(true);

    // 更新掌握次数
    const cnts = { ...correctRef.current };
    const cds = { ...cooldownRef.current };

    if (correct) {
      cnts[currentWord.id] = Math.min(REQUIRED_CORRECT, (cnts[currentWord.id] || 0) + 1);
      cds[currentWord.id] = Math.floor(Math.random() * 3) + 4; // 4-6
    } else {
      cds[currentWord.id] = Math.floor(Math.random() * 3) + 4; // 4-6
    }

    correctRef.current = cnts;
    cooldownRef.current = cds;

    // 保存到数据库
    saveProgress(currentWord.id);

    // 重新计算掌握数
    const mastered = Object.values(cnts).filter(v => v >= REQUIRED_CORRECT).length;
    setTotalMastered(mastered);

    // 里程碑
    if (mastered > 0 && mastered % 10 === 0 && mastered > lastMilestoneRef.current) {
      lastMilestoneRef.current = mastered;
      setMilestoneMsg(`已掌握 ${mastered} 个单词，继续加油！`);
      setMilestoneOpen(true);
    }
  }, [showResult, currentWord, saveProgress]);

  // ========== 下一题 ==========
  const handleNext = useCallback(() => pickNext(), [pickNext]);

  // ========== 重新开始 ==========
  const handleRestart = useCallback(() => {
    const c = {}, d = {};
    allWords.forEach(w => { c[w.id] = 0; d[w.id] = 0; });
    correctRef.current = c;
    cooldownRef.current = d;
    setTotalMastered(0);
    lastMilestoneRef.current = 0;

    // 清空数据库进度
    const uid = userIdRef.current;
    if (uid) {
      allWords.forEach(w => {
        fetch(`${API_BASE}/api/practice/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: uid,
            word_id: w.id,
            correct_count: 0,
            cooldown_remaining: 0,
          }),
        }).catch(() => {});
      });
    }

    pickNext();
  }, [allWords, pickNext]);

  // ========== 加载中 ==========
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 20px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#8c8c8c', fontSize: 14 }}>正在加载单词数据...</div>
      </div>
    );
  }

  if (!allWords.length || !currentWord) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 20px' }}>
        <Text type="secondary">暂无单词数据</Text>
        <br />
        <Button type="link" onClick={() => router.push('/')} style={{ marginTop: 12 }}>返回首页</Button>
      </div>
    );
  }

  const total = allWords.length;
  const allDone = totalMastered >= total;

  // ========== 选项按钮样式 ==========
  const getOptionStyle = (idx, opt) => {
    if (!showResult) {
      return {
        cursor: 'pointer',
        border: '1px solid #e0e0e0',
        background: '#fff',
        color: '#333',
        transform: 'none',
      };
    }
    // 正确答案
    if (opt.isCorrect) {
      return {
        cursor: 'default',
        border: '1px solid #b7eb8f',
        background: 'rgba(246,255,237,0.9)',
        color: '#389e0d',
        transform: 'scale(1.02)',
      };
    }
    // 用户选错的那个
    if (idx === selectedIdx && !opt.isCorrect) {
      return {
        cursor: 'default',
        border: '1px solid #ffa39e',
        background: 'rgba(255,241,240,0.9)',
        color: '#cf1322',
        transform: 'scale(1.02)',
      };
    }
    // 其他未选中的
    return {
      cursor: 'default',
      border: '1px solid #f0f0f0',
      background: '#fafafa',
      color: '#bbb',
      opacity: 0.5,
    };
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* ---- 顶部栏 ---- */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, flexWrap: 'wrap', gap: 8,
      }}>
        <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => router.push('/')}
          style={{ color: '#6c7cfc', fontWeight: 500 }}>
          返回首页
        </Button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <TrophyOutlined style={{ color: '#faad14', fontSize: 18 }} />
          <Text strong style={{ fontSize: 16, color: '#4a54c9' }}>
            {totalMastered} / {total}
          </Text>
          <Progress
            percent={total > 0 ? Math.round((totalMastered / total) * 100) : 0}
            showInfo={false}
            size="small"
            strokeColor={{ from: '#6c7cfc', to: '#8b98ff' }}
            style={{ width: 80, marginBottom: 0 }}
          />
        </div>
      </div>

      {/* ---- 全部掌握提示 ---- */}
      {allDone && (
        <div style={{
          textAlign: 'center', padding: '14px 20px', marginBottom: 24,
          background: 'linear-gradient(135deg, #f6ffed 0%, #e6ffe6 100%)',
          borderRadius: 12, border: '1px solid #b7eb8f',
        }}>
          <CheckCircleFilled style={{ color: '#52c41a', fontSize: 20 }} />
          <Text strong style={{ color: '#389e0d', marginLeft: 8, fontSize: 15 }}>
            全部单词已掌握！可以继续巩固或返回首页
          </Text>
        </div>
      )}

      {/* ---- 单词 + 音标 ---- */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
          <Title level={2} style={{ margin: 0, color: '#4a54c9', fontSize: 32 }}>
            {currentWord.word}
          </Title>
          <SoundOutlined style={{ color: '#8b98ff', fontSize: 20, cursor: 'pointer' }} />
        </div>
        {currentWord.phonetic && (
          <Text type="secondary" style={{ fontSize: 16 }}>
            {currentWord.phonetic}
          </Text>
        )}
      </div>

      {/* ---- 四个选项 ---- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: showResult ? 24 : 0 }}>
        {options.map((opt, idx) => {
          const style = getOptionStyle(idx, opt);
          return (
            <div
              key={idx}
              onClick={() => handleOptionClick(opt, idx)}
              style={{
                padding: '14px 20px',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'all 0.3s ease',
                ...style,
              }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: '50%',
                background: showResult
                  ? opt.isCorrect ? '#b7eb8f' : (idx === selectedIdx ? '#ffa39e' : '#f0f0f0')
                  : '#f0f2ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 600, flexShrink: 0,
                color: showResult
                  ? opt.isCorrect ? '#389e0d' : (idx === selectedIdx ? '#cf1322' : '#bbb')
                  : '#6c7cfc',
              }}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span>{opt.text}</span>
              {showResult && opt.isCorrect && (
                <CheckCircleFilled style={{ color: '#52c41a', marginLeft: 'auto' }} />
              )}
              {showResult && idx === selectedIdx && !opt.isCorrect && (
                <CloseCircleFilled style={{ color: '#ff4d4f', marginLeft: 'auto' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* ---- 答完后浮现单词卡片 ---- */}
      {showResult && (
        <div style={{
          marginTop: 4,
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #fafbff 0%, #f5f7ff 100%)',
          borderRadius: 14,
          border: '1px solid #e8ebff',
          animation: 'fadeIn 0.4s ease',
        }}>
          {/* 结果提示 */}
          <div style={{
            textAlign: 'center', marginBottom: 18,
            fontSize: 16, fontWeight: 600,
            color: isCorrect ? '#389e0d' : '#cf1322',
          }}>
            {isCorrect ? (
              <span><CheckCircleFilled style={{ marginRight: 6 }} />回答正确！</span>
            ) : (
              <span><CloseCircleFilled style={{ marginRight: 6 }} />回答错误</span>
            )}
            <Text type="secondary" style={{ marginLeft: 10, fontSize: 13, fontWeight: 400 }}>
              (已掌握 {Math.min(correctRef.current[currentWord.id] || 0, REQUIRED_CORRECT)}/{REQUIRED_CORRECT} 次)
            </Text>
          </div>

          {/* 单词信息 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
              <Text strong style={{ fontSize: 20, color: '#4a54c9' }}>{currentWord.word}</Text>
              {currentWord.phonetic && (
                <Text type="secondary" style={{ fontSize: 14 }}>{currentWord.phonetic}</Text>
              )}
            </div>
            <Text style={{ fontSize: 15, color: '#555' }}>{currentWord.basic_meaning}</Text>
          </div>

          {/* 短语（占位） */}
          <div style={{
            marginBottom: 12, padding: '10px 14px',
            background: '#fff', borderRadius: 8, border: '1px dashed #d9d9d9',
          }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              短语：<span style={{ color: '#bbb' }}>即将支持，敬请期待</span>
            </Text>
          </div>

          {/* 造句（占位） */}
          <div style={{
            marginBottom: 18, padding: '10px 14px',
            background: '#fff', borderRadius: 8, border: '1px dashed #d9d9d9',
          }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              造句：<span style={{ color: '#bbb' }}>即将支持，敬请期待</span>
            </Text>
          </div>

          {/* 下一题按钮 */}
          <Button
            type="primary"
            size="large"
            block
            icon={<RightOutlined />}
            onClick={handleNext}
            style={{
              borderRadius: 10,
              height: 46,
              fontSize: 16,
              background: 'linear-gradient(135deg, #6c7cfc 0%, #8b98ff 100%)',
              border: 'none',
            }}
          >
            下一题
          </Button>

          {/* 全部掌握时显示重新开始 */}
          {allDone && (
            <Button
              size="large"
              block
              icon={<ReloadOutlined />}
              onClick={handleRestart}
              style={{ marginTop: 10, borderRadius: 10, height: 46, fontSize: 15 }}
            >
              重新开始
            </Button>
          )}
        </div>
      )}

      {/* 里程碑弹窗 */}
      <Modal
        open={milestoneOpen}
        onCancel={() => setMilestoneOpen(false)}
        footer={null}
        width={360}
        centered
        closable
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <TrophyOutlined style={{ fontSize: 48, color: '#faad14' }} />
          <Title level={4} style={{ marginTop: 12, color: '#d48806' }}>{milestoneMsg}</Title>
          <Button type="primary" onClick={() => setMilestoneOpen(false)} style={{ borderRadius: 8 }}>
            继续闯关
          </Button>
        </div>
      </Modal>

      {/* fadeIn 动画 */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
