/**
 * GET  /api/words — 分页单词列表（可选登录）
 * POST /api/words — 新增单词（需 JWT 鉴权）
 */
const { getSupabase } = require('../../../lib/supabase');
const { jwtRequired, optionalAuth } = require('../../../lib/jwt');
const { jsonResponse } = require('../../../lib/response');

// 查询用户全部单词状态
async function userStatusMap(supabase, userId) {
  if (!userId) return {};
  try {
    const res = await supabase.from('user_word_status')
      .select('word_id,review_status')
      .eq('user_id', userId);
    const map = {};
    (res.data || []).forEach(r => { map[r.word_id] = r.review_status || 0; });
    return map;
  } catch {
    return {};
  }
}

function attachUserStatus(words, statusMap) {
  if (!words) return words;
  words.forEach(w => { w.review_status = statusMap[w.id] || 0; });
  return words;
}

// GET：单词列表
const getWordsHandler = optionalAuth(async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let size = parseInt(req.query.size) || 10;
    const keyword = (req.query.keyword || '').trim();

    if (page < 1) page = 1;
    if (size < 1) size = 10;
    if (size > 500) size = 500;

    const supabase = getSupabase();
    let query = supabase.from('words').select('*', { count: 'exact' });

    if (keyword) {
      query = query.or(`word.ilike.%${keyword}%,basic_meaning.ilike.%${keyword}%`);
    }
    query = query.order('id', { ascending: true });

    // 先查总数
    const countRes = await query.range(0, 0);
    const total = countRes.count || 0;

    // 分页
    let offset = (page - 1) * size;
    if (offset >= total && total > 0) {
      offset = Math.max(0, total - size);
      page = Math.floor(offset / size) + 1;
    }

    const result = offset < total
      ? await query.range(offset, offset + size - 1)
      : { data: [] };
    const words = (result.data || []).slice(0, size);

    // 合并用户状态
    const statusMap = await userStatusMap(supabase, req.userId);
    attachUserStatus(words, statusMap);

    return jsonResponse(res, 200, 'success', {
      list: words,
      total,
      page,
      size,
      keyword: keyword || null,
    });
  } catch (e) {
    console.error('Failed to get words:', e);
    return jsonResponse(res, 500, '获取单词列表失败，请稍后重试');
  }
});

// POST：新增单词
const addWordHandler = jwtRequired(async (req, res) => {
  try {
    const { word: rawWord, phonetic, basic_meaning } = req.body || {};
    const wordText = (rawWord || '').trim();
    if (!wordText) return jsonResponse(res, 400, '单词不能为空');

    const supabase = getSupabase();

    // 查重
    const existing = await supabase.from('words').select('*').eq('word', wordText);
    if (existing.data && existing.data.length > 0) {
      return jsonResponse(res, 200, `单词"${wordText}"已存在，无需重复添加`, existing.data[0]);
    }

    const insertData = { word: wordText };
    if (phonetic) insertData.phonetic = phonetic;
    if (basic_meaning) insertData.basic_meaning = basic_meaning;

    const result = await supabase.from('words').insert(insertData).select();
    if (result.data && result.data.length > 0) {
      return jsonResponse(res, 200, '单词添加成功', result.data[0]);
    }
    return jsonResponse(res, 500, '单词添加失败');
  } catch (e) {
    const msg = String(e.message || e).toLowerCase();
    if (msg.includes('duplicate') || msg.includes('unique')) {
      return jsonResponse(res, 200, `单词已存在，无需重复添加`, null);
    }
    console.error('Failed to add word:', e);
    return jsonResponse(res, 500, '添加单词失败，请稍后重试');
  }
});

module.exports = (req, res) => {
  if (req.method === 'GET') return getWordsHandler(req, res);
  if (req.method === 'POST') return addWordHandler(req, res);
  return jsonResponse(res, 405, 'Method Not Allowed');
};
