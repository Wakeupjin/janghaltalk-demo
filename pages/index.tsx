import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Dashboard from '@/components/Dashboard';
import TossBranding from '@/components/TossBranding';

export default function Home() {
  const router = useRouter();
  const [cafe24Status, setCafe24Status] = useState<{
    connected: boolean;
    mall_id?: string;
  } | null>(null);

  useEffect(() => {
    // URL 파라미터에서 연결 성공/실패 메시지 확인
    if (router.query.connected === 'true') {
      alert('✅ 카페24 연결이 완료되었습니다!');
      router.replace('/', undefined, { shallow: true });
    }
    if (router.query.error) {
      alert(`❌ 연결 실패: ${decodeURIComponent(router.query.error as string)}`);
      router.replace('/', undefined, { shallow: true });
    }

    // 카페24 연결 상태 확인
    fetch('/api/auth/cafe24/status')
      .then((res) => res.json())
      .then((data) => setCafe24Status(data))
      .catch((error) => {
        console.error('카페24 상태 확인 실패:', error);
        setCafe24Status({ connected: false });
      });
  }, [router.query]);

  return (
    <>
      <Head>
        <title>장할톡 - 대시보드</title>
        <meta name="description" content="장할톡 대시보드" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* 헤더 섹션 */}
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                    장할톡
                  </h1>
                  <p className="text-lg text-gray-700 mb-3 leading-relaxed">
                    카페24 쇼핑몰 장바구니 이탈 고객을 토스페이먼츠의{' '}
                    <Link
                      href="https://www.toss.im/payments"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-bold underline decoration-2 underline-offset-2 transition-colors"
                    >
                      장할특(특별분담장기무이자)
                    </Link>
                    로 전환하는 자동화 마케팅 서비스
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg inline-flex">
                    <span className="text-lg">💳</span>
                    <span className="font-medium">토스페이먼츠 장할특 결제수단 연동</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 카페24 연결 상태 표시 */}
          {cafe24Status && (
            <div className={`mb-6 p-6 rounded-2xl shadow-lg border-2 backdrop-blur-sm transition-all duration-300 ${
              cafe24Status.connected
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-green-100'
                : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300 shadow-amber-100'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                    cafe24Status.connected
                      ? 'bg-green-100 text-green-600'
                      : 'bg-amber-100 text-amber-600'
                  }`}>
                    {cafe24Status.connected ? '✅' : '⚠️'}
                  </div>
                  <div>
                    <p className={`text-xl font-bold mb-1 ${
                      cafe24Status.connected ? 'text-green-900' : 'text-amber-900'
                    }`}>
                      {cafe24Status.connected ? '카페24 연결됨' : '카페24 미연결'}
                    </p>
                    <p className={`text-sm ${
                      cafe24Status.connected ? 'text-green-700' : 'text-amber-700'
                    }`}>
                      {cafe24Status.connected 
                        ? `쇼핑몰 ID: ${cafe24Status.mall_id}`
                        : '카페24 쇼핑몰을 연결하여 실제 장바구니 데이터를 사용하세요'
                      }
                    </p>
                  </div>
                </div>
                {!cafe24Status.connected && (
                  <Link
                    href="/api/auth/cafe24/login"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap"
                  >
                    🔗 카페24 연결하기
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* 액션 버튼 그리드 */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/carts"
              className="group bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-700"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">📦</div>
              <h3 className="text-xl font-bold mb-1">장바구니 목록</h3>
              <p className="text-sm text-gray-300">이탈 고객 관리 및 알림톡 발송</p>
            </Link>
            
            <Link
              href="/settings"
              className="group bg-white text-gray-900 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">⚙️</div>
              <h3 className="text-xl font-bold mb-1">설정</h3>
              <p className="text-sm text-gray-600">알림톡 발송 설정 관리</p>
            </Link>
            
            <Link
              href="/preview?name=홍길동&product=명품가방&amount=240000&monthly=20000"
              className="group bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">👁️</div>
              <h3 className="text-xl font-bold mb-1">A/B 미리보기</h3>
              <p className="text-sm text-indigo-100">알림톡 메시지 버전 비교</p>
            </Link>
            
            <button
              onClick={async () => {
                if (confirm('초기 샘플 데이터를 생성하시겠습니까? (기존 데이터는 유지됩니다)')) {
                  try {
                    const response = await fetch('/api/init-data', { method: 'POST' });
                    const data = await response.json();
                    if (data.success) {
                      alert(`✅ ${data.total_created}건의 샘플 데이터가 생성되었습니다!\n페이지를 새로고침하면 반영됩니다.`);
                      window.location.reload();
                    } else {
                      alert('데이터 생성에 실패했습니다.');
                    }
                  } catch (error) {
                    alert('데이터 생성 중 오류가 발생했습니다.');
                  }
                }
              }}
              className="group bg-gradient-to-br from-blue-600 to-cyan-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-left"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">📊</div>
              <h3 className="text-xl font-bold mb-1">샘플 데이터</h3>
              <p className="text-sm text-blue-100">테스트용 데이터 생성</p>
            </button>
          </div>

          <Dashboard />
          <TossBranding />
        </div>
      </main>
    </>
  );
}

