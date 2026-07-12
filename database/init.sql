-- =============================================
-- AI 单词记忆系统 - 数据库初始化 SQL
-- 在 Supabase SQL Editor 中执行本文件
-- =============================================

-- 1. 创建单词表
CREATE TABLE IF NOT EXISTS words (
    id          SERIAL PRIMARY KEY,
    word        VARCHAR(100)  NOT NULL,
    phonetic    VARCHAR(100),
    meaning     TEXT          NOT NULL,
    part_of_speech  VARCHAR(50),
    example_sentence TEXT,
    ai_memo     TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- 2. 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(100) NOT NULL UNIQUE,
    email       VARCHAR(200) NOT NULL UNIQUE,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- 3. 创建学习记录表
CREATE TABLE IF NOT EXISTS study_records (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES users(id),
    word_id         INTEGER REFERENCES words(id),
    is_known         BOOLEAN DEFAULT FALSE,
    review_count    INTEGER DEFAULT 0,
    last_reviewed_at TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- 4. 插入 10 条测试单词数据
INSERT INTO words (word, phonetic, meaning, part_of_speech, example_sentence) VALUES
('abandon',      '/əˈbændən/',    '抛弃，放弃',                        'verb',    'He decided to abandon his old habits.'),
('brilliant',    '/ˈbrɪljənt/',   '杰出的，明亮的',                    'adj',     'She had a brilliant idea for the project.'),
('curious',      '/ˈkjʊriəs/',    '好奇的',                           'adj',     'The child was curious about everything.'),
('diligent',     '/ˈdɪlɪdʒənt/',  '勤奋的',                           'adj',     'A diligent student always finishes homework on time.'),
('embrace',      '/ɪmˈbreɪs/',    '拥抱，欣然接受',                    'verb',    'We should embrace new challenges.'),
('fragile',      '/ˈfrædʒaɪl/',   '脆弱的，易碎的',                    'adj',     'Be careful, the glass is fragile.'),
('generous',     '/ˈdʒenərəs/',   '慷慨的，大方的',                    'adj',     'He is generous with his time and money.'),
('harvest',      '/ˈhɑːrvɪst/',   '收获，收割',                        'verb/noun', 'Farmers harvest crops in autumn.'),
('inevitable',   '/ɪnˈevɪtəbl/',  '不可避免的',                       'adj',     'Change is inevitable in life.'),
('journey',      '/ˈdʒɜːrni/',    '旅程，旅行',                        'noun',    'The journey of a thousand miles begins with a single step.');

-- 5. 创建索引（提升查询性能）
CREATE INDEX IF NOT EXISTS idx_study_records_user_id  ON study_records(user_id);
CREATE INDEX IF NOT EXISTS idx_study_records_word_id  ON study_records(word_id);
CREATE INDEX IF NOT EXISTS idx_words_created_at       ON words(created_at);
