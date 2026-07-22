/**
 * POST /api/study/add — 新增学习记录（需 JWT 鉴权）
 */
import { getSupabase } from '../../../lib/supabase';
import { jwtRequired } from '../../../lib/jwt';
import { jsonResponse } from '../../../lib/response';

export default jwtRequired(async (req, res) => {
  if (req.method !== 'POST') {
    return jsonResponse(res, 405, 'Method Not Allowed');
  }

  try {
    const { word_id } = req.body || {};
    if (!word_id) return jsonResponse(res, 400, '缺少必填参数 word_id');

    const wordId = parseInt(word_id);
    if (isNaN(wordId)) return jsonResponse(res, 400, 'word_id 必须为整数');

    const supabase = getSupabase();
    const userId = req.userId;
    const now = new Date().toISOString();

    // 校验单词
    const wr = await supabase.from('words').select('id,word').eq('id', wordId);
    if (!wr.data || wr.data.length === 0) {
      return jsonResponse(res, 404, `单词 ID ${wordId} 不存在`);
    }

    // 已有记录则更新，否则新建
    const existing = await supabase.from('study_record')
      .select('*')
      .eq('user_id', userId)
      .eq('word_id', wordId);

    if (existing.data && existing.data.length > 0) {
      await supabase.from('study_record')
        .update({ study_date: now })
        .eq('id', existing.data[0].id);
    } else {
      await supabase.from('study_record')
        .insert({ user_id: userId, word_id: wordId, study_date: now });
    }

    // 同步标记为已掌握
    const statusExist = await supabase.from('user_word_status')
      .select('id')
      .eq('user_id', userId)
      .eq('word_id', wordId);

    if (statusExist.data && statusExist.data.length > 0) {
      await supabase.from('user_word_status')
        .update({ review_status: 1 })
        .eq('id', statusExist.data[0].id);
    } else {
      await supabase.from('user_word_status')
        .insert({ user_id: userId, word_id: wordId, review_status: 1 });
    }

    return jsonResponse(res, 200, '学习记录保存成功');
  } catch (e) {
    console.error('Failed to save study record:', e);
    return jsonResponse(res, 500, '保存学习记录失败，请稍后重试');
  }
});
