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
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors bg-white px-4 py-2 rounded border border-gray-200 hover:border-gray-300"
            >
              <span>←</span>
              <span>대시보드로 돌아가기</span>
            </Link>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  이탈 고객 알림톡 발송
                </h1>
                <p className="text-gray-600 text-lg">
                  고객 정보를 입력하여 알림톡을 발송합니다.
                </p>
                <div className="h-px bg-gray-300 mt-3"></div>
              </div>

              <SimulationForm />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

