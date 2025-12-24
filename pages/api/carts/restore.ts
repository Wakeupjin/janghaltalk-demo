import type { NextApiRequest, NextApiResponse } from 'next';
import { restoreCafe24Cart } from '@/lib/cafe24';
import { getValidAccessToken } from '@/lib/cafe24-token';

/**
 * 쿠키 파싱 헬퍼 함수
 */
function parseCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    if (parts.length === 2) {
      cookies[parts[0].trim()] = decodeURIComponent(parts[1].trim());
    }
  });
  
  return cookies;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cart_id, cart_no } = req.body;

    if (!cart_id && !cart_no) {
      return res.status(400).json({ error: '장바구니 ID 또는 번호가 필요합니다.' });
    }

    // 쿠키에서 mall_id 가져오기
    const cookieHeader = req.headers.cookie;
    const cookies = parseCookies(cookieHeader);
    const mallId = cookies.mall_id || req.cookies?.mall_id;

    if (!mallId) {
      return res.status(401).json({ error: '카페24 연결이 필요합니다.' });
    }

    // 토큰 가져오기
    const accessToken = await getValidAccessToken(mallId);

    if (!accessToken) {
      return res.status(401).json({ error: '카페24 인증 토큰이 없습니다.' });
    }

    // 장바구니 복원
    const cartIdentifier = cart_no || cart_id;
    const restoreResult = await restoreCafe24Cart(
      cartIdentifier,
      mallId,
      accessToken
    );

    if (!restoreResult.success) {
      return res.status(500).json({
        error: restoreResult.error || '장바구니 복원에 실패했습니다.',
      });
    }

    return res.status(200).json(restoreResult);
  } catch (error: any) {
    console.error('장바구니 복원 오류:', error);
    return res.status(500).json({
      error: error.message || '서버 오류가 발생했습니다.',
    });
  }
}

