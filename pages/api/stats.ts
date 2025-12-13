import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';
import { DashboardStats } from '@/lib/types';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<DashboardStats | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 총 장바구니 수 (모든 상태 포함)
    const totalCarts = db
      .prepare('SELECT COUNT(*) as count FROM abandoned_carts')
      .get() as { count: number };

    // 구매 완료 수
    const purchasedCarts = db
      .prepare(
        `SELECT COUNT(*) as count FROM abandoned_carts 
         WHERE status = 'converted'`
      )
      .get() as { count: number };

    // 이탈 고객 수 (pending + notified 상태)
    const abandonedCarts = db
      .prepare(
        `SELECT COUNT(*) as count FROM abandoned_carts 
         WHERE status IN ('pending', 'notified')`
      )
      .get() as { count: number };

    // 알림톡 발송 수
    const alimtalkSent = db
      .prepare("SELECT COUNT(*) as count FROM alimtalk_logs WHERE status = 'sent'")
      .get() as { count: number };

    // 전환 완료 수
    const conversions = db
      .prepare('SELECT COUNT(*) as count FROM conversions')
      .get() as { count: number };

    // 추가 매출 계산
    const revenueResult = db
      .prepare('SELECT COALESCE(SUM(amount), 0) as total FROM conversions')
      .get() as { total: number };

    const totalCartsCount = totalCarts.count;
    const purchasedCartsCount = purchasedCarts.count;
    const abandonedCartsCount = abandonedCarts.count;
    const alimtalkSentCount = alimtalkSent.count;
    const conversionsCount = conversions.count;

    // 이탈률 계산 (전체 대비 이탈 비율)
    const abandonmentRate =
      totalCartsCount > 0 ? (abandonedCartsCount / totalCartsCount) * 100 : 0;

    // 전환율 계산 (알림톡 발송 대비)
    const conversionRate =
      alimtalkSentCount > 0 ? (conversionsCount / alimtalkSentCount) * 100 : 0;

    // 최종 포기율 계산 (전체 대비 미전환)
    const finalAbandonmentRate =
      totalCartsCount > 0
        ? ((totalCartsCount - conversionsCount) / totalCartsCount) * 100
        : 0;

    const stats: DashboardStats = {
      total_carts: totalCartsCount,
      abandoned_carts: abandonedCartsCount,
      abandonment_rate: abandonmentRate,
      alimtalk_sent: alimtalkSentCount,
      conversions: conversionsCount,
      conversion_rate: conversionRate,
      final_abandonment_rate: finalAbandonmentRate,
      additional_revenue: revenueResult.total,
    };

    return res.status(200).json(stats);
  } catch (error: any) {
    console.error('통계 조회 오류:', error);
    return res.status(500).json({
      error: error.message || '서버 오류가 발생했습니다.',
    });
  }
}

