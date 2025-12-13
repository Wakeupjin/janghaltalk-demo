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
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              ← 대시보드로 돌아가기
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📦 장바구니 목록
            </h1>
            <p className="text-gray-600">
              카페24 장바구니 목록에서 타겟팅할 고객을 선택하여 알림톡을 발송하세요
            </p>
          </div>

          {/* 필터 */}
          <CartFilter filters={filters} onFilterChange={handleFilterChange} />

          {/* 발송 결과 */}
          {sendResult && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-semibold mb-2">
                ✅ 일괄 발송 완료
              </p>
              <div className="text-sm text-green-700">
                <p>성공: {sendResult.success}건</p>
                {sendResult.failed > 0 && (
                  <p className="text-red-600">실패: {sendResult.failed}건</p>
                )}
              </div>
            </div>
          )}

          {/* 선택된 항목 및 발송 버튼 */}
          {selectedCarts.length > 0 && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-blue-900 font-semibold text-lg">
                    {selectedCarts.length}개 장바구니 선택됨
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    선택한 장바구니에 알림톡을 일괄 발송할 수 있습니다
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 mb-1">예상 매출</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {estimatedRevenue.toLocaleString('ko-KR')}원
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                <p className="text-xs text-gray-600">
                  💡 구매 완료된 장바구니와 이미 발송한 장바구니는 자동으로 제외됩니다
                </p>
                <button
                  onClick={handleBatchSend}
                  disabled={sending}
                  className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {sending ? '발송 중...' : `📱 선택한 ${selectedCarts.length}건 발송하기`}
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

