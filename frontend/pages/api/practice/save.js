/**
 * POST /api/practice/save — 保存闯关进度（需 JWT 鉴权）
 * 入参：{ word_id, correct_count, cooldown_remaining }
 * 答对 3 次自动标记已掌握
 */
const { getSupabase } = require('../../../lib/supabase');
const { jwtRequired } = require('../../../lib/jwt');
const { jsonResponse } = require('../../../lib/response');

const REQUIRED_CORRECT = 3;

export default jwtRequired(async (req, res) => {
  if (req.method !== 'POST') {
    return jsonResponse(res, 405, 'Method Not Allowed');
  }

  try {
    const { word_id, correct_count = 0, cooldown_remaining = 0 } = req.body || {};
    if (!word_id) return jsonResponse(res, 400, '缺少必填参数 word_id');

    const supabase = getSupabase();
    const userId = req.userId;
    const now = new Date().toISOString();

    const existing = await supabase.from('practice_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('word_id', word_id);

    const data = {
      user_id: userId,
      word_id,
      correct_count,
      cooldown_remaining,
      updated_at: now,
    };

    const isNew = !existing.data || existing.data.length === 0;

    if (isNew) {
      await supabase.from('practice_progress').insert(data);
    } else {
      await supabase.from('practice_progress')
        .update(data)
        .eq('user_id', userId)
        .eq('word_id', word_id);
    }

    // 答对 3 次即掌握
    if (correct_count >= REQUIRED_CORRECT) {
      const statusExist = await supabase.from('user_word_status')
        .select('id')
        .eq('user_id', userId)
        .eq('word_id', word_id);

      if (statusExist.data && statusExist.data.length > 0) {
        await supabase.from('user_word_status')
          .update({ review_status: 1 })
          .eq('id', statusExist.data[0].id);
      } else {
        await supabase.from('user_word_status')
          .insert({ user_id: userId, word_id, review_status: 1 });
      }

      const recordExist = await supabase.from('study_record')
        .select('id')
        .eq('user_id', userId)
        .eq('word_id', word_id);

      if (recordExist.data && recordExist.data.length > 0) {
        await supabase.from('study_record')
          .update({ study_date: now })
          .eq('id', recordExist.data[0].id);
      } else {
        await supabase.from('study_record')
          .insert({ user_id: userId, word_id, study_date: now });
      }
    }

    return jsonResponse(res, 200, isNew ? '进度已保存' : '进度已更新');
  } catch (e) {
    console.error('Failed to save practice progress:', e);
    return jsonResponse(res, 500, '保存闯关进度失败，请稍后重试');
  }
});
