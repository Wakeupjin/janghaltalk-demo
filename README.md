# 장할톡 (JangHalTalk) 데모

카페24 쇼핑몰의 장바구니 이탈 고객을 토스페이먼츠의 **장할특(특별분담장기무이자)** 결제수단으로 전환시키는 자동화 마케팅 서비스의 내부 설득용 데모입니다.

## 🎯 데모 목적

카페24 연동 전에 내부 팀을 설득하기 위한 MVP 데모로, 실제 알림톡 발송과 성과 대시보드를 통해 서비스의 가치를 시각적으로 보여줍니다.

## ✨ 주요 기능

- 📊 **실시간 성과 대시보드**: 장바구니 이탈률, 전환율, 추가 매출 등 핵심 지표 시각화
- 🎯 **수동 시뮬레이션**: 고객 정보 입력으로 실제 알림톡 발송 테스트
- 📱 **카카오 비즈메시지 연동**: 실제 알림톡 발송 (Mock 모드 지원)
- 💾 **SQLite 데이터베이스**: 발송 로그 및 전환 데이터 저장

## 🚀 배포

### Vercel 배포 (권장)

1. GitHub에 저장소 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 Import
3. 환경 변수 설정 (선택사항)
4. Deploy 완료!

자세한 내용은 [DEPLOY.md](./DEPLOY.md) 참고

⚠️ **주의**: Vercel은 서버리스 환경이므로 SQLite 파일이 영구 저장되지 않습니다. 데모 목적이라면 문제없지만, 실제 운영 시에는 PostgreSQL 등 영구 저장소를 사용해야 합니다.

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
# 카카오 비즈메시지 API (선택사항 - 없으면 Mock 모드로 동작)
KAKAO_REST_API_KEY=your_kakao_rest_api_key
KAKAO_ADMIN_KEY=your_kakao_admin_key
KAKAO_SENDER_KEY=your_kakao_sender_key
KAKAO_TEMPLATE_CODE=your_template_code

# 데이터베이스
DATABASE_PATH=./data/janghaltalk.db

# 앱 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**참고**: 카카오 API 키가 없어도 Mock 모드로 동작하므로 데모는 가능합니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어주세요.

## 📖 사용 방법

### 시뮬레이션 실행

1. 메인 페이지에서 **"시뮬레이션 시작하기"** 버튼 클릭
2. 고객 정보 입력:
   - 고객명
   - 전화번호 (실제 번호로 알림톡 발송됨)
   - 상품명
   - 총 금액
3. **"알림톡 발송하기"** 버튼 클릭
4. 대시보드에서 실시간 성과 확인

### 대시보드 확인

- 총 장바구니 수
- 이탈 고객 수 및 이탈률
- 알림톡 발송 수
- 전환 완료 수 및 전환율
- 최종 포기율
- 추가 매출

## 🔧 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (better-sqlite3)
- **External APIs**: 카카오 비즈메시지 API

## 📁 프로젝트 구조

```
장할톡/
├── components/          # React 컴포넌트
│   ├── Dashboard.tsx    # 대시보드 컴포넌트
│   └── SimulationForm.tsx  # 시뮬레이션 입력 폼
├── lib/                 # 유틸리티 및 라이브러리
│   ├── db.ts           # 데이터베이스 연결
│   ├── alimtalk.ts     # 카카오 비즈메시지 API
│   └── types.ts        # TypeScript 타입 정의
├── pages/              # Next.js 페이지
│   ├── index.tsx       # 메인 대시보드
│   ├── simulate.tsx    # 시뮬레이션 페이지
│   └── api/            # API 라우트
│       ├── simulate.ts # 시뮬레이션 처리
│       └── stats.ts    # 통계 조회
├── styles/             # 스타일 파일
│   └── globals.css     # 전역 CSS
└── data/               # SQLite 데이터베이스 (자동 생성)
```

## 🔐 카카오 비즈메시지 API 연동 가이드

### 1. 카카오 비즈니스 계정 생성

1. [카카오 비즈니스](https://business.kakao.com) 접속
2. 비즈니스 계정 생성 및 인증

### 2. 알림톡 템플릿 등록

1. 카카오 비즈니스 콘솔 → **알림톡** 메뉴
2. **템플릿 만들기** 클릭
3. 다음 내용으로 템플릿 작성:

```
고객님이 담아두신 상품,
월 {{monthly_payment}}원이면 구매할 수 있어요!

💳 최대 12개월 완전 무이자
📦 {{product_name}}
💰 총 {{total_amount}}원

지금 바로 부담없이 구매하세요 😊
```

4. 템플릿 승인 대기 (보통 1-2일 소요)

### 3. API 키 발급

1. [카카오 개발자 콘솔](https://developers.kakao.com) 접속
2. 애플리케이션 생성
3. **앱 키** 메뉴에서 REST API 키 확인
4. **알림톡** 서비스 활성화
5. **알림톡 발신번호** 등록

### 4. 환경 변수 설정

발급받은 정보를 `.env.local`에 입력:

```env
KAKAO_REST_API_KEY=발급받은_REST_API_키
KAKAO_SENDER_KEY=알림톡_발신번호
KAKAO_TEMPLATE_CODE=승인받은_템플릿_코드
```

## 🎨 데모 시나리오

### 시나리오 1: 단일 고객 시뮬레이션

1. 시뮬레이션 페이지 접속
2. 다음 정보 입력:
   - 고객명: 홍길동
   - 전화번호: 010-1234-5678
   - 상품명: 명품 가방
   - 총 금액: 240,000
3. 알림톡 발송
4. 대시보드에서 성과 확인

### 시나리오 2: 대량 시뮬레이션

여러 번 시뮬레이션을 실행하여 누적 데이터를 생성하고, 대시보드의 통계 변화를 관찰합니다.

## 📊 데이터베이스 스키마

### abandoned_carts
장바구니 이탈 고객 정보

### alimtalk_logs
알림톡 발송 로그

### conversions
전환 완료 내역

## 🚧 향후 개발 계획

- [ ] 카페24 OAuth 연동
- [ ] 카페24 Webhook 연동
- [ ] 실제 자동 감지 시스템
- [ ] 토스페이먼츠 결제 연동
- [ ] 전환 추적 링크 구현

## 📝 라이선스

내부 사용 전용

## 👥 문의

문의사항이 있으시면 개발팀에 연락해주세요.

