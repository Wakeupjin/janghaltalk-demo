// 메모리 기반 데이터베이스 (Vercel 서버리스 환경용)

interface AbandonedCart {
  id: number;
  customer_name: string;
  customer_phone: string;
  product_name: string;
  total_amount: number;
  monthly_payment: number;
  installment_months: number;
  added_at: string;
  notified_at: string | null;
  purchased_at: string | null;
  status: 'pending' | 'notified' | 'converted' | 'expired';
}

interface AlimtalkLog {
  id: number;
  abandoned_cart_id: number | null;
  message_id: string | null;
  phone: string;
  message: string;
  sent_at: string;
  status: 'sent' | 'delivered' | 'failed';
  error_message: string | null;
}

interface Conversion {
  id: number;
  abandoned_cart_id: number | null;
  order_id: string | null;
  payment_method: string;
  amount: number;
  installment_months: number | null;
  converted_at: string;
}

class MemoryDB {
  private abandonedCarts: AbandonedCart[] = [];
  private alimtalkLogs: AlimtalkLog[] = [];
  private conversions: Conversion[] = [];
  private cartIdCounter = 1;
  private logIdCounter = 1;
  private conversionIdCounter = 1;

  prepare(query: string) {
    return {
      get: (...params: any[]) => {
        if (query.includes('SELECT COUNT(*)')) {
          if (query.includes('FROM abandoned_carts')) {
            if (query.includes("WHERE status = 'converted'")) {
              return { count: this.abandonedCarts.filter(c => c.status === 'converted').length };
            }
            if (query.includes("WHERE status IN ('pending', 'notified')")) {
              return { count: this.abandonedCarts.filter(c => c.status === 'pending' || c.status === 'notified').length };
            }
            return { count: this.abandonedCarts.length };
          }
          if (query.includes('FROM alimtalk_logs')) {
            if (query.includes("WHERE status = 'sent'")) {
              if (params.length === 2) {
                // 특정 전화번호와 상품명으로 필터링
                const phone = params[0];
                const productName = params[1];
                const cartIds = this.abandonedCarts
                  .filter(c => c.customer_phone === phone && c.product_name === productName)
                  .map(c => c.id);
                return { count: this.alimtalkLogs.filter(l => cartIds.includes(l.abandoned_cart_id || -1) && l.status === 'sent').length };
              }
              return { count: this.alimtalkLogs.filter(l => l.status === 'sent').length };
            }
            return { count: this.alimtalkLogs.length };
          }
          if (query.includes('FROM conversions')) {
            return { count: this.conversions.length };
          }
        }
        if (query.includes('SELECT COALESCE(SUM(amount)')) {
          return { total: this.conversions.reduce((sum, c) => sum + c.amount, 0) };
        }
        if (query.includes('SELECT al.sent_at, ac.status, ac.notified_at')) {
          const phone = params[0];
          const productName = params[1];
          const cart = this.abandonedCarts.find(c => c.customer_phone === phone && c.product_name === productName);
          if (!cart) return undefined;
          const log = this.alimtalkLogs
            .filter(l => l.abandoned_cart_id === cart.id)
            .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())[0];
          if (!log) return undefined;
          return {
            sent_at: log.sent_at,
            status: log.status,
            notified_at: cart.notified_at,
          };
        }
        return undefined;
      },
      run: (...params: any[]) => {
        if (query.includes('INSERT INTO abandoned_carts')) {
          const cart: AbandonedCart = {
            id: this.cartIdCounter++,
            customer_name: params[0],
            customer_phone: params[1],
            product_name: params[2],
            total_amount: params[3],
            monthly_payment: params[4],
            installment_months: 12,
            added_at: new Date().toISOString(),
            notified_at: null,
            purchased_at: null,
            status: params[5] || 'pending',
          };
          this.abandonedCarts.push(cart);
          return { lastInsertRowid: cart.id };
        }
        if (query.includes('INSERT INTO alimtalk_logs')) {
          const log: AlimtalkLog = {
            id: this.logIdCounter++,
            abandoned_cart_id: params[0] || null,
            message_id: params[1] || null,
            phone: params[2],
            message: params[3],
            sent_at: new Date().toISOString(),
            status: params[4] || 'sent',
            error_message: params[5] || null,
          };
          this.alimtalkLogs.push(log);
          return { lastInsertRowid: log.id };
        }
        if (query.includes('INSERT INTO conversions')) {
          const conversion: Conversion = {
            id: this.conversionIdCounter++,
            abandoned_cart_id: params[0] || null,
            order_id: params[1] || null,
            payment_method: params[2] || 'janghaltuk',
            amount: params[3],
            installment_months: params[4] || 12,
            converted_at: new Date().toISOString(),
          };
          this.conversions.push(conversion);
          return { lastInsertRowid: conversion.id };
        }
        if (query.includes('UPDATE abandoned_carts')) {
          const id = params[params.length - 1];
          const cart = this.abandonedCarts.find(c => c.id === id);
          if (cart) {
            if (query.includes("status = 'converted'")) {
              cart.status = 'converted';
              cart.purchased_at = new Date().toISOString();
            }
            if (query.includes("status = 'notified'")) {
              cart.status = 'notified';
              cart.notified_at = new Date().toISOString();
            }
          }
          return { changes: 1 };
        }
        return { changes: 0 };
      },
      all: () => {
        return [];
      },
    };
  }

  exec(query: string) {
    // 테이블 생성은 무시 (메모리에서는 필요 없음)
  }
}

// Vercel 환경에서는 메모리 DB 사용, 로컬에서는 SQLite 사용
const isVercel = process.env.VERCEL === '1' || process.env.NEXT_PUBLIC_VERCEL_ENV;

let db: any;

if (isVercel) {
  // Vercel 환경: 메모리 DB 사용
  db = new MemoryDB();
} else {
  // 로컬 환경: SQLite 사용
  try {
    // 동적 import로 better-sqlite3 로드 (빌드 시점에는 필요 없음)
    const Database = require('better-sqlite3');
    const path = require('path');
    const fs = require('fs');
    
    const dbDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    const dbPath = path.join(dbDir, 'janghaltalk.db');
    db = new Database(dbPath);
    
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
  } catch (error: any) {
    // SQLite 로드 실패 시 메모리 DB로 폴백
    console.warn('SQLite 로드 실패, 메모리 DB 사용:', error?.message || error);
    db = new MemoryDB();
  }
}

export default db;

