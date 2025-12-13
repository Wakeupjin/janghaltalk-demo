import type { NextApiRequest, NextApiResponse } from 'next';
import { getCafe24Carts } from '@/lib/cafe24';
import db from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      limit = '50',
      offset = '0',
      status,
      marketing_consent,
      min_amount,
      hours_ago,
    } = req.query;

    const result = await getCafe24Carts(
      undefined, // mallId - 실제 연동 시 세션에서 가져옴
      undefined, // accessToken - 실제 연동 시 세션에서 가져옴
      {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        status: status as string,
        marketing_consent: marketing_consent === 'true' ? true : marketing_consent === 'false' ? false : undefined,
        min_amount: min_amount ? parseInt(min_amount as string) : undefined,
        hours_ago: hours_ago ? parseInt(hours_ago as string) : undefined,
      }
    );

    // 각 장바구니에 대해 발송 이력 조회
    const cartsWithHistory = result.carts.map((cart) => {
      // 전화번호와 상품명으로 발송 이력 조회 (최신 발송 시간)
      const sentHistory = db
        .prepare(
          `SELECT al.sent_at, ac.status, ac.notified_at
           FROM alimtalk_logs al
           JOIN abandoned_carts ac ON al.abandoned_cart_id = ac.id
           WHERE ac.customer_phone = ? AND ac.product_name = ?
           ORDER BY al.sent_at DESC
           LIMIT 1`
        )
        .get(cart.customer_phone, cart.product_name) as
        | { sent_at: string; status: string; notified_at: string | null }
        | undefined;

      // 발송 횟수 조회
      const sentCount = db
        .prepare(
          `SELECT COUNT(*) as count
           FROM alimtalk_logs al
           JOIN abandoned_carts ac ON al.abandoned_cart_id = ac.id
           WHERE ac.customer_phone = ? AND ac.product_name = ? AND al.status = 'sent'`
        )
        .get(cart.customer_phone, cart.product_name) as
        | { count: number }
        | undefined;

      // Mock 장바구니에 이미 sent_count가 있으면 그것을 사용, 없으면 DB에서 조회
      // DB 조회 결과가 없으면 Mock 데이터의 sent_count 사용 (이미 cafe24.ts에서 생성됨)
      const finalSentCount = sentCount?.count || cart.sent_count || 0;
      const finalSentAt = sentHistory?.sent_at || cart.notified_at || null;

      return {
        ...cart,
        sent_at: finalSentAt,
        notified_status: finalSentAt ? 'sent' : null,
        sent_count: finalSentCount,
      };
    });

    return res.status(200).json({
      carts: cartsWithHistory,
      total: result.total,
    });
  } catch (error: any) {
    console.error('장바구니 목록 조회 오류:', error);
    return res.status(500).json({
      error: error.message || '서버 오류가 발생했습니다.',
    });
  }
}

