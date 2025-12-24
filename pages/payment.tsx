import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { generateOrderformUrl } from '@/lib/cafe24';

export default function PaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('장바구니 복원 중...');

  useEffect(() => {
    const handlePayment = async () => {
      const { cart_id, mall_id } = router.query;

      if (!cart_id) {
        setError('장바구니 정보가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        setStatus('장바구니 복원 중...');
        
        // 1. 카페24 장바구니 복원 (서버 API를 통해)
        const restoreResponse = await fetch('/api/carts/restore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cart_id: cart_id,
            cart_no: cart_id, // cart_no도 함께 전달
          }),
        });

        if (!restoreResponse.ok) {
          const errorData = await restoreResponse.json();
          throw new Error(errorData.error || '장바구니 복원에 실패했습니다.');
        }

        const restoreResult = await restoreResponse.json();

        if (!restoreResult.success) {
          throw new Error(restoreResult.error || '장바구니 복원에 실패했습니다.');
        }

        setStatus('결제 페이지로 이동 중...');

        // 2. 카페24 orderform.html로 리다이렉트
        const orderformUrl = restoreResult.orderform_url || 
          generateOrderformUrl(
            mall_id as string || 'mall',
            restoreResult.cart_no || '',
            {
              paymentMethod: 'janghaltuk',
              installmentMonths: 12,
            }
          );

        // 3. 전환 추적 (선택사항)
        // await fetch('/api/convert', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     cart_id: cart_id,
        //     action: 'clicked',
        //   }),
        // });

        // 4. 카페24 결제 페이지로 리다이렉트
        setTimeout(() => {
          window.location.href = orderformUrl;
        }, 500);

      } catch (err: any) {
        console.error('결제 페이지 처리 오류:', err);
        setError(err.message || '결제 페이지로 이동하는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    if (router.isReady) {
      handlePayment();
    }
  }, [router.isReady, router.query]);

  return (
    <>
      <Head>
        <title>장할톡 - 결제 페이지로 이동</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
            {loading && !error && (
              <>
                <div className="mb-6">
                  <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  결제 페이지로 이동 중
                </h1>
                <p className="text-gray-600 mb-4">{status}</p>
                <p className="text-sm text-gray-500">
                  잠시만 기다려주세요...
                </p>
              </>
            )}

            {error && (
              <>
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <div className="w-3 h-3 bg-gray-900 rounded-full"></div>
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  오류가 발생했습니다
                </h1>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => router.back()}
                  className="bg-gray-900 text-white px-6 py-3 rounded font-semibold hover:bg-gray-800 transition-colors"
                >
                  돌아가기
                </button>
              </>
            )}
          </div>

          {/* 토스페이먼츠 브랜딩 */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="mb-3 text-center">
              <p className="text-sm text-gray-700 mb-2 font-semibold">
                토스페이먼츠 장할특 결제로 진행됩니다
              </p>
              <Link
                href="https://www.toss.im/payments"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 hover:text-gray-700 text-sm font-semibold inline-flex items-center gap-1"
              >
                토스페이먼츠 알아보기 →
              </Link>
            </div>
            <p className="text-xs text-gray-600 text-center border-t border-gray-200 pt-3">
              데모 모드: 실제 카페24 연동 시 장바구니가 복원되고 결제 페이지로 이동합니다
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

