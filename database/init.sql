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

-- 4. 添加 review_status 字段（兼容旧数据，实际按用户状态由 user_word_status 表维护）
ALTER TABLE words ADD COLUMN IF NOT EXISTS review_status INTEGER DEFAULT 0;

-- 4c. 用户-单词掌握状态表（隔离不同用户状态）
CREATE TABLE IF NOT EXISTS user_word_status (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES users(id) NOT NULL,
    word_id         INTEGER REFERENCES words(id) NOT NULL,
    review_status   INTEGER DEFAULT 0,
    updated_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, word_id)
);

CREATE INDEX IF NOT EXISTS idx_user_word_status_user_id ON user_word_status(user_id);
CREATE INDEX IF NOT EXISTS idx_user_word_status_word_id ON user_word_status(word_id);

-- 4d. 添加 AI 记忆素材字段
ALTER TABLE words ADD COLUMN IF NOT EXISTS root_analysis TEXT DEFAULT '';
ALTER TABLE words ADD COLUMN IF NOT EXISTS mnemonic      TEXT DEFAULT '';
ALTER TABLE words ADD COLUMN IF NOT EXISTS extra_example TEXT DEFAULT '';
ALTER TABLE words ADD COLUMN IF NOT EXISTS phrase        TEXT DEFAULT '';
ALTER TABLE words ADD COLUMN IF NOT EXISTS sentence      TEXT DEFAULT '';

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

-- 5b. 闯关进度表（用户-单词粒度，记录答对次数和冷却）
CREATE TABLE IF NOT EXISTS practice_progress (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER REFERENCES users(id),
    word_id             INTEGER REFERENCES words(id),
    correct_count       INTEGER DEFAULT 0,
    cooldown_remaining  INTEGER DEFAULT 0,
    updated_at          TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, word_id)
);

-- 6. 创建索引
CREATE INDEX IF NOT EXISTS idx_study_record_user_id  ON study_record(user_id);
CREATE INDEX IF NOT EXISTS idx_study_record_word_id  ON study_record(word_id);
CREATE INDEX IF NOT EXISTS idx_words_created_at       ON words(created_at);
CREATE INDEX IF NOT EXISTS idx_practice_progress_uid   ON practice_progress(user_id);

-- =============================================
-- 7. Row Level Security (RLS) 行级安全策略
-- =============================================

-- 7a. 启用 RLS
ALTER TABLE words             ENABLE ROW LEVEL SECURITY;
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_record      ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_word_status  ENABLE ROW LEVEL SECURITY;

-- 7b. words 表：匿名可读，写入仅 service_role 受控（后端通过 API 操作）
CREATE POLICY words_select_anon ON words
    FOR SELECT USING (true);

-- 7c. users 表：匿名可读自身数据，写入仅后端受控
CREATE POLICY users_select_anon ON users
    FOR SELECT USING (true);

-- 7d. study_record 表：匿名可读，写入仅后端受控
CREATE POLICY study_record_select_anon ON study_record
    FOR SELECT USING (true);

-- 7e. practice_progress 表：匿名可读，写入仅后端受控
CREATE POLICY practice_progress_select_anon ON practice_progress
    FOR SELECT USING (true);

-- 7f. user_word_status 表：匿名可读，写入仅后端受控
CREATE POLICY user_word_status_select_anon ON user_word_status
    FOR SELECT USING (true);
