import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PreviewPage() {
  const router = useRouter();
  const [previewData, setPreviewData] = useState<{
    customer_name: string;
    product_name: string;
    total_amount: number;
    monthly_payment: number;
  } | null>(null);
  const [version, setVersion] = useState<'A' | 'B'>('A');

  useEffect(() => {
    // URL 쿼리 파라미터에서 데이터 가져오기
    if (router.isReady) {
      const { name, product, amount, monthly } = router.query;
      
      if (name && product && amount && monthly) {
        setPreviewData({
          customer_name: decodeURIComponent(name as string),
          product_name: decodeURIComponent(product as string),
          total_amount: parseFloat(amount as string),
          monthly_payment: parseFloat(monthly as string),
        });
      }
    }
  }, [router.isReady, router.query]);

  if (!previewData) {
    return (
      <>
        <Head>
          <title>장할톡 - 알림톡 미리보기</title>
        </Head>
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">데이터를 불러올 수 없습니다.</p>
            <Link href="/" className="text-gray-900 underline">
              대시보드로 돌아가기
            </Link>
          </div>
        </main>
      </>
    );
  }

  // A버전 메시지 (정보성 - 장바구니 안내)
  const messageA = `[장바구니 안내]\n\n${previewData.customer_name}님, 장바구니에 담아두신 상품이 있습니다.\n\n📦 상품: ${previewData.product_name}\n💰 주문 금액: ${previewData.total_amount.toLocaleString()}원\n\n💳 결제 옵션 안내\n월 ${previewData.monthly_payment.toLocaleString()}원씩 최대 12개월 분할 결제가 가능합니다.\n(무이자 할부 적용)\n\n결제를 진행하시려면 아래 링크를 클릭해주세요.`;

  // B버전 메시지 (정보성 - 주문 안내)
  const messageB = `[주문 안내]\n\n${previewData.customer_name}님, 장바구니에 담아두신 상품이 있습니다.\n\n📦 상품명: ${previewData.product_name}\n💰 결제 금액: ${previewData.total_amount.toLocaleString()}원\n\n💳 분할 결제 안내\n월 ${previewData.monthly_payment.toLocaleString()}원부터 12개월까지 무이자 할부 결제가 가능합니다.\n\n주문을 완료하시려면 아래 링크를 통해 결제 페이지로 이동해주세요.`;

  const currentMessage = version === 'A' ? messageA : messageB;
  const buttonTextA = `결제 페이지로 이동`;
  const buttonTextB = `주문 완료하기`;

  return (
    <>
      <Head>
        <title>장할톡 데모 - 알림톡 미리보기</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              ← 대시보드로 돌아가기
            </Link>
          </div>

          {/* 버전 선택 탭 */}
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-white rounded-xl shadow-lg p-1 inline-flex gap-2">
              <button
                onClick={() => setVersion('A')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  version === 'A'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📱 버전 A (기존)
              </button>
              <button
                onClick={() => setVersion('B')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  version === 'B'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                ✨ 버전 B (세련된)
              </button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 버전 A */}
            <div className={`bg-white rounded-2xl shadow-xl p-6 border border-gray-100 ${version === 'A' ? 'ring-2 ring-blue-500' : 'opacity-60'}`}>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  📱 버전 A (기존)
                </h2>
                <p className="text-xs text-gray-500">
                  분할 결제, 할부 느낌
                </p>
              </div>

              {/* 카카오톡 알림톡 UI 모방 */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md">
                {/* 알림톡 헤더 */}
                <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 px-4 py-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm">
                      <span className="text-blue-600 text-xl">💳</span>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">장할톡</p>
                      <p className="text-white text-xs opacity-90">알림톡</p>
                    </div>
                  </div>
                </div>

                {/* 알림톡 메시지 본문 */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
                    <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-line font-medium">
                      {messageA}
                    </p>
                  </div>

                  {/* 버튼 */}
                  <div className="mt-4">
                    <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-4 rounded-xl font-bold text-sm hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                      <div className="flex flex-col items-center">
                        <span>🛒 지금 바로 구매하기</span>
                        <span className="text-xs font-normal opacity-90 mt-1">
                          {buttonTextA}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 알림톡 푸터 */}
                <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    수신거부: 카카오톡 설정 &gt; 알림톡 관리
                  </p>
                </div>
              </div>
            </div>

            {/* 버전 B */}
            <div className={`bg-white rounded-2xl shadow-xl p-6 border border-gray-100 ${version === 'B' ? 'ring-2 ring-blue-500' : 'opacity-60'}`}>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  ✨ 버전 B (세련된)
                </h2>
                <p className="text-xs text-gray-500">
                  부담 없이, 할부 아닌 느낌
                </p>
              </div>

              {/* 카카오톡 알림톡 UI 모방 */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md">
                {/* 알림톡 헤더 */}
                <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 px-4 py-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm">
                      <span className="text-blue-600 text-xl">💳</span>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">장할톡</p>
                      <p className="text-white text-xs opacity-90">알림톡</p>
                    </div>
                  </div>
                </div>

                {/* 알림톡 메시지 본문 */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
                    <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-line font-medium">
                      {messageB}
                    </p>
                  </div>

                  {/* 버튼 */}
                  <div className="mt-4">
                    <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-4 rounded-xl font-bold text-sm hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                      <div className="flex flex-col items-center">
                        <span>🛒 지금 바로 구매하기</span>
                        <span className="text-xs font-normal opacity-90 mt-1">
                          {buttonTextB}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 알림톡 푸터 */}
                <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    수신거부: 카카오톡 설정 &gt; 알림톡 관리
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 비교 안내 */}
          <div className="max-w-4xl mx-auto mt-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                📊 버전 비교
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="font-semibold text-gray-900 mb-2">버전 A 특징</p>
                  <ul className="text-gray-600 space-y-1 text-xs">
                    <li>• "[장바구니 안내]" 제목</li>
                    <li>• "결제 옵션 안내" 형식</li>
                    <li>• "12개월 분할 결제 가능"</li>
                    <li>• 정보 제공 중심</li>
                  </ul>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                  <p className="font-semibold text-gray-900 mb-2">버전 B 특징</p>
                  <ul className="text-gray-600 space-y-1 text-xs">
                    <li>• "[주문 안내]" 제목</li>
                    <li>• "분할 결제 안내" 형식</li>
                    <li>• "12개월까지 무이자 할부"</li>
                    <li>• 주문 완료 안내 중심</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
