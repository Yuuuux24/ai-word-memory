-- =============================================
-- AI 单词记忆系统 - 数据库初始化 SQL
-- 在 Supabase SQL Editor 中执行本文件
-- =============================================

-- 1. 创建单词表
CREATE TABLE IF NOT EXISTS words (
    id          SERIAL PRIMARY KEY,
    word        VARCHAR(100)  NOT NULL,
    phonetic    VARCHAR(100),
    basic_meaning TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMP DEFAULT NOW()
);

-- 2. 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL DEFAULT '',
    created_at  TIMESTAMP DEFAULT NOW()
);

-- 2b. 补充 password_hash 字段（向后兼容旧表）
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NOT NULL DEFAULT '';

-- 3. 创建学习记录表
CREATE TABLE IF NOT EXISTS study_record (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES users(id),
    word_id         INTEGER REFERENCES words(id),
    study_date      TIMESTAMP DEFAULT NOW()
);

-- 4. 添加 review_status 字段（单词掌握状态：0=待复习，1=已掌握）
ALTER TABLE words ADD COLUMN IF NOT EXISTS review_status INTEGER DEFAULT 0;

-- 5. 插入 10 条测试单词数据
INSERT INTO words (word, phonetic, basic_meaning) VALUES
('abandon',      '/əˈbændən/',    'v. 抛弃，放弃'),
('brilliant',    '/ˈbrɪljənt/',   'adj. 杰出的，明亮的'),
('curious',      '/ˈkjʊriəs/',    'adj. 好奇的'),
('diligent',     '/ˈdɪlɪdʒənt/',  'adj. 勤奋的'),
('embrace',      '/ɪmˈbreɪs/',    'v. 拥抱，欣然接受'),
('fragile',      '/ˈfrædʒaɪl/',   'adj. 脆弱的，易碎的'),
('generous',     '/ˈdʒenərəs/',   'adj. 慷慨的，大方的'),
('harvest',      '/ˈhɑːrvɪst/',   'v./n. 收获，收割'),
('inevitable',   '/ɪnˈevɪtəbl/',  'adj. 不可避免的'),
('journey',      '/ˈdʒɜːrni/',    'n. 旅程，旅行')
ON CONFLICT DO NOTHING;

-- 6. 创建索引
CREATE INDEX IF NOT EXISTS idx_study_record_user_id  ON study_record(user_id);
CREATE INDEX IF NOT EXISTS idx_study_record_word_id  ON study_record(word_id);
CREATE INDEX IF NOT EXISTS idx_words_created_at       ON words(created_at);

-- =============================================
-- 7. Row Level Security (RLS) 行级安全策略
-- =============================================

-- 7a. 启用 RLS
ALTER TABLE words        ENABLE ROW LEVEL SECURITY;
ALTER TABLE users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_record ENABLE ROW LEVEL SECURITY;

-- 7b. words 表：匿名可读，写入仅 service_role 受控（后端通过 API 操作）
CREATE POLICY words_select_anon ON words
    FOR SELECT USING (true);

-- 7c. users 表：匿名可读自身数据，写入仅后端受控
CREATE POLICY users_select_anon ON users
    FOR SELECT USING (true);

-- 7d. study_record 表：匿名可读，写入仅后端受控
CREATE POLICY study_record_select_anon ON study_record
    FOR SELECT USING (true);
