"""
Flask 应用入口
- 全局注册 CORS 跨域
- 注册所有路由蓝图
- 配置全链路日志
"""
import logging
from flask import Flask
from flask_cors import CORS

from config import Config
from routes.word import word_bp
from routes.ai_api import ai_api_bp
from routes.record import record_bp
from routes.user import user_bp
from routes.practice import practice_bp


def setup_logging():
    """配置全链路日志"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S',
    )
    # 抑制第三方库的 DEBUG 日志
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('httpx').setLevel(logging.WARNING)


def create_app():
    """创建并配置 Flask 应用"""
    setup_logging()
    logger = logging.getLogger(__name__)

    app = Flask(__name__)

    # 全局开启 CORS 跨域
    # CORS_ORIGINS 设为 * 时允许所有来源，否则使用逗号分隔的域名列表
    if '*' in Config.CORS_ORIGINS:
        CORS(app)
    else:
        CORS(app, origins=Config.CORS_ORIGINS)

    # 注册路由蓝图
    app.register_blueprint(word_bp)
    app.register_blueprint(ai_api_bp)
    app.register_blueprint(record_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(practice_bp)

    # 根路由：健康检查
    @app.route('/')
    def index():
        return {'message': 'AI Word Memory API is running', 'status': 'ok'}

    logger.info('Flask application initialized successfully')
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(
        debug=Config.DEBUG,
        host=Config.HOST,
        port=Config.PORT
    )
