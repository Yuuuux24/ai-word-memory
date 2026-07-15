"""
Flask 应用入口
- 全局注册 CORS 跨域
- 注册所有路由蓝图
"""
from flask import Flask
from flask_cors import CORS

from config import Config
from routes.word import word_bp
from routes.ai_api import ai_api_bp
from routes.record import record_bp
from routes.user import user_bp
from routes.practice import practice_bp


def create_app():
    """创建并配置 Flask 应用"""
    app = Flask(__name__)

    # 全局开启 CORS 跨域，适配前端 3000 端口
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

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(
        debug=Config.DEBUG,
        host=Config.HOST,
        port=Config.PORT
    )
