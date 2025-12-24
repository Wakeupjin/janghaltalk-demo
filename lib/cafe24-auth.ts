/**
 * 카페24 OAuth 인증 유틸리티
 */

export interface Cafe24AuthToken {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  mall_id: string;
  shop_no: string;
}

/**
 * CSRF 방지를 위한 state 생성
 */
function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * 카페24 OAuth 인증 URL 생성
 */
export function getCafe24AuthUrl(clientId: string, redirectUri: string): string {
  const baseUrl = 'https://cafe24api.cafe24.com/oauth/authorize';
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'mall.read_order,mall.read_customer,mall.read_product',
    state: generateState(),
  });
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * 인증 코드로 액세스 토큰 교환
 */
export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<Cafe24AuthToken> {
  const response = await fetch('https://cafe24api.cafe24.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || '토큰 교환 실패');
  }

  const data = await response.json();
  
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in * 1000),
    mall_id: data.mall_id,
    shop_no: data.shop_no || '1',
  };
}

/**
 * 리프레시 토큰으로 액세스 토큰 갱신
 */
export async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<Cafe24AuthToken> {
  const response = await fetch('https://cafe24api.cafe24.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error('토큰 갱신 실패');
  }

  const data = await response.json();
  
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken,
    expires_at: Date.now() + (data.expires_in * 1000),
    mall_id: data.mall_id,
    shop_no: data.shop_no || '1',
  };
}

