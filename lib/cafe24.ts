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
  // 페르소나 정보
  customer_grade?: string; // 고객 등급
  purchase_history_count?: number; // 구매 이력 건수
  last_purchase_date?: string | null; // 최근 구매일
  preferred_category?: string; // 선호 카테고리
  average_order_amount?: number; // 평균 주문 금액
}

interface CartRestoreResult {
  success: boolean;
  cart_no?: string;
  orderform_url?: string;
  error?: string;
}

/**
 * 카페24 장바구니 복원
 * 실제 연동 시 카페24 Admin API 사용
 */
export async function restoreCafe24Cart(
  cartId: number,
  mallId?: string,
  accessToken?: string
): Promise<CartRestoreResult> {
  // 실제 카페24 API 연동 전까지는 Mock 응답
  if (!mallId || !accessToken) {
    console.log('⚠️  Mock 모드: 카페24 장바구니 복원 시뮬레이션');
    console.log(`📦 장바구니 ID: ${cartId}`);
    
    // Mock 응답 - 실제로는 카페24 API 호출
    return {
      success: true,
      cart_no: `CART_${cartId}_${Date.now()}`,
      orderform_url: `https://${mallId || 'mall'}.cafe24.com/orderform.html?cart_no=CART_${cartId}`,
    };
  }

  try {
    // 실제 카페24 Admin API 호출
    // const response = await fetch(
    //   `https://${mallId}.cafe24.com/api/v2/admin/orders/carts/${cartId}/restore`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': `Bearer ${accessToken}`,
    //       'Content-Type': 'application/json',
    //     },
    //   }
    // );

    // const data = await response.json();
    
    // return {
    //   success: true,
    //   cart_no: data.cart_no,
    //   orderform_url: `https://${mallId}.cafe24.com/orderform.html?cart_no=${data.cart_no}`,
    // };

    // 임시 Mock 응답
    return {
      success: true,
      cart_no: `CART_${cartId}`,
      orderform_url: `https://${mallId}.cafe24.com/orderform.html?cart_no=CART_${cartId}`,
    };
  } catch (error: any) {
    console.error('카페24 장바구니 복원 실패:', error);
    return {
      success: false,
      error: error.message || '장바구니 복원에 실패했습니다.',
    };
  }
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
 * 실제 연동 시 카페24 Admin API 사용
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
  // 실제 카페24 API 연동 전까지는 Mock 응답
  if (!mallId || !accessToken) {
    console.log('⚠️  Mock 모드: 카페24 장바구니 목록 조회');
    
    // Mock 데이터 생성
    const sampleNames = ['김철수', '이영희', '박민수', '최지영', '정수진', '한동훈', '오세영', '윤미래', '강민호', '송지은'];
    const sampleProducts = ['의류', '신발', '가방', '액세서리', '화장품', '생활용품', '전자제품', '도서', '스포츠용품', '식품'];
    
    const carts: Cafe24Cart[] = [];
    const total = 80; // 총 80건
    
    // 다양한 상태와 조건의 장바구니 생성
    const customerGrades = ['VIP', 'GOLD', 'SILVER', 'BRONZE', '일반'];
    const categories = ['패션', '뷰티', '홈리빙', '전자제품', '식품', '도서', '스포츠'];
    
    for (let i = 0; i < total; i++) {
      const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const randomProduct = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
      const randomAmount = Math.floor(Math.random() * 200000) + 50000; // 5만원 ~ 25만원
      const hoursAgo = Math.floor(Math.random() * 168) + 1; // 1-168시간 전 (1주일)
      const marketingConsent = Math.random() > 0.3; // 70% 동의
      
      // 상태 분포: 60% 이탈, 30% 구매완료, 10% 만료
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
      
      // 페르소나 정보 생성
      const customerGrade = customerGrades[Math.floor(Math.random() * customerGrades.length)];
      const purchaseHistoryCount = Math.floor(Math.random() * 20); // 0-19건
      const preferredCategory = categories[Math.floor(Math.random() * categories.length)];
      const averageOrderAmount = Math.floor(Math.random() * 150000) + 50000; // 5만원 ~ 20만원
      
      // 최근 구매일 (구매 이력이 있는 경우)
      let lastPurchaseDate: string | null = null;
      if (purchaseHistoryCount > 0) {
        const lastPurchase = new Date();
        lastPurchase.setDate(lastPurchase.getDate() - Math.floor(Math.random() * 90)); // 최근 90일 내
        lastPurchaseDate = lastPurchase.toISOString();
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
        // 페르소나 정보
        customer_grade: customerGrade,
        purchase_history_count: purchaseHistoryCount,
        last_purchase_date: lastPurchaseDate,
        preferred_category: preferredCategory,
        average_order_amount: averageOrderAmount,
      });
    }
    
    // 필터링 적용
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
    
    // 정렬: 최신순
    filteredCarts.sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime());
    
    // 페이지네이션
    const offset = options?.offset || 0;
    const limit = options?.limit || 50;
    const paginatedCarts = filteredCarts.slice(offset, offset + limit);
    
    return {
      carts: paginatedCarts,
      total: filteredCarts.length,
    };
  }

  try {
    // 실제 카페24 Admin API 호출
    // const response = await fetch(
    //   `https://${mallId}.cafe24.com/api/v2/admin/orders/carts?limit=${options?.limit || 50}&offset=${options?.offset || 0}`,
    //   {
    //     headers: {
    //       'Authorization': `Bearer ${accessToken}`,
    //       'Content-Type': 'application/json',
    //     },
    //   }
    // );
    // const data = await response.json();
    // return { carts: data.carts, total: data.total };

    // 임시 Mock 응답
    return { carts: [], total: 0 };
  } catch (error: any) {
    console.error('카페24 장바구니 목록 조회 실패:', error);
    return { carts: [], total: 0 };
  }
}

