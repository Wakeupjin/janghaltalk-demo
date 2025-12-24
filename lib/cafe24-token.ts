/**
 * 카페24 토큰 조회 및 관리 유틸리티
 */
import db from '@/lib/db';
import { refreshAccessToken } from './cafe24-auth';

interface StoredToken {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  shop_no: string;
  updated_at: string;
}

/**
 * 저장된 토큰 조회
 */
export function getStoredToken(mallId: string): StoredToken | null {
  const tokens = (db as any).tokens || {};
  return tokens[mallId] || null;
}

/**
 * 유효한 액세스 토큰 가져오기 (만료 시 자동 갱신)
 */
export async function getValidAccessToken(mallId: string): Promise<string | null> {
  const stored = getStoredToken(mallId);
  
  if (!stored) {
    return null;
  }

  // 토큰이 만료되기 5분 전이면 갱신
  const now = Date.now();
  const expiresAt = stored.expires_at;
  
  if (now >= expiresAt - 5 * 60 * 1000) {
    // 토큰 갱신 필요
    try {
      const clientId = process.env.CAFE24_CLIENT_ID;
      const clientSecret = process.env.CAFE24_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        return stored.access_token; // 갱신 실패 시 기존 토큰 반환
      }

      const newToken = await refreshAccessToken(
        stored.refresh_token,
        clientId,
        clientSecret
      );

      // 갱신된 토큰 저장
      if (!(db as any).tokens) {
        (db as any).tokens = {};
      }
      
      (db as any).tokens[mallId] = {
        access_token: newToken.access_token,
        refresh_token: newToken.refresh_token,
        expires_at: newToken.expires_at,
        shop_no: newToken.shop_no,
        updated_at: new Date().toISOString(),
      };

      return newToken.access_token;
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      return stored.access_token; // 갱신 실패 시 기존 토큰 반환
    }
  }

  return stored.access_token;
}

