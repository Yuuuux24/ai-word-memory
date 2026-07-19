/**
 * GET /api/practice/load — 加载闯关进度（需 JWT 鉴权）
 */
const { getSupabase } = require('../../../lib/supabase');
const { jwtRequired } = require('../../../lib/jwt');
const { jsonResponse } = require('../../../lib/response');

module.exports = jwtRequired(async (req, res) => {
  if (req.method !== 'GET') {
    return jsonResponse(res, 405, 'Method Not Allowed');
  }

  try {
    const supabase = getSupabase();
    const query = supabase.from('practice_progress')
      .select('*')
      .eq('user_id', req.userId);

    const result = await query;
    const progressMap = {};
    if (result.data) {
      result.data.forEach(row => {
        progressMap[row.word_id] = {
          correct_count: row.correct_count || 0,
          cooldown_remaining: row.cooldown_remaining || 0,
        };
      });
    }

    return jsonResponse(res, 200, 'success', {
      progress: progressMap,
      total: Object.keys(progressMap).length,
    });
  } catch (e) {
    console.error('Failed to load practice progress:', e);
    return jsonResponse(res, 500, '加载闯关进度失败，请稍后重试');
  }
});
