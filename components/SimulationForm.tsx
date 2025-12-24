import { useState } from 'react';
import { useRouter } from 'next/router';

export default function SimulationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    product_name: '',
    total_amount: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateMonthlyPayment = (amount: number, months: number = 12) => {
    return Math.floor(amount / months);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const totalAmount = parseFloat(formData.total_amount.replace(/,/g, ''));
    if (isNaN(totalAmount) || totalAmount <= 0) {
      setError('올바른 금액을 입력해주세요.');
      setLoading(false);
      return;
    }

    const monthlyPayment = calculateMonthlyPayment(totalAmount, 12);

    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          total_amount: totalAmount,
          monthly_payment: monthlyPayment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '알림톡 발송에 실패했습니다.');
      }

      setSuccess(true);
      setFormData({
        customer_name: '',
        customer_phone: '',
        product_name: '',
        total_amount: '',
      });

      // 2초 후 대시보드로 이동
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: any) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (value: string) => {
    const num = value.replace(/,/g, '');
    if (isNaN(parseFloat(num))) return '';
    return parseFloat(num).toLocaleString();
  };

  const totalAmount = parseFloat(formData.total_amount.replace(/,/g, '')) || 0;
  const monthlyPayment = calculateMonthlyPayment(totalAmount, 12);

  const handlePreview = () => {
    if (!formData.customer_name || !formData.product_name || totalAmount <= 0) {
      setError('미리보기를 위해 고객명, 상품명, 총 금액을 입력해주세요.');
      return;
    }

    const params = new URLSearchParams({
      name: formData.customer_name,
      product: formData.product_name,
      amount: totalAmount.toString(),
      monthly: monthlyPayment.toString(),
    });

    router.push(`/preview?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
          <p className="text-gray-900 font-semibold">
            알림톡이 성공적으로 발송되었습니다.
          </p>
          <p className="text-gray-600 text-sm mt-1">
            대시보드로 이동합니다...
          </p>
        </div>
      )}

      {error && (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
          <p className="text-gray-900 font-semibold">오류</p>
          <p className="text-gray-600 text-sm mt-1">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-2">
          고객명 *
        </label>
        <input
          type="text"
          id="customer_name"
          name="customer_name"
          value={formData.customer_name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-500"
          placeholder="홍길동"
        />
      </div>

      <div>
        <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-2">
          전화번호 *
        </label>
        <input
          type="tel"
          id="customer_phone"
          name="customer_phone"
          value={formData.customer_phone}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-500"
          placeholder="010-1234-5678"
        />
        <p className="text-xs text-gray-500 mt-1">
          실제 전화번호로 알림톡이 발송됩니다. (테스트용 번호 권장)
        </p>
      </div>

      <div>
        <label htmlFor="product_name" className="block text-sm font-medium text-gray-700 mb-2">
          상품명 *
        </label>
        <input
          type="text"
          id="product_name"
          name="product_name"
          value={formData.product_name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-500"
          placeholder="명품 가방"
        />
      </div>

      <div>
        <label htmlFor="total_amount" className="block text-sm font-medium text-gray-700 mb-2">
          총 금액 *
        </label>
        <input
          type="text"
          id="total_amount"
          name="total_amount"
          value={formData.total_amount}
          onChange={(e) => {
            const formatted = formatAmount(e.target.value);
            setFormData((prev) => ({ ...prev, total_amount: formatted }));
          }}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-500"
          placeholder="240,000"
        />
      </div>

      {totalAmount > 0 && (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">계산 결과</p>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-gray-900">
              총 금액: {totalAmount.toLocaleString()}원
            </p>
            <p className="text-lg font-semibold text-gray-900">
              월 납입금: {monthlyPayment.toLocaleString()}원
            </p>
            <p className="text-xs text-gray-500">
              (12개월 무이자 할부 기준)
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handlePreview}
          disabled={loading || !formData.customer_name || !formData.product_name || totalAmount <= 0}
          className="flex-1 bg-gray-200 text-gray-900 py-3 px-6 rounded font-semibold hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          미리보기
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gray-900 text-white py-3 px-6 rounded font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? '발송 중...' : '알림톡 발송하기'}
        </button>
      </div>
    </form>
  );
}

