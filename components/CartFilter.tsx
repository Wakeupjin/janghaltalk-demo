import { useState } from 'react';

export interface FilterOptions {
  status?: string;
  marketing_consent?: boolean;
  min_amount?: number;
  hours_ago?: number;
}

interface CartFilterProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

export default function CartFilter({ filters, onFilterChange }: CartFilterProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const handleChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {};
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">필터</h3>
        <button
          onClick={handleReset}
          className="text-sm text-gray-600 hover:text-gray-900 underline"
        >
          초기화
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 상태 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            상태
          </label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleChange('status', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-500"
          >
            <option value="">전체</option>
            <option value="pending">이탈</option>
            <option value="purchased">구매완료</option>
            <option value="expired">만료</option>
          </select>
        </div>

        {/* 마케팅 수신동의 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            마케팅 수신동의
          </label>
          <select
            value={
              localFilters.marketing_consent === undefined
                ? ''
                : localFilters.marketing_consent
                ? 'true'
                : 'false'
            }
            onChange={(e) =>
              handleChange(
                'marketing_consent',
                e.target.value === ''
                  ? undefined
                  : e.target.value === 'true'
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-500"
          >
            <option value="">전체</option>
            <option value="true">동의함</option>
            <option value="false">동의안함</option>
          </select>
        </div>

        {/* 최소 금액 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            최소 금액 (원)
          </label>
          <input
            type="number"
            value={localFilters.min_amount || ''}
            onChange={(e) =>
              handleChange(
                'min_amount',
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-500"
          />
        </div>

        {/* 이탈 시간 범위 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이탈 시간
          </label>
          <select
            value={localFilters.hours_ago || ''}
            onChange={(e) =>
              handleChange(
                'hours_ago',
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-500"
          >
            <option value="">전체</option>
            <option value="1">1시간 전</option>
            <option value="2">2시간 전</option>
            <option value="24">1일 전</option>
            <option value="48">2일 전</option>
            <option value="168">1주일 전</option>
          </select>
        </div>
      </div>
    </div>
  );
}

