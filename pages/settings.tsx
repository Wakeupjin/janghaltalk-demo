import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function SettingsPage() {
  const [cafe24Status, setCafe24Status] = useState<{
    connected: boolean;
    mall_id?: string;
    shop_no?: string;
    updated_at?: string;
  } | null>(null);

  useEffect(() => {
    // 카페24 연결 상태 확인
    fetch('/api/auth/cafe24/status')
      .then((res) => res.json())
      .then((data) => setCafe24Status(data))
      .catch((error) => {
        console.error('카페24 상태 확인 실패:', error);
        setCafe24Status({ connected: false });
      });
  }, []);

  const [settings, setSettings] = useState({
    // 알림톡 발송 설정
    enabled: true,
    sendTiming: '30', // 분 단위
    maxRetries: 1,
    
    // 메시지 설정
    messageVersion: 'B', // A 또는 B
    customMessage: '',
    
    // 알림톡 발송 조건
    minCartAmount: 0,
    excludeProducts: '',
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 실제로는 API로 설정 저장
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <Head>
        <title>장할톡 - 설정</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
            >
              <span>←</span>
              <span>대시보드로 돌아가기</span>
            </Link>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="mb-8">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                ⚙️ 설정
              </h1>
              <p className="text-gray-600 text-lg">
                장할톡 알림톡 발송 설정을 관리하세요
              </p>
              <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full mt-3"></div>
            </div>

            {saved && (
              <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">
                    ✅
                  </div>
                  <p className="text-green-800 font-bold text-lg">
                    설정이 저장되었습니다
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 카페24 연결 설정 */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                  <span className="text-3xl">🔗</span>
                  <span>카페24 연결</span>
                </h2>
                
                <div className="space-y-4">
                  {cafe24Status && (
                    <div className={`p-4 rounded-lg border-2 ${
                      cafe24Status.connected
                        ? 'bg-green-50 border-green-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {cafe24Status.connected ? (
                            <>
                              <span className="text-2xl">✅</span>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  카페24 연결됨
                                </p>
                                <p className="text-sm text-gray-600">
                                  쇼핑몰 ID: {cafe24Status.mall_id}
                                </p>
                                {cafe24Status.updated_at && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    연결 시간: {new Date(cafe24Status.updated_at).toLocaleString('ko-KR')}
                                  </p>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <span className="text-2xl">⚠️</span>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  카페24 미연결
                                </p>
                                <p className="text-sm text-gray-600">
                                  카페24 쇼핑몰을 연결하여 실제 장바구니 데이터를 사용하세요
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                        {!cafe24Status.connected && (
                          <Link
                            href="/api/auth/cafe24/login"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
                          >
                            🔗 카페24 연결하기
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• 카페24 쇼핑몰을 연결하면 실제 장바구니 데이터를 조회할 수 있습니다</p>
                    <p>• 연결 시 다음 권한이 필요합니다: 주문 조회, 고객 정보 조회, 상품 정보 조회</p>
                    <p>• 연결은 안전하게 OAuth 2.0 방식으로 진행됩니다</p>
                  </div>
                </div>
              </section>

              {/* 기본 설정 */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                  <span className="text-3xl">📱</span>
                  <span>알림톡 발송 설정</span>
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <label htmlFor="enabled" className="block text-sm font-medium text-gray-900 mb-1">
                        알림톡 자동 발송
                      </label>
                      <p className="text-xs text-gray-500">
                        장바구니 이탈 시 자동으로 알림톡을 발송합니다
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="enabled"
                      name="enabled"
                      checked={settings.enabled}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="sendTiming" className="block text-sm font-medium text-gray-700 mb-2">
                      발송 타이밍 (장바구니 추가 후 경과 시간)
                    </label>
                    <select
                      id="sendTiming"
                      name="sendTiming"
                      value={settings.sendTiming}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-500"
                    >
                      <option value="30">30분 후</option>
                      <option value="60">1시간 후</option>
                      <option value="120">2시간 후</option>
                      <option value="1440">다음날</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      장바구니에 상품을 담은 후 지정한 시간이 지나도 구매하지 않으면 알림톡이 발송됩니다
                    </p>
                  </div>

                  <div>
                    <label htmlFor="maxRetries" className="block text-sm font-medium text-gray-700 mb-2">
                      재시도 횟수
                    </label>
                    <select
                      id="maxRetries"
                      name="maxRetries"
                      value={settings.maxRetries}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-500"
                    >
                      <option value="0">재시도 안함</option>
                      <option value="1">1회 재시도</option>
                      <option value="2">2회 재시도</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* 메시지 설정 */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                  <span className="text-3xl">💬</span>
                  <span>메시지 설정</span>
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="messageVersion" className="block text-sm font-medium text-gray-700 mb-2">
                      메시지 버전
                    </label>
                    <select
                      id="messageVersion"
                      name="messageVersion"
                      value={settings.messageVersion}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-500"
                    >
                      <option value="A">버전 A (기존 - 분할 결제 느낌)</option>
                      <option value="B">버전 B (세련된 - 부담 없이 느낌)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      미리보기 페이지에서 두 버전을 비교해보세요
                    </p>
                  </div>

                  <div>
                    <label htmlFor="customMessage" className="block text-sm font-medium text-gray-700 mb-2">
                      커스텀 메시지 (선택사항)
                    </label>
                    <textarea
                      id="customMessage"
                      name="customMessage"
                      value={settings.customMessage}
                      onChange={handleChange}
                      rows={4}
                      placeholder="기본 메시지에 추가할 커스텀 메시지를 입력하세요"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      비워두면 기본 메시지가 사용됩니다
                    </p>
                  </div>
                </div>
              </section>

              {/* 발송 조건 */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                  <span className="text-3xl">🎯</span>
                  <span>발송 조건</span>
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="minCartAmount" className="block text-sm font-medium text-gray-700 mb-2">
                      최소 장바구니 금액 (원)
                    </label>
                    <input
                      type="number"
                      id="minCartAmount"
                      name="minCartAmount"
                      value={settings.minCartAmount}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-500"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      이 금액 이상인 장바구니에만 알림톡을 발송합니다 (0원 = 제한 없음)
                    </p>
                  </div>

                  <div>
                    <label htmlFor="excludeProducts" className="block text-sm font-medium text-gray-700 mb-2">
                      제외할 상품명 (쉼표로 구분)
                    </label>
                    <input
                      type="text"
                      id="excludeProducts"
                      name="excludeProducts"
                      value={settings.excludeProducts}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-500"
                      placeholder="예: 무료배송, 샘플"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      이 상품명이 포함된 장바구니에는 알림톡을 발송하지 않습니다
                    </p>
                  </div>
                </div>
              </section>

              {/* 저장 버튼 */}
              <div className="flex gap-4 pt-8 border-t-2 border-gray-200">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 px-6 rounded-xl font-bold hover:from-gray-800 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5"
                >
                  💾 설정 저장
                </button>
                <Link
                  href="/"
                  className="flex-1 bg-white border-2 border-gray-300 text-gray-900 py-4 px-6 rounded-xl font-bold hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg text-center"
                >
                  취소
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

