import { useState, useEffect } from 'react';
import { DashboardStats } from '@/lib/types';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // 5초마다 자동 갱신
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('통계 조회 실패:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <p className="text-gray-500">데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          장할톡 성과 대시보드
        </h2>
        <div className="h-px bg-gray-300"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="총 장바구니"
          value={stats.total_carts.toLocaleString()}
          unit="건"
        />
        <StatCard
          label="이탈 고객"
          value={stats.abandoned_carts.toLocaleString()}
          unit={`건 (${stats.abandonment_rate.toFixed(1)}%)`}
        />
        <StatCard
          label="알림톡 발송"
          value={stats.alimtalk_sent.toLocaleString()}
          unit="건"
        />
        <StatCard
          label="전환 완료"
          value={stats.conversions.toLocaleString()}
          unit={`건 (${stats.conversion_rate.toFixed(1)}%)`}
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-8 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-600 mb-1">최종 포기율</p>
              <p className="text-4xl font-bold text-gray-900">
                {stats.final_abandonment_rate.toFixed(1)}%
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              목표: 60% 이하 달성
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-600 mb-1">추가 매출</p>
              <p className="text-4xl font-bold text-gray-900">
                {formatCurrency(stats.additional_revenue)}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              장할특 전환으로 발생한 매출
            </p>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 text-center">
        마지막 업데이트: {new Date().toLocaleString('ko-KR')}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
}

function StatCard({ label, value, unit }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <p className="text-sm font-semibold text-gray-600 mb-2">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{unit}</p>
    </div>
  );
}

