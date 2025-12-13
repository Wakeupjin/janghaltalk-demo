# Vercel 배포 가이드

## 1. GitHub 저장소 생성 및 푸시

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/janghaltalk-demo.git
git push -u origin main
```

## 2. Vercel 배포

1. [Vercel](https://vercel.com) 접속 및 GitHub 계정 연동
2. "New Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - Framework Preset: Next.js (자동 감지)
   - Root Directory: `./`
   - Build Command: `npm run build` (기본값)
   - Output Directory: `.next` (기본값)
5. Environment Variables 추가 (선택사항):
   - `KAKAO_REST_API_KEY` - 카카오 비즈메시지 REST API 키
   - `KAKAO_ADMIN_KEY` - 카카오 비즈메시지 Admin 키
   - `KAKAO_SENDER_KEY` - 카카오 알림톡 발신번호
   - `KAKAO_TEMPLATE_CODE` - 카카오 알림톡 템플릿 코드
   - `NEXT_PUBLIC_APP_URL` - 배포 후 자동 생성된 URL (또는 커스텀 도메인)
   - `DATABASE_PATH` - `./data/janghaltalk.db` (기본값)
6. "Deploy" 클릭

## 3. 배포 후 확인

배포가 완료되면 Vercel 대시보드에서 제공하는 URL로 접속하여 확인할 수 있습니다.

예: `https://janghaltalk-demo.vercel.app`

### 3-1. Vercel 프로젝트를 Public으로 설정 (공개 접근 허용)

1. Vercel 대시보드 → 프로젝트 선택
2. Settings → General
3. "Visibility" 섹션에서 **"Public"** 선택
4. 저장

이렇게 하면 회원가입 없이 링크로 접근할 수 있습니다.

## 3-2. Netlify로 배포 (대안 - 기본적으로 공개)

Netlify는 기본적으로 공개 접근이 가능합니다.

1. [Netlify](https://www.netlify.com) 접속 및 GitHub 계정 연동
2. "Add new site" → "Import an existing project"
3. GitHub 저장소 선택: `Wakeupjin/janghaltalk-demo`
4. 빌드 설정 (자동 감지됨):
   - Build command: `npm run build`
   - Publish directory: `.next`
5. "Deploy site" 클릭

배포 완료 후 `https://janghaltalk-demo.netlify.app` 형태의 URL이 생성되며, 누구나 접근 가능합니다.

## 4. 데이터베이스 주의사항

⚠️ **중요**: Vercel은 서버리스 환경이므로 SQLite 파일이 영구 저장되지 않습니다.

- 각 함수 실행마다 새로운 인스턴스가 생성될 수 있습니다
- 파일 시스템이 임시적이므로 데이터가 유지되지 않을 수 있습니다
- 데모 목적이라면 문제없지만, 실제 운영 시에는 다음을 사용해야 합니다:
  - **Vercel Postgres** (추천)
  - **PlanetScale** (MySQL)
  - **MongoDB Atlas**
  - **Supabase**

### Vercel Postgres 사용 시 (선택사항)

1. Vercel 대시보드 → 프로젝트 → Storage → Create Database
2. Postgres 선택
3. 환경 변수 자동 추가됨:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
4. `lib/db.ts`를 PostgreSQL용으로 수정 필요

## 5. 커스텀 도메인 설정 (선택사항)

1. Vercel 대시보드 → Settings → Domains
2. 원하는 도메인 입력
3. DNS 설정 안내에 따라 도메인 제공업체에서 설정
4. 인증 완료 후 자동 HTTPS 적용

## 6. 환경 변수 업데이트

배포 후 커스텀 도메인을 사용하는 경우:

1. Vercel 대시보드 → Settings → Environment Variables
2. `NEXT_PUBLIC_APP_URL` 값을 커스텀 도메인으로 업데이트
3. 재배포 (자동 또는 수동)

## 7. 자동 배포 설정

기본적으로 GitHub에 푸시하면 자동으로 재배포됩니다.

- `main` 브랜치에 푸시 → Production 배포
- 다른 브랜치에 푸시 → Preview 배포

## 8. 트러블슈팅

### 빌드 실패 시

1. Vercel 대시보드 → Deployments → 실패한 배포 클릭
2. Build Logs 확인
3. 일반적인 원인:
   - 환경 변수 누락
   - 의존성 설치 실패
   - TypeScript 오류

### 데이터베이스 오류 시

- SQLite는 서버리스 환경에서 제한적입니다
- PostgreSQL 등 영구 저장소로 마이그레이션 권장

## 9. 성능 최적화

- Vercel은 자동으로 CDN을 제공합니다
- 이미지 최적화는 Next.js Image 컴포넌트 사용
- API 라우트는 자동으로 서버리스 함수로 변환됩니다

