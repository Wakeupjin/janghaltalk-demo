import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// 데이터베이스 디렉토리 생성
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'janghaltalk.db');
const db = new Database(dbPath);

// 테이블 생성
db.exec(`
  CREATE TABLE IF NOT EXISTS abandoned_carts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    product_name TEXT NOT NULL,
    total_amount REAL NOT NULL,
    monthly_payment REAL NOT NULL,
    installment_months INTEGER DEFAULT 12,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notified_at DATETIME,
    purchased_at DATETIME,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'notified', 'converted', 'expired'))
  );

  CREATE TABLE IF NOT EXISTS alimtalk_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    abandoned_cart_id INTEGER,
    message_id TEXT,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'sent' CHECK(status IN ('sent', 'delivered', 'failed')),
    error_message TEXT,
    FOREIGN KEY (abandoned_cart_id) REFERENCES abandoned_carts(id)
  );

  CREATE TABLE IF NOT EXISTS conversions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    abandoned_cart_id INTEGER,
    order_id TEXT,
    payment_method TEXT DEFAULT 'janghaltuk',
    amount REAL NOT NULL,
    installment_months INTEGER,
    converted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (abandoned_cart_id) REFERENCES abandoned_carts(id)
  );
`);

export default db;

