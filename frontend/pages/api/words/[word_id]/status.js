/**
 * PUT /api/words/[word_id]/status — 更新用户单词复习状态（需 JWT 鉴权）
 * 入参：{ review_status: 0 或 1 }
 */
const { getSupabase } = require('../../../../lib/supabase');
const { jwtRequired } = require('../../../../lib/jwt');
const { jsonResponse } = require('../../../../lib/response');

module.exports = jwtRequired(async (req, res) => {
  if (req.method !== 'PUT') {
    return jsonResponse(res, 405, 'Method Not Allowed');
  }

  try {
    const wordId = parseInt(req.query.word_id);
    if (isNaN(wordId)) return jsonResponse(res, 400, 'word_id 必须为整数');

    const reviewStatus = parseInt(req.body?.review_status);
    if (isNaN(reviewStatus) || ![0, 1].includes(reviewStatus)) {
      return jsonResponse(res, 400, 'review_status 必须为 0 或 1');
    }

    const supabase = getSupabase();
    const userId = req.userId;

    // 校验单词存在
    const check = await supabase.table('words').select('id').eq('id', wordId);
    if (!check.data || check.data.length === 0) {
      return jsonResponse(res, 404, '单词不存在');
    }

    // 写入/更新用户状态
    const existing = await supabase.table('user_word_status')
      .select('id')
      .eq('user_id', userId)
      .eq('word_id', wordId);

    if (existing.data && existing.data.length > 0) {
      await supabase.table('user_word_status')
        .update({ review_status: reviewStatus })
        .eq('id', existing.data[0].id);
    } else {
      await supabase.table('user_word_status')
        .insert({ user_id: userId, word_id: wordId, review_status: reviewStatus });
    }

    // 标记为已掌握时，同步写入学习记录
    if (reviewStatus === 1) {
      const now = new Date().toISOString();
      const recordExist = await supabase.table('study_record')
        .select('id')
        .eq('user_id', userId)
        .eq('word_id', wordId);

      if (recordExist.data && recordExist.data.length > 0) {
        await supabase.table('study_record')
          .update({ study_date: now })
          .eq('id', recordExist.data[0].id);
      } else {
        await supabase.table('study_record')
          .insert({ user_id: userId, word_id: wordId, study_date: now });
      }
    }

    const statusText = reviewStatus === 1 ? '已掌握' : '待复习';
    return jsonResponse(res, 200, `单词已标记为"${statusText}"`, {
      word_id: wordId,
      review_status: reviewStatus,
    });
  } catch (e) {
    console.error('Failed to update word status:', e);
    return jsonResponse(res, 500, '更新单词状态失败，请稍后重试');
  }
});
