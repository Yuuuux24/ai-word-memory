/**
 * Supabase 客户端单例
 * 使用 service_role key 获得完整的读写权限（绕过 RLS）
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

let supabase = null;

function getSupabase() {
  if (supabase) return supabase;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase 配置缺失：请设置 SUPABASE_URL 和 SUPABASE_ANON_KEY 环境变量');
  }
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    db: { schema: 'public' },
  });
  return supabase;
}

export { getSupabase };
