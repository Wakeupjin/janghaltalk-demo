import { useState, useEffect } from 'react';
import { Cafe24Cart } from '@/lib/cafe24';
import { FilterOptions } from './CartFilter';

interface CartListProps {
  filters: FilterOptions;
  onSelectionChange: (selectedCarts: string[]) => void;
  onEstimatedRevenueChange?: (revenue: number) => void;
}

export default function CartList({ filters, onSelectionChange, onEstimatedRevenueChange }: CartListProps) {
  const [carts, setCarts] = useState<Cafe24Cart[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCarts, setSelectedCarts] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCarts();
  }, [filters]);

  const fetchCarts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.marketing_consent !== undefined)
        params.append('marketing_consent', filters.marketing_consent.toString());
      if (filters.min_amount) params.append('min_amount', filters.min_amount.toString());
      if (filters.hours_ago) params.append('hours_ago', filters.hours_ago.toString());

      const response = await fetch(`/api/carts?${params.toString()}`);
      const data = await response.json();
      setCarts(data.carts || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('장바구니 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 발송 가능한 장바구니만 필터링 (구매 완료 제외, 마케팅 동의 필수)
  const getSelectableCarts = () => {
    return carts.filter(
      (cart) =>
        cart.status === 'pending' && // 구매 완료가 아닌 것만
        cart.marketing_consent // 마케팅 동의한 것만
    );
  };

  const calculateEstimatedRevenue = (selectedCartNos: Set<string>) => {
    const selectedCartsData = carts.filter((cart) =>
      selectedCartNos.has(cart.cart_no)
    );
    return selectedCartsData.reduce((sum, cart) => sum + cart.total_amount, 0);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const selectableCartNos = new Set(
        getSelectableCarts().map((cart) => cart.cart_no)
      );
      setSelectedCarts(selectableCartNos);
      setSelectAll(true);
      onSelectionChange(Array.from(selectableCartNos));
      const revenue = calculateEstimatedRevenue(selectableCartNos);
      onEstimatedRevenueChange?.(revenue);
    } else {
      setSelectedCarts(new Set());
      setSelectAll(false);
      onSelectionChange([]);
      onEstimatedRevenueChange?.(0);
    }
  };

  const handleSelectCart = (cartNo: string, checked: boolean) => {
    const cart = carts.find((c) => c.cart_no === cartNo);
    // 구매 완료되었거나 마케팅 미동의인 경우 선택 불가
    if (cart && (cart.status === 'purchased' || !cart.marketing_consent)) {
      return;
    }

    const newSelected = new Set(selectedCarts);
    if (checked) {
      newSelected.add(cartNo);
    } else {
      newSelected.delete(cartNo);
    }
    setSelectedCarts(newSelected);
    const selectableCarts = getSelectableCarts();
    setSelectAll(
      newSelected.size === selectableCarts.length && selectableCarts.length > 0
    );
    onSelectionChange(Array.from(newSelected));
    const revenue = calculateEstimatedRevenue(newSelected);
    onEstimatedRevenueChange?.(revenue);
  };

  const isSelectable = (cart: Cafe24Cart) => {
    return cart.status === 'pending' && cart.marketing_consent;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      return '방금 전';
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}일 전`;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-orange-100 text-orange-800',
      purchased: 'bg-green-100 text-green-800',
      expired: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      pending: '이탈',
      purchased: '구매완료',
      expired: '만료',
    };
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${
          badges[status as keyof typeof badges] || badges.pending
        }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={(e) => handleSelectAll(e.target.checked)}
            disabled={getSelectableCarts().length === 0}
            className="w-5 h-5 text-gray-900 rounded focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span className="text-sm font-medium text-gray-700">
            전체 선택 ({selectedCarts.size}개 선택됨 / 발송 가능: {getSelectableCarts().length}개)
          </span>
        </div>
        <span className="text-sm text-gray-600">총 {total}건</span>
      </div>

      {carts.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          조건에 맞는 장바구니가 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  선택
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  고객명
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  전화번호
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  상품명
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  금액
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  장바구니 추가시간
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  마케팅동의
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  상태
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  발송여부
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  발송횟수
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  최근 발송시간
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  고객정보
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {carts.map((cart) => {
                const selectable = isSelectable(cart);
                return (
                  <tr
                    key={cart.cart_no}
                    className={`hover:bg-gray-50 transition-colors ${
                      !selectable ? 'opacity-60 bg-gray-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedCarts.has(cart.cart_no)}
                        onChange={(e) =>
                          handleSelectCart(cart.cart_no, e.target.checked)
                        }
                        disabled={!selectable}
                        className="w-5 h-5 text-gray-900 rounded focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="font-medium">{cart.customer_name}</div>
                      {cart.customer_grade && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {cart.customer_grade}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {cart.customer_phone}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div>{cart.product_name}</div>
                      {cart.item_count && cart.item_count > 1 && (
                        <span className="text-gray-500 text-xs">
                          외 {cart.item_count - 1}건
                        </span>
                      )}
                      {cart.preferred_category && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          선호: {cart.preferred_category}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      <div>{formatCurrency(cart.total_amount)}</div>
                      {cart.average_order_amount && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          평균: {formatCurrency(cart.average_order_amount)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(cart.added_at)}
                    </td>
                    <td className="px-4 py-3">
                      {cart.marketing_consent ? (
                        <span className="text-green-600 text-xs font-semibold">
                          ✓ 동의
                        </span>
                      ) : (
                        <span className="text-red-600 text-xs font-semibold">
                          ✗ 비동의
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(cart.status)}</td>
                    <td className="px-4 py-3">
                      {cart.sent_count && cart.sent_count > 0 ? (
                        <span className="text-blue-600 text-xs font-semibold">
                          ✓ 발송완료
                        </span>
                      ) : cart.status === 'purchased' ? (
                        <span className="text-gray-400 text-xs">구매완료</span>
                      ) : (
                        <span className="text-gray-500 text-xs">미발송</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {cart.sent_count && cart.sent_count > 0 ? (
                        <span className="text-blue-600 text-xs font-semibold">
                          {cart.sent_count}회
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">0회</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {cart.sent_at ? formatDate(cart.sent_at) : '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {cart.purchase_history_count !== undefined && (
                        <div className="space-y-0.5">
                          <div>구매 {cart.purchase_history_count}회</div>
                          {cart.last_purchase_date && (
                            <div className="text-gray-500">
                              최근: {formatDate(cart.last_purchase_date)}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

