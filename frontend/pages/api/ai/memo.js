/**
 * POST /api/ai/memo — 获取单词记忆素材（从数据库读取预生成内容，纯本地，零 API 费用）
 * 入参：{ word_id, style? }
 */
const { getSupabase } = require('../../../lib/supabase');
const { optionalAuth } = require('../../../lib/jwt');
const { jsonResponse } = require('../../../lib/response');
const { LRUCache } = require('lru-cache');

// 内存缓存：相同 word_id + style，5 分钟 TTL
const memoCache = new LRUCache({ max: 500, ttl: 300 * 1000 });

function validStyle(style) {
  return ['story', 'simple', 'mnemonic'].includes(style) ? style : 'simple';
}

const STYLE_FALLBACK = {
  simple: ['simple', 'story', 'mnemonic'],
  story: ['story', 'mnemonic', 'simple'],
  mnemonic: ['mnemonic', 'simple', 'story'],
};

function defaultMnemonic(word) {
  return `记「${word}」很简单，多读多练就记住了！`;
}

function parseMnemonic(raw, word, style) {
  if (!raw) return defaultMnemonic(word);
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) {
      for (const key of STYLE_FALLBACK[style] || ['simple']) {
        if (parsed[key]) return parsed[key];
      }
      const firstVal = Object.values(parsed)[0];
      return firstVal || defaultMnemonic(word);
    }
  } catch {}
  return raw || defaultMnemonic(word);
}

async function readWordFromDB(wordId, style) {
  const supabase = getSupabase();
  const result = await supabase.from('words')
    .select('id,word,phonetic,basic_meaning,root_analysis,mnemonic,extra_example')
    .eq('id', wordId);

  if (!result.data || result.data.length === 0) return null;

  const word = result.data[0];
  const cacheKey = `${wordId}:${style}`;

  if (memoCache.has(cacheKey)) {
    return { ...memoCache.get(cacheKey), from_cache: true };
  }

  const memoData = {
    word_id: wordId,
    word: word.word,
    root: word.root_analysis || word.word,
    mnemonic: parseMnemonic(word.mnemonic, word.word, style),
    examples: [word.extra_example || `I find the word '${word.word}' very useful.`],
    from_cache: false,
  };

  memoCache.set(cacheKey, memoData);
  return memoData;
}

export default optionalAuth(async (req, res) => {
  if (req.method !== 'POST') {
    return jsonResponse(res, 405, 'Method Not Allowed');
  }

  try {
    const { word_id, style: rawStyle } = req.body || {};
    if (!word_id) return jsonResponse(res, 400, '缺少必填参数 word_id');

    const wordId = parseInt(word_id);
    if (isNaN(wordId)) return jsonResponse(res, 400, 'word_id 必须为整数');

    const style = validStyle(rawStyle);
    const word = await readWordFromDB(wordId, style);

    if (!word) return jsonResponse(res, 404, `单词 ID ${wordId} 不存在`);

    word.style = style;
    return jsonResponse(res, 200, 'success', word);
  } catch (e) {
    console.error('Failed to get AI memo:', e);
    return jsonResponse(res, 500, '获取记忆素材失败，请稍后重试');
  }
});
