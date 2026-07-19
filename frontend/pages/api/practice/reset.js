/**
 * POST /api/practice/reset — 重置闯关进度（需 JWT 鉴权）
 * 入参：{ word_ids?: [1,2,3] }  不传则清空全部
 */
const { getSupabase } = require('../../../lib/supabase');
const { jwtRequired } = require('../../../lib/jwt');
const { jsonResponse } = require('../../../lib/response');

module.exports = jwtRequired(async (req, res) => {
  if (req.method !== 'POST') {
    return jsonResponse(res, 405, 'Method Not Allowed');
  }

  try {
    const { word_ids } = req.body || {};
    const supabase = getSupabase();
    const userId = req.userId;

    let query = supabase.table('practice_progress').delete().eq('user_id', userId);
    if (word_ids && Array.isArray(word_ids)) {
      query = query.in('word_id', word_ids);
    }

    const result = await query;
    const deletedCount = result.data ? result.data.length : 0;
    console.log(`User ${userId} reset ${deletedCount} practice progress records`);
    return jsonResponse(res, 200, '闯关进度已重置', { deleted: deletedCount });
  } catch (e) {
    console.error('Failed to reset practice progress:', e);
    return jsonResponse(res, 500, '重置闯关进度失败，请稍后重试');
  }
});
