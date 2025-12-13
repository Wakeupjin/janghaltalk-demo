import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';
import { sendAlimtalk } from '@/lib/alimtalk';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customer_name, customer_phone, product_name, total_amount, monthly_payment } = req.body;

  // 입력 검증
  if (!customer_name || !customer_phone || !product_name || !total_amount) {
    return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
  }

  try {
    // 1. 장바구니 이탈 데이터 저장
    const cartResult = db
      .prepare(
        `INSERT INTO abandoned_carts 
         (customer_name, customer_phone, product_name, total_amount, monthly_payment, status)
         VALUES (?, ?, ?, ?, ?, 'pending')`
      )
      .run(customer_name, customer_phone, product_name, total_amount, monthly_payment);

    const cartId = cartResult.lastInsertRowid as number;

    // 1-1. 실제처럼 보이도록 구매 완료 건도 함께 생성 (이탈 1건당 구매 완료 2-4건)
    const purchaseCount = Math.floor(Math.random() * 3) + 2; // 2-4건
    const sampleNames = ['김철수', '이영희', '박민수', '최지영', '정수진', '한동훈'];
    const sampleProducts = ['의류', '신발', '가방', '액세서리', '화장품', '생활용품'];
    
    for (let i = 0; i < purchaseCount; i++) {
      const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const randomProduct = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
      const randomAmount = Math.floor(Math.random() * 200000) + 50000; // 5만원 ~ 25만원
      const randomMonthly = Math.floor(randomAmount / 12);
      
      // 구매 완료 건 생성
      const purchasedCartId = db
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
          Math.floor(Math.random() * 48) + 1 // 1-48시간 전
        ).lastInsertRowid;

      // 전환 데이터도 함께 생성
      if (purchasedCartId) {
        db.prepare(
          `INSERT INTO conversions 
           (abandoned_cart_id, order_id, payment_method, amount, installment_months, converted_at)
           VALUES (?, ?, 'janghaltuk', ?, ?, datetime('now', '-' || ? || ' hours'))`
        ).run(
          purchasedCartId,
          `ORDER_${Date.now()}_${i}`,
          randomAmount,
          12,
          Math.floor(Math.random() * 48) + 1
        );
      }
    }

    // 2. 알림톡 발송
    const alimtalkResult = await sendAlimtalk(
      customer_phone,
      customer_name,
      product_name,
      total_amount,
      monthly_payment,
      cartId
    );

    // 3. 알림톡 발송 로그 저장
    const logResult = db
      .prepare(
        `INSERT INTO alimtalk_logs 
         (abandoned_cart_id, message_id, phone, message, status, error_message)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        cartId,
        alimtalkResult.messageId || null,
        customer_phone,
        `🎉 특별 혜택 알림 - 월 ${monthly_payment.toLocaleString()}원으로 시작하는 특별 분할 결제 이벤트`,
        alimtalkResult.success ? 'sent' : 'failed',
        alimtalkResult.error || null
      );

    // 4. 장바구니 상태 업데이트
    if (alimtalkResult.success) {
      db.prepare(
        `UPDATE abandoned_carts 
         SET status = 'notified', notified_at = CURRENT_TIMESTAMP 
         WHERE id = ?`
      ).run(cartId);
    }

    return res.status(200).json({
      success: true,
      cart_id: cartId,
      message_id: alimtalkResult.messageId,
      message: alimtalkResult.success
        ? '알림톡이 성공적으로 발송되었습니다.'
        : '알림톡 발송에 실패했습니다. (Mock 모드에서는 정상 처리됩니다)',
    });
  } catch (error: any) {
    console.error('알림톡 발송 처리 오류:', error);
    return res.status(500).json({
      error: error.message || '서버 오류가 발생했습니다.',
    });
  }
}

