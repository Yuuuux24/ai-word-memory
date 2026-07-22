/**
 * GET    /api/words/[word_id] — 单词详情（可选登录）
 * DELETE /api/words/[word_id] — 删除单词（需 JWT 鉴权）
 */
import { getSupabase } from '../../../../lib/supabase';
import { jwtRequired, optionalAuth } from '../../../../lib/jwt';
import { jsonResponse } from '../../../../lib/response';

// GET：单词详情
const getDetailHandler = optionalAuth(async (req, res) => {
  try {
    const wordId = parseInt(req.query.word_id);
    if (isNaN(wordId)) return jsonResponse(res, 400, 'word_id 必须为整数');

    const supabase = getSupabase();
    const result = await supabase.from('words').select('*').eq('id', wordId);

    if (!result.data || result.data.length === 0) {
      return jsonResponse(res, 404, `单词 ID ${wordId} 不存在`);
    }

    const word = result.data[0];
    word.review_status = 0;

    if (req.userId) {
      const statusRes = await supabase.from('user_word_status')
        .select('review_status')
        .eq('user_id', req.userId)
        .eq('word_id', wordId);
      if (statusRes.data && statusRes.data.length > 0) {
        word.review_status = statusRes.data[0].review_status || 0;
      }
    }

    return jsonResponse(res, 200, 'success', word);
  } catch (e) {
    console.error('Failed to get word detail:', e);
    return jsonResponse(res, 500, '获取单词详情失败，请稍后重试');
  }
});

// DELETE：删除单词
const deleteWordHandler = jwtRequired(async (req, res) => {
  try {
    const wordId = parseInt(req.query.word_id);
    if (isNaN(wordId)) return jsonResponse(res, 400, 'word_id 必须为整数');

    const supabase = getSupabase();
    const check = await supabase.from('words').select('id,word').eq('id', wordId);

    if (!check.data || check.data.length === 0) {
      return jsonResponse(res, 404, '单词不存在');
    }

    const wordText = check.data[0].word || '';
    await supabase.from('words').delete().eq('id', wordId);
    return jsonResponse(res, 200, `单词"${wordText}"已删除`);
  } catch (e) {
    console.error('Failed to delete word:', e);
    return jsonResponse(res, 500, '删除单词失败，请稍后重试');
  }
});

export default (req, res) => {
  if (req.method === 'GET') return getDetailHandler(req, res);
  if (req.method === 'DELETE') return deleteWordHandler(req, res);
  return jsonResponse(res, 405, 'Method Not Allowed');
};
