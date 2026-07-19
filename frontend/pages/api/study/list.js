/**
 * GET /api/study/list — 分页查询学习记录（需 JWT 鉴权）
 * 支持 date 筛选、review_status 筛选
 */
const { getSupabase } = require('../../../lib/supabase');
const { jwtRequired } = require('../../../lib/jwt');
const { jsonResponse } = require('../../../lib/response');

async function userWordStatusMap(supabase, userId) {
  try {
    const res = await supabase.from('user_word_status')
      .select('word_id,review_status')
      .eq('user_id', userId);
    const map = {};
    (res.data || []).forEach(r => { map[r.word_id] = r.review_status || 0; });
    return map;
  } catch { return {}; }
}

module.exports = jwtRequired(async (req, res) => {
  if (req.method !== 'GET') {
    return jsonResponse(res, 405, 'Method Not Allowed');
  }

  try {
    const userId = req.userId;
    let page = parseInt(req.query.page) || 1;
    let size = parseInt(req.query.size) || 10;
    const filterDate = (req.query.date || '').trim();
    const reviewStatus = req.query.review_status !== undefined ? parseInt(req.query.review_status) : undefined;

    if (page < 1) page = 1;
    if (size < 1) size = 10;
    if (size > 50) size = 50;

    const supabase = getSupabase();

    // 第一步：查总数
    let countQuery = supabase.from('study_record')
      .select('*, words!inner(id,word,phonetic,basic_meaning)', { count: 'exact', head: false })
      .eq('user_id', userId);

    if (filterDate) {
      countQuery = countQuery.gte('study_date', filterDate + 'T00:00:00').lt('study_date', filterDate + 'T23:59:59');
    }

    // 用 range(0,0) 取计数
    const countRes = await countQuery.range(0, 0);
    const rawTotal = countRes.count || 0;

    // 第二步：拉数据
    let dataQuery = supabase.from('study_record')
      .select('*, words!inner(id,word,phonetic,basic_meaning)')
      .eq('user_id', userId);

    if (filterDate) {
      dataQuery = dataQuery.gte('study_date', filterDate + 'T00:00:00').lt('study_date', filterDate + 'T23:59:59');
    }
    dataQuery = dataQuery.order('study_date', { ascending: false });

    let allData;
    if (reviewStatus !== undefined) {
      // 需要按状态过滤，拉全部
      const dataRes = rawTotal > 0 ? await dataQuery.range(0, rawTotal - 1) : null;
      allData = (dataRes && dataRes.data) ? dataRes.data : [];
    } else {
      let offset = (page - 1) * size;
      if (offset >= rawTotal && rawTotal > 0) {
        offset = Math.max(0, rawTotal - size);
        page = Math.floor(offset / size) + 1;
      }
      const dataRes = rawTotal > 0 ? await dataQuery.range(offset, offset + size - 1) : null;
      allData = (dataRes && dataRes.data) ? dataRes.data : [];
    }

    // 构建记录列表
    const statusMap = await userWordStatusMap(supabase, userId);
    let records = [];
    for (const r of allData) {
      const wi = r.words || {};
      const ws = statusMap[r.word_id] || 0;
      if (reviewStatus !== undefined && [0, 1].includes(reviewStatus) && ws !== reviewStatus) continue;
      records.push({
        id: r.id,
        user_id: r.user_id,
        word_id: r.word_id,
        word: wi.word || '',
        phonetic: wi.phonetic || '',
        meaning: wi.basic_meaning || '',
        review_status: ws,
        study_date: r.study_date,
      });
    }

    let total = reviewStatus !== undefined ? records.length : rawTotal;

    // reviewStatus 过滤后的分页
    if (reviewStatus !== undefined) {
      let offset = (page - 1) * size;
      if (offset >= records.length && records.length > 0) {
        offset = Math.max(0, records.length - size);
        page = Math.floor(offset / size) + 1;
      }
      records = records.slice(offset, offset + size);
    }

    return jsonResponse(res, 200, 'success', { list: records, total, page, size });
  } catch (e) {
    console.error('Failed to query study records:', e);
    return jsonResponse(res, 500, '查询学习记录失败，请稍后重试');
  }
});
