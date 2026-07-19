/**
 * DELETE /api/study/[record_id] — 删除学习记录（需 JWT 鉴权）
 */
const { getSupabase } = require('../../../../lib/supabase');
const { jwtRequired } = require('../../../../lib/jwt');
const { jsonResponse } = require('../../../../lib/response');

module.exports = jwtRequired(async (req, res) => {
  if (req.method !== 'DELETE') {
    return jsonResponse(res, 405, 'Method Not Allowed');
  }

  try {
    const recordId = parseInt(req.query.record_id);
    if (isNaN(recordId)) return jsonResponse(res, 400, 'record_id 必须为整数');

    const supabase = getSupabase();

    const check = await supabase.from('study_record')
      .select('id,user_id')
      .eq('id', recordId);

    if (!check.data || check.data.length === 0) {
      return jsonResponse(res, 404, '学习记录不存在');
    }
    if (check.data[0].user_id !== req.userId) {
      return jsonResponse(res, 403, '无权删除他人的学习记录');
    }

    await supabase.from('study_record').delete().eq('id', recordId);
    return jsonResponse(res, 200, '学习记录已删除');
  } catch (e) {
    console.error('Failed to delete study record:', e);
    return jsonResponse(res, 500, '删除学习记录失败，请稍后重试');
  }
});
