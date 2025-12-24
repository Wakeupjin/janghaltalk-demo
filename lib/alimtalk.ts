import axios from 'axios';

interface AlimtalkMessage {
  phone: string;
  templateCode: string;
  message: string;
  variables?: Record<string, string>;
}

/**
 * 카카오 비즈메시지 API로 알림톡 발송
 * 실제 연동 전까지는 Mock 응답 반환
 */
export async function sendAlimtalk(
  phone: string,
  customerName: string,
  productName: string,
  totalAmount: number,
  monthlyPayment: number,
  cartId?: number
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const restApiKey = process.env.KAKAO_REST_API_KEY;
  const senderKey = process.env.KAKAO_SENDER_KEY;
  const templateCode = process.env.KAKAO_TEMPLATE_CODE;

  // 환경 변수가 없으면 Mock 모드
  if (!restApiKey || !senderKey || !templateCode) {
    console.log('⚠️  Mock 모드: 알림톡 발송 시뮬레이션');
    console.log(`📱 수신자: ${phone}`);
    console.log(`💬 메시지: ${customerName}님, ${productName} 월 ${monthlyPayment.toLocaleString()}원`);
    
    // Mock 응답 (실제 발송 성공으로 처리)
    return {
      success: true,
      messageId: `mock_${Date.now()}`,
    };
  }

  try {
    // 카카오 비즈메시지 API 호출
    const response = await axios.post(
      'https://kapi.kakao.com/v1/alimtalk/messages',
      {
        receiver_phone_number: phone,
        template_code: templateCode,
        message: {
          object_type: 'text',
          text: `[장바구니 안내]\n\n${customerName}님, 장바구니에 담아두신 상품이 있습니다.\n\n📦 상품: ${productName}\n💰 주문 금액: ${totalAmount.toLocaleString()}원\n\n💳 결제 옵션 안내\n월 ${monthlyPayment.toLocaleString()}원씩 최대 12개월 분할 결제가 가능합니다.\n(무이자 할부 적용)\n\n결제를 진행하시려면 아래 링크를 클릭해주세요.`,
          link: {
            web_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment?cart_id=${cartId || ''}`,
            mobile_web_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment?cart_id=${cartId || ''}`,
          },
        },
        variables: {
          customer_name: customerName,
          product_name: productName,
          total_amount: totalAmount.toLocaleString(),
          monthly_payment: monthlyPayment.toLocaleString(),
        },
      },
      {
        headers: {
          'Authorization': `KakaoAK ${restApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      messageId: response.data.message_id,
    };
  } catch (error: any) {
    console.error('알림톡 발송 실패:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

