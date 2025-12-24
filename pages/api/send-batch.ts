import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';
import { sendAlimtalk } from '@/lib/alimtalk';
import { getCafe24Carts } from '@/lib/cafe24';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cart_nos } = req.body;

  if (!cart_nos || !Array.isArray(cart_nos) || cart_nos.length === 0) {
    return res.status(400).json({ error: '장바구니 번호가 필요합니다.' });
  }

  try {
    // 카페24에서 장바구니 정보 가져오기 (모든 장바구니 조회)
    const allCarts = await getCafe24Carts(undefined, undefined, { limit: 1000 });
    const targetCarts = allCarts.carts.filter((cart) =>
      cart_nos.includes(cart.cart_no)
    );

    if (targetCarts.length === 0) {
      return res.status(404).json({ error: '선택한 장바구니를 찾을 수 없습니다.' });
    }

    let successCount = 0;
    let failedCount = 0;

    // 각 장바구니에 대해 알림톡 발송
    for (const cart of targetCarts) {
      // 마케팅 수신동의 확인
      if (!cart.marketing_consent) {
        console.log(`⚠️  마케팅 수신동의 없음: ${cart.cart_no}`);
        failedCount++;
        continue;
      }

      // 이미 발송된 장바구니인지 확인
      const existingCart = db
        .prepare(
          `SELECT id, status FROM abandoned_carts 
           WHERE customer_phone = ? AND product_name = ? 
           ORDER BY id DESC LIMIT 1`
        )
        .get(cart.customer_phone, cart.product_name) as
        | { id: number; status: string }
        | undefined;

      if (existingCart && existingCart.status === 'notified') {
        console.log(`⚠️  이미 발송됨: ${cart.cart_no}`);
        continue;
      }

      const monthlyPayment = Math.floor(cart.total_amount / 12);

      try {
        // 장바구니 이탈 데이터 저장 또는 업데이트
        let cartId: number;
        if (existingCart) {
          cartId = existingCart.id;
          db.prepare(
            `UPDATE abandoned_carts 
             SET total_amount = ?, monthly_payment = ?, status = 'pending'
             WHERE id = ?`
          ).run(cart.total_amount, monthlyPayment, cartId);
        } else {
          const cartResult = db
            .prepare(
              `INSERT INTO abandoned_carts 
               (customer_name, customer_phone, product_name, total_amount, monthly_payment, status)
               VALUES (?, ?, ?, ?, ?, 'pending')`
            )
            .run(
              cart.customer_name,
              cart.customer_phone,
              cart.product_name,
              cart.total_amount,
              monthlyPayment
            );
          cartId = cartResult.lastInsertRowid as number;
        }

        // 알림톡 발송
        const alimtalkResult = await sendAlimtalk(
          cart.customer_phone,
          cart.customer_name,
          cart.product_name,
          cart.total_amount,
          monthlyPayment,
          cartId
        );

        // 알림톡 발송 로그 저장
        db.prepare(
          `INSERT INTO alimtalk_logs 
           (abandoned_cart_id, message_id, phone, message, status, error_message)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).run(
          cartId,
          alimtalkResult.messageId || null,
          cart.customer_phone,
          `[장바구니 안내] - 월 ${monthlyPayment.toLocaleString()}원 분할 결제 옵션 안내`,
          alimtalkResult.success ? 'sent' : 'failed',
          alimtalkResult.error || null
        );

        // 장바구니 상태 업데이트
        if (alimtalkResult.success) {
          db.prepare(
            `UPDATE abandoned_carts 
             SET status = 'notified', notified_at = CURRENT_TIMESTAMP 
             WHERE id = ?`
          ).run(cartId);
          successCount++;
        } else {
          failedCount++;
        }
      } catch (error: any) {
        console.error(`장바구니 ${cart.cart_no} 발송 실패:`, error);
        failedCount++;
      }
    }

    return res.status(200).json({
      success: true,
      success_count: successCount,
      failed_count: failedCount,
      total_count: cart_nos.length,
      message: `${successCount}건 발송 완료, ${failedCount}건 실패`,
    });
  } catch (error: any) {
    console.error('일괄 발송 오류:', error);
    return res.status(500).json({
      error: error.message || '서버 오류가 발생했습니다.',
    });
  }
}

