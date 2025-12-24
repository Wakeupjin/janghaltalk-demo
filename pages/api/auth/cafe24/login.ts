import type { NextApiRequest, NextApiResponse } from 'next';
import { getCafe24AuthUrl } from '@/lib/cafe24-auth';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const clientId = process.env.CAFE24_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/cafe24/callback`;

  if (!clientId) {
    return res.status(500).json({ error: '카페24 Client ID가 설정되지 않았습니다.' });
  }

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    return res.status(500).json({ error: 'NEXT_PUBLIC_APP_URL이 설정되지 않았습니다.' });
  }

  const authUrl = getCafe24AuthUrl(clientId, redirectUri);
  
  // 리다이렉트
  res.redirect(authUrl);
}

