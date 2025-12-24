import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import CartFilter, { FilterOptions } from '@/components/CartFilter';
import CartList from '@/components/CartList';
import TossBranding from '@/components/TossBranding';

export default function CartsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedCarts, setSelectedCarts] = useState<string[]>([]);
  const [estimatedRevenue, setEstimatedRevenue] = useState<number>(0);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: number;
    failed: number;
  } | null>(null);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setSelectedCarts([]); // 필터 변경 시 선택 초기화
    setEstimatedRevenue(0); // 예상 매출도 초기화
  };

  const handleSelectionChange = (selected: string[]) => {
    setSelectedCarts(selected);
  };

  const handleBatchSend = async () => {
    if (selectedCarts.length === 0) {
      alert('발송할 장바구니를 선택해주세요.');
      return;
    }

    if (
      !confirm(
        `선택한 ${selectedCarts.length}건의 장바구니에 알림톡을 발송하시겠습니까?`
      )
    ) {
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      const response = await fetch('/api/send-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_nos: selectedCarts,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '일괄 발송에 실패했습니다.');
      }

      setSendResult({
        success: data.success_count || 0,
        failed: data.failed_count || 0,
      });

      // 성공 시 선택 초기화 및 목록 새로고침
      setSelectedCarts([]);
      setEstimatedRevenue(0);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      alert(error.message || '일괄 발송 중 오류가 발생했습니다.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Head>
        <title>장할톡 - 장바구니 목록</title>
        <meta name="description" content="장바구니 목록 및 알림톡 발송" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
            >
              <span>←</span>
              <span>대시보드로 돌아가기</span>
            </Link>
          </div>

          <div className="mb-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  📦 장바구니 목록
                </h1>
                <p className="text-gray-600 text-lg">
                  카페24 장바구니 목록에서 타겟팅할 고객을 선택하여 알림톡을 발송하세요
                </p>
              </div>
              <Link
                href="/preview?name=홍길동&product=명품가방&amount=240000&monthly=20000"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap"
              >
                👁️ A/B 미리보기
              </Link>
            </div>
          </div>

          {/* 필터 */}
          <CartFilter filters={filters} onFilterChange={handleFilterChange} />

          {/* 발송 결과 */}
          {sendResult && (
            <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">
                  ✅
                </div>
                <div className="flex-1">
                  <p className="text-green-900 font-bold text-xl mb-2">
                    일괄 발송 완료
                  </p>
                  <div className="text-sm text-green-800 space-y-1">
                    <p className="font-semibold">성공: {sendResult.success}건</p>
                    {sendResult.failed > 0 && (
                      <p className="text-red-600 font-semibold">실패: {sendResult.failed}건</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 선택된 항목 및 발송 버튼 */}
          {selectedCarts.length > 0 && (
            <div className="mb-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-3xl shadow-lg">
                    📦
                  </div>
                  <div>
                    <p className="text-blue-900 font-bold text-2xl mb-1">
                      {selectedCarts.length}개 장바구니 선택됨
                    </p>
                    <p className="text-sm text-blue-700">
                      선택한 장바구니에 알림톡을 일괄 발송할 수 있습니다
                    </p>
                  </div>
                </div>
                <div className="text-right bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-blue-200">
                  <p className="text-xs text-gray-600 mb-1 font-medium">예상 매출</p>
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {estimatedRevenue.toLocaleString('ko-KR')}원
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t-2 border-blue-200">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-blue-500">💡</span>
                  구매 완료된 장바구니와 이미 발송한 장바구니는 자동으로 제외됩니다
                </p>
                <button
                  onClick={handleBatchSend}
                  disabled={sending}
                  className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-8 py-4 rounded-xl font-bold hover:from-gray-800 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {sending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      발송 중...
                    </span>
                  ) : (
                    `📱 선택한 ${selectedCarts.length}건 발송하기`
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 장바구니 목록 */}
          <CartList
            filters={filters}
            onSelectionChange={handleSelectionChange}
            onEstimatedRevenueChange={setEstimatedRevenue}
          />
          <TossBranding />
        </div>
      </main>
    </>
  );
}

