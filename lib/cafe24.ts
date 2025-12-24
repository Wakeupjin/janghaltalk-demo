/**
 * 카페24 API 연동 유틸리티
 * 실제 연동 전까지는 Mock 응답 반환
 */

export interface Cafe24Cart {
  cart_no: string;
  customer_name: string;
  customer_phone: string;
  marketing_consent: boolean;
  product_name: string;
  total_amount: number;
  added_at: string;
  status: 'pending' | 'purchased' | 'expired';
  item_count?: number;
  sent_at?: string | null;
  notified_status?: string | null;
  sent_count?: number; // 발송 횟수
  notified_at?: string | null; // 발송 시간
}

interface CartRestoreResult {
  success: boolean;
  cart_no?: string;
  orderform_url?: string;
  error?: string;
}

/**
 * 카페24 장바구니 복원 URL 생성
 * 실제 복원 API는 불확실하므로 URL 생성만 수행
 */
export async function restoreCafe24Cart(
  cartId: number | string,
  mallId?: string,
  accessToken?: string
): Promise<CartRestoreResult> {
  // mallId가 없으면 Mock 모드
  if (!mallId) {
    console.log('Mock 모드: 카페24 장바구니 복원 URL 생성');
    console.log(`장바구니 ID: ${cartId}`);
    
    return {
      success: true,
      cart_no: typeof cartId === 'string' ? cartId : `CART_${cartId}`,
      orderform_url: `https://${mallId || 'mall'}.cafe24.com/orderform.html?cart_no=${cartId}`,
    };
  }

  // 실제 복원 API는 불확실하므로 URL 생성만 수행
  const cartNo = typeof cartId === 'string' ? cartId : cartId.toString();
  
  return {
    success: true,
    cart_no: cartNo,
    orderform_url: generateOrderformUrl(mallId, cartNo, {
      paymentMethod: 'janghaltuk',
      installmentMonths: 12,
    }),
  };
}

/**
 * 카페24 Admin API 호출 헬퍼 함수
 */
async function callCafe24API(
  mallId: string,
  accessToken: string,
  endpoint: string,
  options?: RequestInit
): Promise<any> {
  const url = `https://${mallId}.cafe24api.com/api/v2/admin${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Cafe24-Api-Version': '2022-03-01',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'API 호출 실패' } }));
    throw new Error(error.error?.message || `API 호출 실패: ${response.status}`);
  }

  return response.json();
}

/**
 * 카페24 orderform.html URL 생성
 * 장할특 결제수단 힌트 포함
 */
export function generateOrderformUrl(
  mallId: string,
  cartNo: string,
  options?: {
    paymentMethod?: string;
    installmentMonths?: number;
  }
): string {
  const baseUrl = `https://${mallId}.cafe24.com/orderform.html`;
  const params = new URLSearchParams({
    cart_no: cartNo,
  });

  // 장할특 결제수단 힌트 (카페24에서 지원하는 경우)
  if (options?.paymentMethod) {
    params.append('payment_method', options.paymentMethod);
  }
  if (options?.installmentMonths) {
    params.append('installment_months', options.installmentMonths.toString());
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * 카페24 장바구니 목록 조회
 * 실제 카페24 Admin API 사용
 */
export async function getCafe24Carts(
  mallId?: string,
  accessToken?: string,
  options?: {
    limit?: number;
    offset?: number;
    status?: string;
    marketing_consent?: boolean;
    min_amount?: number;
    hours_ago?: number;
  }
): Promise<{ carts: Cafe24Cart[]; total: number }> {
  // mallId와 accessToken이 없으면 Mock 모드
  if (!mallId || !accessToken) {
    console.log('⚠️  Mock 모드: 카페24 장바구니 목록 조회');
    
    // Mock 데이터 생성 (기존 코드 유지)
    const sampleNames = ['김철수', '이영희', '박민수', '최지영', '정수진', '한동훈', '오세영', '윤미래', '강민호', '송지은'];
    const sampleProducts = ['의류', '신발', '가방', '액세서리', '화장품', '생활용품', '전자제품', '도서', '스포츠용품', '식품'];
    
    const carts: Cafe24Cart[] = [];
    const total = 80;
    
    for (let i = 0; i < total; i++) {
      const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const randomProduct = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
      const randomAmount = Math.floor(Math.random() * 200000) + 50000;
      const hoursAgo = Math.floor(Math.random() * 168) + 1;
      const marketingConsent = Math.random() > 0.3;
      
      let status: 'pending' | 'purchased' | 'expired';
      if (i < total * 0.6) {
        status = 'pending';
      } else if (i < total * 0.9) {
        status = 'purchased';
      } else {
        status = 'expired';
      }
      
      const addedAt = new Date();
      addedAt.setHours(addedAt.getHours() - hoursAgo);
      
      let sentCount = 0;
      let notifiedAt: string | undefined = undefined;
      
      if (status === 'pending' && Math.random() < 0.3) {
        sentCount = Math.floor(Math.random() * 2) + 1;
        const notifiedTime = new Date(addedAt);
        notifiedTime.setHours(notifiedTime.getHours() + Math.floor(Math.random() * hoursAgo));
        notifiedAt = notifiedTime.toISOString();
      } else if (status === 'purchased' && Math.random() < 0.7) {
        sentCount = Math.floor(Math.random() * 3) + 1;
        const notifiedTime = new Date(addedAt);
        notifiedTime.setHours(notifiedTime.getHours() + Math.floor(Math.random() * hoursAgo));
        notifiedAt = notifiedTime.toISOString();
      }

      carts.push({
        cart_no: `CART_${1000 + i}`,
        customer_name: randomName,
        customer_phone: `010-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        marketing_consent: marketingConsent,
        product_name: randomProduct,
        total_amount: randomAmount,
        added_at: addedAt.toISOString(),
        status: status,
        item_count: Math.floor(Math.random() * 3) + 1,
        sent_count: sentCount,
        notified_at: notifiedAt,
      });
    }
    
    let filteredCarts = [...carts];
    
    if (options?.status) {
      filteredCarts = filteredCarts.filter(cart => cart.status === options.status);
    }
    
    if (options?.marketing_consent !== undefined) {
      filteredCarts = filteredCarts.filter(cart => cart.marketing_consent === options.marketing_consent);
    }
    
    if (options?.min_amount) {
      filteredCarts = filteredCarts.filter(cart => cart.total_amount >= options.min_amount!);
    }
    
    if (options?.hours_ago) {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - options.hours_ago);
      filteredCarts = filteredCarts.filter(cart => {
        const addedAt = new Date(cart.added_at);
        return addedAt <= cutoffTime;
      });
    }
    
    filteredCarts.sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime());
    
    const offset = options?.offset || 0;
    const limit = options?.limit || 50;
    const paginatedCarts = filteredCarts.slice(offset, offset + limit);
    
    return {
      carts: paginatedCarts,
      total: filteredCarts.length,
    };
  }

  // 실제 카페24 Admin API 호출
  try {
    const params = new URLSearchParams({
      limit: (options?.limit || 50).toString(),
      offset: (options?.offset || 0).toString(),
    });

    const data = await callCafe24API(
      mallId,
      accessToken,
      `/orders/carts?${params.toString()}`
    );

    // 카페24 API 응답을 Cafe24Cart 형식으로 변환
    const carts: Cafe24Cart[] = (data.carts || []).map((cart: any) => {
      // 카페24 API 응답 형식에 맞게 변환
      const firstItem = cart.items?.[0];
      const productName = firstItem?.product_name || firstItem?.product_code || '상품명 없음';
      
      // 상태 변환: 카페24의 상태를 우리 형식으로
      let status: 'pending' | 'purchased' | 'expired' = 'pending';
      if (cart.status === 'purchased' || cart.order_status === 'purchased') {
        status = 'purchased';
      } else if (cart.status === 'expired' || cart.order_status === 'expired') {
        status = 'expired';
      }

      return {
        cart_no: cart.cart_no || cart.cart_id || '',
        customer_name: cart.customer_name || cart.buyer_name || '',
        customer_phone: cart.customer_phone || cart.buyer_phone || '',
        marketing_consent: cart.marketing_consent === 'Y' || cart.marketing_consent === true,
        product_name: productName,
        total_amount: parseInt(cart.total_amount || cart.total_price || '0', 10),
        added_at: cart.created_date || cart.added_date || cart.created_at || new Date().toISOString(),
        status: status,
        item_count: cart.items?.length || cart.item_count || 0,
      };
    });

    // 클라이언트 측 필터링 (API에서 지원하지 않는 필터)
    let filteredCarts = [...carts];
    
    if (options?.status) {
      filteredCarts = filteredCarts.filter(cart => cart.status === options.status);
    }
    
    if (options?.marketing_consent !== undefined) {
      filteredCarts = filteredCarts.filter(cart => cart.marketing_consent === options.marketing_consent);
    }
    
    if (options?.min_amount) {
      filteredCarts = filteredCarts.filter(cart => cart.total_amount >= options.min_amount!);
    }
    
    if (options?.hours_ago) {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - options.hours_ago);
      filteredCarts = filteredCarts.filter(cart => {
        const addedAt = new Date(cart.added_at);
        return addedAt <= cutoffTime;
      });
    }

    return {
      carts: filteredCarts,
      total: data.total || filteredCarts.length,
    };
  } catch (error: any) {
    console.error('카페24 장바구니 목록 조회 실패:', error);
    // 에러 발생 시 빈 배열 반환 (Mock 모드로 폴백하지 않음)
    throw error;
  }
}

