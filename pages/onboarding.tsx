import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: '장할톡에 오신 것을 환영합니다! 🎉',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            장할톡은 카페24 쇼핑몰의 장바구니 이탈 고객을 토스페이먼츠의 <strong>장할특(특별분담장기무이자)</strong> 결제수단으로 전환시키는 자동화 마케팅 서비스입니다.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-gray-700">
              <strong>핵심 가치:</strong> 장바구니 포기율을 70%에서 60% 이하로 낮추고, 추가 매출을 창출합니다.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: '작동 원리 🔄',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold text-gray-900">장바구니 이탈 감지</p>
                <p className="text-sm text-gray-600">고객이 장바구니에 상품을 담고 구매하지 않으면 자동으로 감지합니다</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold text-gray-900">알림톡 자동 발송</p>
                <p className="text-sm text-gray-600">설정한 시간 후 자동으로 장할특 혜택 알림톡을 발송합니다</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold text-gray-900">결제 페이지로 이동</p>
                <p className="text-sm text-gray-600">알림톡 버튼 클릭 시 카페24 결제 페이지로 자동 이동합니다</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <p className="font-semibold text-gray-900">매출 전환</p>
                <p className="text-sm text-gray-600">고객이 장할특으로 결제하여 추가 매출이 발생합니다</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '주요 기능 ✨',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="font-semibold text-gray-900 mb-2">📊 실시간 대시보드</p>
              <p className="text-sm text-gray-600">장바구니 이탈률, 전환율, 추가 매출을 한눈에 확인</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="font-semibold text-gray-900 mb-2">⚙️ 자동화 설정</p>
              <p className="text-sm text-gray-600">발송 타이밍, 메시지 버전 등 자유롭게 설정</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="font-semibold text-gray-900 mb-2">💬 메시지 커스터마이징</p>
              <p className="text-sm text-gray-600">두 가지 메시지 버전 중 선택 가능</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="font-semibold text-gray-900 mb-2">📈 성과 추적</p>
              <p className="text-sm text-gray-600">전환율과 매출 증가를 실시간으로 모니터링</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '시작하기 🚀',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            이제 장할톡이 자동으로 작동합니다! 다음 단계를 따라 설정을 완료하세요:
          </p>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <p className="text-sm text-gray-700">설정 페이지에서 발송 타이밍을 조정하세요</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <p className="text-sm text-gray-700">메시지 버전을 선택하세요 (A 또는 B)</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <p className="text-sm text-gray-700">대시보드에서 실시간 성과를 확인하세요</p>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-gray-700">
              <strong>💡 팁:</strong> 처음에는 기본 설정으로 시작하고, 데이터를 수집한 후 최적의 타이밍을 찾아보세요.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 마지막 단계에서 완료
      router.push('/');
    }
  };

  const handleSkip = () => {
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>장할톡 - 시작하기</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* 진행 바 */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  {currentStep + 1} / {steps.length}
                </span>
                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  건너뛰기
                </button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* 콘텐츠 */}
            <div className="mb-8 min-h-[400px]">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                {steps[currentStep].title}
              </h1>
              <div className="text-gray-700">
                {steps[currentStep].content}
              </div>
            </div>

            {/* 네비게이션 버튼 */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1 bg-gray-200 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  ← 이전
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                {currentStep === steps.length - 1 ? '시작하기' : '다음 →'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

