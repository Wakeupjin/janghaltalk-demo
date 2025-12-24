# 카페24 앱 등록 및 연동 가이드

## 문제 해결

"계정이 생성 중 입니다" 페이지가 나타나는 경우, 카페24 개발자 센터에서 앱이 등록되지 않았거나 설정이 잘못된 것입니다.

## 1. 카페24 개발자 센터 접속

1. [카페24 개발자 센터](https://developers.cafe24.com) 접속
2. 카페24 계정으로 로그인
3. "내 앱" 메뉴 클릭

## 2. 새 앱 등록

1. "앱 만들기" 또는 "새 앱 등록" 버튼 클릭
2. 앱 정보 입력:
   - **앱 이름**: 장할톡 (또는 원하는 이름)
   - **앱 설명**: 카페24 쇼핑몰 장바구니 이탈 고객 알림톡 발송 서비스
   - **앱 카테고리**: 마케팅/프로모션
   - **서비스 URL**: Vercel 배포 URL (예: `https://janghaltalk-demo.vercel.app`)
   - **이용약관 URL**: (선택사항)
   - **개인정보처리방침 URL**: (선택사항)

## 3. OAuth 설정

### 3-1. 리다이렉트 URI 설정

**중요**: 정확한 리다이렉트 URI를 입력해야 합니다.

리다이렉트 URI 형식:
```
https://[배포된-도메인]/api/auth/cafe24/callback
```

예시:
- Vercel 배포: `https://janghaltalk-demo.vercel.app/api/auth/cafe24/callback`
- 커스텀 도메인: `https://janghaltalk.com/api/auth/cafe24/callback`

**주의사항**:
- 프로토콜(`https://`) 포함 필수
- 경로(`/api/auth/cafe24/callback`) 정확히 입력
- 마지막 슬래시(`/`) 없이 입력
- 여러 개 등록 가능 (개발/프로덕션 분리 시)

### 3-2. 권한 범위(Scope) 설정

다음 권한을 선택해야 합니다:

**필수 권한**:
- `mall.read_order` - 주문 조회 (장바구니 목록 조회용)
- `mall.read_customer` - 고객 정보 조회
- `mall.read_product` - 상품 정보 조회

**선택 권한** (향후 확장 시):
- `mall.read_cart` - 장바구니 조회 (있는 경우)
- `mall.write_order` - 주문 수정 (있는 경우)

## 4. Client ID 및 Client Secret 발급

앱 등록 완료 후:
1. "앱 상세" 페이지로 이동
2. **Client ID** 확인 및 복사
3. **Client Secret** 확인 및 복사 (보안상 중요!)

## 5. Vercel 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정합니다:

1. Vercel 대시보드 → 프로젝트 선택 → Settings → Environment Variables
2. 다음 변수 추가:

```
CAFE24_CLIENT_ID=발급받은_Client_ID
CAFE24_CLIENT_SECRET=발급받은_Client_Secret
NEXT_PUBLIC_APP_URL=https://janghaltalk-demo.vercel.app
```

**주의사항**:
- `NEXT_PUBLIC_APP_URL`은 실제 배포된 URL과 정확히 일치해야 합니다
- 리다이렉트 URI와 동일한 도메인을 사용해야 합니다
- 환경 변수 설정 후 **재배포** 필요

## 6. 앱 승인 요청 (필요 시)

일부 권한은 카페24 승인이 필요할 수 있습니다:
1. 앱 등록 후 "승인 요청" 버튼 클릭
2. 승인 대기 (보통 1-2일 소요)
3. 승인 완료 후 사용 가능

## 7. 테스트

1. Vercel 재배포 완료 후
2. 배포된 사이트 접속
3. "카페24 연결하기" 버튼 클릭
4. 카페24 로그인 페이지로 리다이렉트되는지 확인
5. 로그인 후 권한 승인
6. 정상적으로 연결되는지 확인

## 8. 트러블슈팅

### "계정이 생성 중 입니다" 페이지가 나타나는 경우

**원인**:
- 카페24 앱이 등록되지 않음
- Client ID가 잘못됨
- 리다이렉트 URI가 카페24 앱 설정과 일치하지 않음

**해결 방법**:
1. 카페24 개발자 센터에서 앱이 등록되어 있는지 확인
2. Client ID가 올바른지 확인
3. 리다이렉트 URI가 정확히 일치하는지 확인 (대소문자, 슬래시 포함)
4. Vercel 환경 변수 `NEXT_PUBLIC_APP_URL`이 실제 배포 URL과 일치하는지 확인

### "리다이렉트 URI가 일치하지 않습니다" 오류

**원인**:
- 카페24 앱 설정의 리다이렉트 URI와 코드의 리다이렉트 URI가 다름

**해결 방법**:
1. 카페24 개발자 센터 → 앱 상세 → OAuth 설정 확인
2. 리다이렉트 URI가 정확히 일치하는지 확인
3. `NEXT_PUBLIC_APP_URL` 환경 변수 확인
4. 재배포

### "권한이 없습니다" 오류

**원인**:
- 필요한 Scope가 선택되지 않음
- 앱 승인이 완료되지 않음

**해결 방법**:
1. 카페24 개발자 센터에서 권한 범위 확인
2. 필요한 권한이 모두 선택되어 있는지 확인
3. 앱 승인 상태 확인

## 9. 참고 자료

- [카페24 개발자 센터](https://developers.cafe24.com)
- [카페24 API 문서](https://developers.cafe24.com/docs/api/admin/)
- [OAuth 2.0 가이드](https://developers.cafe24.com/docs/api/admin/authentication/)

