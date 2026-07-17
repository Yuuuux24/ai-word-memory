"""
应用配置文件
- 跨域配置
- Supabase 连接信息（预留）
"""
import os
from dotenv import load_dotenv

# 加载 .env 环境变量
load_dotenv()


class Config:
    """应用全局配置"""
    # 跨域配置：从环境变量读取，支持逗号分隔多个域名（默认 localhost:3000）
    _origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000')
    CORS_ORIGINS = [o.strip() for o in _origins.split(',') if o.strip()]

    # Supabase 配置
    SUPABASE_URL = os.getenv('SUPABASE_URL', '')
    SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY', '')

    # Flask 配置
    DEBUG = os.getenv('FLASK_DEBUG', '1') == '1'
    HOST = os.getenv('FLASK_HOST', '0.0.0.0')
    PORT = int(os.getenv('FLASK_PORT', 5000))
