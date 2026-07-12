"""
Supabase 客户端单例模块
所有后端路由通过此模块获取数据库客户端
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

_supabase: Client = None


def get_supabase() -> Client:
    """获取 Supabase 客户端实例（懒加载单例）"""
    global _supabase
    if _supabase is None:
        if not SUPABASE_URL or not SUPABASE_ANON_KEY:
            raise RuntimeError(
                "Supabase 配置缺失，请检查 .env 文件中的 SUPABASE_URL 和 SUPABASE_ANON_KEY"
            )
        _supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    return _supabase
