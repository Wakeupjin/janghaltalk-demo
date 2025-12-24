import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import SimulationForm from '@/components/SimulationForm';

export default function SimulatePage() {
  return (
    <>
      <Head>
        <title>장할톡 - 알림톡 발송</title>
        <meta name="description" content="이탈 고객 알림톡 발송" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
            >
              <span>←</span>
              <span>대시보드로 돌아가기</span>
            </Link>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
              <div className="mb-8">
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  📱 이탈 고객 알림톡 발송
                </h1>
                <p className="text-gray-600 text-lg">
                  고객 정보를 입력하여 알림톡을 발송합니다.
                </p>
                <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full mt-3"></div>
              </div>

              <SimulationForm />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

