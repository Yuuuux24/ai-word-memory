# Railway 后端部署 Dockerfile
FROM python:3.11-slim

WORKDIR /app

# 先安装后端依赖
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制后端代码
COPY backend/ .

EXPOSE 5000

CMD exec gunicorn wsgi:application --bind 0.0.0.0:${PORT:-5000}
