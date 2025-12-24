import type { NextApiRequest, NextApiResponse } from 'next';
import { exchangeCodeForToken } from '@/lib/cafe24-auth';
import db from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`/?error=${encodeURIComponent(error as string)}`);
  }

  if (!code) {
    return res.redirect('/?error=인증_코드가_없습니다');
  }

  try {
    const clientId = process.env.CAFE24_CLIENT_ID;
    const clientSecret = process.env.CAFE24_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/cafe24/callback`;

    if (!clientId || !clientSecret) {
      throw new Error('카페24 인증 정보가 설정되지 않았습니다.');
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      throw new Error('NEXT_PUBLIC_APP_URL이 설정되지 않았습니다.');
    }

    // 인증 코드를 액세스 토큰으로 교환
    const token = await exchangeCodeForToken(
      code as string,
      clientId,
      clientSecret,
      redirectUri
    );

    // 토큰을 메모리 DB에 저장
    // Vercel 환경에서는 메모리 DB 사용
    if (!(db as any).tokens) {
      (db as any).tokens = {};
    }
    
    (db as any).tokens[token.mall_id] = {
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      expires_at: token.expires_at,
      shop_no: token.shop_no,
      updated_at: new Date().toISOString(),
    };

    // 세션 쿠키 설정
    res.setHeader('Set-Cookie', `mall_id=${token.mall_id}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=86400`);
    
    // 메인 페이지로 리다이렉트
    res.redirect('/?connected=true');
  } catch (error: any) {
    console.error('카페24 인증 오류:', error);
    res.redirect(`/?error=${encodeURIComponent(error.message)}`);
  }
}

