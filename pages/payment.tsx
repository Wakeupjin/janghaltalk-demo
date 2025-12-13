import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { restoreCafe24Cart, generateOrderformUrl } from '@/lib/cafe24';

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
        
        // 1. 카페24 장바구니 복원
        const restoreResult = await restoreCafe24Cart(
          parseInt(cart_id as string),
          mall_id as string,
          undefined // 실제 연동 시 accessToken 전달
        );

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
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {loading && !error && (
              <>
                <div className="mb-6">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
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
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-red-600 text-3xl">❌</span>
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  오류가 발생했습니다
                </h1>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => router.back()}
                  className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  돌아가기
                </button>
              </>
            )}
          </div>

          {/* 토스페이먼츠 브랜딩 */}
          <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="mb-3 text-center">
              <p className="text-sm text-gray-700 mb-2 font-semibold">
                💳 토스페이먼츠 장할특 결제로 진행됩니다
              </p>
              <Link
                href="https://www.toss.im/payments"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold inline-flex items-center gap-1"
              >
                토스페이먼츠 알아보기 →
              </Link>
            </div>
            <p className="text-xs text-gray-600 text-center border-t border-blue-200 pt-3">
              💡 데모 모드: 실제 카페24 연동 시 장바구니가 복원되고 결제 페이지로 이동합니다
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

