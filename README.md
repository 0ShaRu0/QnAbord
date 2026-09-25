# Q&A Community

Next.js App Router와 Supabase로 만든 질문·답변 커뮤니티입니다. 검색·필터·페이지네이션, 이메일 인증, 질문·답변 CRUD, 원자적 조회수 증가, RLS와 컬럼 권한을 포함합니다.

## 로컬 실행

Node **24 LTS**, npm **11**을 사용합니다. 잠금 파일을 유지하고 `npm ci`로 설치합니다.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

`.env.local`에 같은 프로젝트의 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 입력합니다. 빈 값·예제 URL로는 운영 데이터를 표시하지 않습니다.

DB에는 `supabase/migrations/`의 **두 SQL 파일을 버전 순서대로** 적용합니다. Docker와 Supabase CLI가 있다면 다음으로 격리된 로컬 환경을 시작할 수 있습니다.

```bash
supabase start
supabase status
```

출력된 API URL과 anon key를 `.env.local`에 설정합니다. 로컬 메일함은 `http://127.0.0.1:54324`입니다. 기존 원격 프로젝트의 적용 방법은 [배포·장애 복구 문서](docs/deployment.md)를 따릅니다.

프로젝트 경로의 한글 관련 Turbopack 문제를 피하도록 개발·빌드는 Webpack을 사용합니다.

## 품질 확인

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

### DB 통합 테스트 및 타입 생성

DB 통합 테스트는 PostgreSQL 17 이상 서버에 임시 DB를 만들고 종료 시 제거합니다. 테스트 전용 서버와 DB 생성 권한이 필요합니다.

```bash
TEST_DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/postgres npm run test:db
```

마이그레이션 후 DB 타입을 갱신하는 방법:

```bash
TYPEGEN_DATABASE_URL=postgres://... npm run types:db
```

또는 테스트용 DB에 마이그레이션을 처음부터 적용한 결과로 갱신합니다.

```bash
UPDATE_DATABASE_TYPES=1 TEST_DATABASE_URL=postgres://... npm run test:db
```

`types/database.types.ts`는 자동 생성 파일입니다. DB 테스트가 타입 드리프트를 검사합니다. Supabase 공식 타입 생성 엔진을 사용하고 확장 프로그램 소유 함수는 제외해 pgcrypto 설치 스키마·버전 차이로 생기는 잡음을 줄입니다.

### 브라우저 테스트

```bash
npx playwright install chromium
npm run build
npm run test:e2e
```

스모크 테스트는 DB 없이도 실행합니다. 전체 CRUD·인증 E2E는 격리된 Supabase 환경에서 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `TEST_SUPABASE_SERVICE_ROLE_KEY`를 테스트 프로세스에 전달해야 합니다. `tsx`/Playwright 자체는 `.env.local`을 자동으로 읽지 않으므로 셸 환경변수로 전달하거나 Node의 `--env-file` 기능을 사용합니다. 전체 E2E는 테스트 사용자를 만들고 종료 시 삭제합니다.

GitHub Actions는 PostgreSQL 권한 테스트와 별도의 로컬 Supabase E2E 작업을 실행합니다. 실제 메일 배달은 E2E 범위에 포함하지 않습니다.

## Vercel 배포

1. 올바른 Supabase 프로젝트에 마이그레이션을 적용합니다.
2. Vercel Node 버전을 24로 맞춥니다.
3. Production/Preview 각각의 공개 Supabase URL·키를 등록합니다.
4. [인증 메일 템플릿과 Site URL](docs/deployment.md#이메일-인증)을 설정합니다.
5. 재배포 후 API 계약과 주요 페이지를 확인합니다.

```bash
npm run check:deployment
```

위 명령은 `.env.local` 또는 프로세스 환경변수의 **공개 키**로 뷰와 검색 RPC에 접근합니다. `question_feed`가 없다는 오류는 [복구 절차](docs/deployment.md#870205635-question_feed를-찾지-못하는-오류)를 확인하세요.

`vercel.json`은 이 검사를 빌드 전에 실행합니다. DB 계약이 누락되거나 프로젝트 키가 잘못되면 새 배포를 성공 처리하지 않습니다. Vercel 대시보드에서 Build Command를 별도로 덮어썼다면 저장소 설정과 일치시키세요.

앱에 service-role 키는 필요하지 않습니다. 테스트용 관리자 키를 브라우저 환경변수로 등록하지 않습니다.

## 구조와 참고 자료

- [아키텍처·데이터 계약](docs/architecture.md)
- [배포·진단·운영 절차](docs/deployment.md)
- [기존 디자인 참고 이미지](ex_image/5dc068af-01a2-4c8a-b9b4-a975d440c0b0.png): 앱에서 전송하는 자산이 아닌 저장소 참고 자료입니다. 원본의 출처·라이선스 정보는 저장소에 제공되어 있지 않습니다.

코드는 UTF-8/LF, 2칸 들여쓰기와 Prettier 규칙을 사용합니다. 에이전트 세션 상태·빌드 산출물·테스트 리포트는 추적하지 않습니다.
