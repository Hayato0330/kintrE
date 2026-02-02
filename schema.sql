-- 既存のテーブルがあれば削除（リセット用）
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Transactions;
DROP TABLE IF EXISTS Requests;

-- 1. ユーザー情報テーブル（ステップ1〜3用）
CREATE TABLE Users (
  account_number TEXT UNIQUE,
  name TEXT NOT NULL,
  icon_url TEXT,
  money INTEGER DEFAULT 0
);

-- 2. 送金履歴テーブル（ステップ4〜6用）
CREATE TABLE Transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER,
  recipient_id INTEGER,
  amount INTEGER,
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. 請求管理テーブル（ステップ7〜9用）
CREATE TABLE Requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_id INTEGER,  -- 請求した人
  payer_id INTEGER,      -- 支払った人（未払いの時はNULL）
  amount INTEGER,
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_paid BOOLEAN DEFAULT 0
);

-- テストデータの挿入（最初にデータがないと動かないため）
INSERT INTO Users (name, icon_url, account_number, money) VALUES
  ('自分', 'https://placehold.co/100', '1234567', 50000),
  ('山田 太郎', 'https://placehold.co/100', '9876543', 10000),
  ('鈴木 花子', 'https://placehold.co/100', '1122334', 5000);