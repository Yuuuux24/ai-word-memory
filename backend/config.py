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
    # 跨域配置：允许前端 localhost:3000 访问
    CORS_ORIGINS = ['http://localhost:3000']

    # Supabase 配置（后续接入数据库时使用）
    SUPABASE_URL = os.getenv('SUPABASE_URL', '')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY', '')

    # Flask 配置
    DEBUG = os.getenv('FLASK_DEBUG', '1') == '1'
    HOST = os.getenv('FLASK_HOST', '0.0.0.0')
    PORT = int(os.getenv('FLASK_PORT', 5000))
