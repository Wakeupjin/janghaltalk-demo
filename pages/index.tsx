import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Dashboard from '@/components/Dashboard';
import TossBranding from '@/components/TossBranding';

export default function Home() {
  return (
    <>
      <Head>
        <title>장할톡 - 대시보드</title>
        <meta name="description" content="장할톡 대시보드" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              장할톡
            </h1>
            <p className="text-gray-600 mb-2">
              카페24 쇼핑몰 장바구니 이탈 고객을 토스페이먼츠의{' '}
              <Link
                href="https://www.toss.im/payments"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-semibold underline"
              >
                장할특(특별분담장기무이자)
              </Link>
              로 전환하는 자동화 마케팅 서비스
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>💳</span>
              <span>토스페이먼츠 장할특 결제수단 연동</span>
            </div>
          </div>

          <div className="mb-6 flex gap-3 flex-wrap">
            <Link
              href="/settings"
              className="inline-block bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              ⚙️ 설정
            </Link>
            <Link
              href="/carts"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              📦 장바구니 목록
            </Link>
            <Link
              href="/preview?name=홍길동&product=명품가방&amount=240000&monthly=20000"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              👁️ 알림톡 A/B 미리보기
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
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              📊 샘플 데이터 생성
            </button>
          </div>

          <Dashboard />
          <TossBranding />
        </div>
      </main>
    </>
  );
}

