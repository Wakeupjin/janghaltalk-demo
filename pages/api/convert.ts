import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';

/**
 * 전환 완료 처리 API
 * 알림톡 링크를 통해 결제 완료 시 호출되는 엔드포인트
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cart_id, order_id, amount, installment_months } = req.body;

  if (!cart_id || !amount) {
    return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
  }

  try {
    // 전환 데이터 저장
    const conversionResult = db
      .prepare(
        `INSERT INTO conversions 
         (abandoned_cart_id, order_id, payment_method, amount, installment_months)
         VALUES (?, ?, 'janghaltuk', ?, ?)`
      )
      .run(cart_id, order_id || null, amount, installment_months || 12);

    // 장바구니 상태 업데이트
    db.prepare(
      `UPDATE abandoned_carts 
       SET status = 'converted', purchased_at = CURRENT_TIMESTAMP 
       WHERE id = ?`
    ).run(cart_id);

    return res.status(200).json({
      success: true,
      conversion_id: conversionResult.lastInsertRowid,
      message: '전환이 성공적으로 기록되었습니다.',
    });
  } catch (error: any) {
    console.error('전환 처리 오류:', error);
    return res.status(500).json({
      error: error.message || '서버 오류가 발생했습니다.',
    });
  }
}

