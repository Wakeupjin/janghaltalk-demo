import Link from 'next/link';

export default function TossBranding() {
  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
        <span>Powered by</span>
        <Link
          href="https://www.toss.im/payments"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          토스페이먼츠
        </Link>
        <span className="text-gray-400">•</span>
        <span className="text-gray-500">장할특(특별분담장기무이자)</span>
      </div>
    </div>
  );
}

