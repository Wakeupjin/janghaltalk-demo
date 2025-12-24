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
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          📊 장할톡 성과 대시보드
        </h2>
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="총 장바구니"
          value={stats.total_carts.toLocaleString()}
          unit="건"
          gradient="from-blue-500 to-cyan-500"
          icon="🛒"
        />
        <StatCard
          label="이탈 고객"
          value={stats.abandoned_carts.toLocaleString()}
          unit={`건 (${stats.abandonment_rate.toFixed(1)}%)`}
          gradient="from-amber-500 to-orange-500"
          icon="📉"
        />
        <StatCard
          label="알림톡 발송"
          value={stats.alimtalk_sent.toLocaleString()}
          unit="건"
          gradient="from-indigo-500 to-purple-500"
          icon="📱"
        />
        <StatCard
          label="전환 완료"
          value={stats.conversions.toLocaleString()}
          unit={`건 (${stats.conversion_rate.toFixed(1)}%)`}
          gradient="from-green-500 to-emerald-500"
          icon="✅"
        />
      </div>

      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 mb-6 border-2 border-indigo-200 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-2xl">
                📊
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">최종 포기율</p>
                <p className="text-4xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {stats.final_abandonment_rate.toFixed(1)}%
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <span className="text-green-500">✅</span>
              목표: 60% 이하 달성
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-green-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-2xl">
                💰
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">추가 매출</p>
                <p className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {formatCurrency(stats.additional_revenue)}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <span className="text-blue-500">💳</span>
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
  gradient?: string;
  icon?: string;
}

function StatCard({ label, value, unit, gradient = "from-gray-500 to-gray-600", icon }: StatCardProps) {
  return (
    <div className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 mb-2">{label}</p>
          <p className={`text-3xl font-extrabold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {value}
          </p>
          <p className="text-xs text-gray-500 mt-2">{unit}</p>
        </div>
        {icon && (
          <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

