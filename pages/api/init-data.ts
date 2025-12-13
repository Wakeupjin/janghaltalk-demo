import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';

/**
 * 초기 샘플 데이터 생성 API
 * 데모용으로 현실적인 데이터를 생성합니다
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sampleNames = ['김철수', '이영희', '박민수', '최지영', '정수진', '한동훈', '오세영', '윤미래'];
    const sampleProducts = ['의류', '신발', '가방', '액세서리', '화장품', '생활용품', '전자제품', '도서'];
    
    // 총 100건의 장바구니 생성 (현실적인 비율)
    // - 구매 완료: 30건 (30%)
    // - 이탈 (알림톡 발송): 50건 (50%)
    // - 이탈 (미발송): 20건 (20%)

    let totalCreated = 0;

    // 1. 구매 완료 30건 생성
    for (let i = 0; i < 30; i++) {
      const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const randomProduct = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
      const randomAmount = Math.floor(Math.random() * 200000) + 50000; // 5만원 ~ 25만원
      const randomMonthly = Math.floor(randomAmount / 12);
      const hoursAgo = Math.floor(Math.random() * 168) + 1; // 1-168시간 전 (1주일)
      
      const cartId = db
        .prepare(
          `INSERT INTO abandoned_carts 
           (customer_name, customer_phone, product_name, total_amount, monthly_payment, status, purchased_at)
           VALUES (?, ?, ?, ?, ?, 'converted', datetime('now', '-' || ? || ' hours'))`
        )
        .run(
          randomName,
          `010-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          randomProduct,
          randomAmount,
          randomMonthly,
          hoursAgo
        ).lastInsertRowid;

      if (cartId) {
        db.prepare(
          `INSERT INTO conversions 
           (abandoned_cart_id, order_id, payment_method, amount, installment_months, converted_at)
           VALUES (?, ?, 'janghaltuk', ?, ?, datetime('now', '-' || ? || ' hours'))`
        ).run(
          cartId,
          `ORDER_${Date.now()}_${i}`,
          randomAmount,
          12,
          hoursAgo
        );
        totalCreated++;
      }
    }

    // 2. 이탈 (알림톡 발송됨) 50건 생성
    for (let i = 0; i < 50; i++) {
      const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const randomProduct = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
      const randomAmount = Math.floor(Math.random() * 200000) + 50000;
      const randomMonthly = Math.floor(randomAmount / 12);
      const hoursAgo = Math.floor(Math.random() * 72) + 1; // 1-72시간 전
      
      const cartId = db
        .prepare(
          `INSERT INTO abandoned_carts 
           (customer_name, customer_phone, product_name, total_amount, monthly_payment, status, notified_at)
           VALUES (?, ?, ?, ?, ?, 'notified', datetime('now', '-' || ? || ' hours'))`
        )
        .run(
          randomName,
          `010-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          randomProduct,
          randomAmount,
          randomMonthly,
          hoursAgo
        ).lastInsertRowid;

      if (cartId) {
        // 알림톡 발송 로그도 생성
        db.prepare(
          `INSERT INTO alimtalk_logs 
           (abandoned_cart_id, message_id, phone, message, status, sent_at)
           VALUES (?, ?, ?, ?, 'sent', datetime('now', '-' || ? || ' hours'))`
        ).run(
          cartId,
          `MSG_${Date.now()}_${i}`,
          `010-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          `🎉 특별 혜택 알림 - 월 ${randomMonthly.toLocaleString()}원으로 시작하는 특별 분할 결제 이벤트`,
          hoursAgo
        );
        totalCreated++;
      }
    }

    // 3. 이탈 (미발송) 20건 생성
    for (let i = 0; i < 20; i++) {
      const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const randomProduct = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
      const randomAmount = Math.floor(Math.random() * 200000) + 50000;
      const randomMonthly = Math.floor(randomAmount / 12);
      const hoursAgo = Math.floor(Math.random() * 24) + 1; // 1-24시간 전 (아직 발송 안됨)
      
      db.prepare(
        `INSERT INTO abandoned_carts 
         (customer_name, customer_phone, product_name, total_amount, monthly_payment, status, added_at)
         VALUES (?, ?, ?, ?, ?, 'pending', datetime('now', '-' || ? || ' hours'))`
      ).run(
        randomName,
        `010-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        randomProduct,
        randomAmount,
        randomMonthly,
        hoursAgo
      );
      totalCreated++;
    }

    return res.status(200).json({
      success: true,
      message: '초기 데이터가 생성되었습니다.',
      total_created: totalCreated,
      breakdown: {
        purchased: 30,
        notified: 50,
        pending: 20,
      },
    });
  } catch (error: any) {
    console.error('초기 데이터 생성 오류:', error);
    return res.status(500).json({
      error: error.message || '서버 오류가 발생했습니다.',
    });
  }
}

