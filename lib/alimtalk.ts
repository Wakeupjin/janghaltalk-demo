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
          text: `🎉 특별 혜택 알림 🎉\n\n${customerName}님, 담아두신 상품이 기다리고 있어요!\n\n✨ 월 ${monthlyPayment.toLocaleString()}원으로 시작하는\n   특별 분할 결제 이벤트 ✨\n\n🔥 지금 구매 시 혜택 🔥\n💳 최대 12개월 완전 무이자\n📦 ${productName}\n💰 총 ${totalAmount.toLocaleString()}원\n\n⏰ 한정 시간 특가\n💝 부담 없이 바로 시작하세요!`,
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

