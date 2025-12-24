import type { NextApiRequest, NextApiResponse } from 'next';
import { getStoredToken } from '@/lib/cafe24-token';

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

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 쿠키 파싱
  const cookieHeader = req.headers.cookie;
  const cookies = parseCookies(cookieHeader);
  const mallId = cookies.mall_id || req.cookies?.mall_id;

  if (!mallId) {
    return res.status(200).json({ connected: false });
  }

  const token = getStoredToken(mallId);

  if (!token) {
    return res.status(200).json({ connected: false });
  }

  return res.status(200).json({
    connected: true,
    mall_id: mallId,
    shop_no: token.shop_no,
    updated_at: token.updated_at,
  });
}

