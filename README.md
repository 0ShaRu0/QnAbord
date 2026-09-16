# Q&A Community

Next.js App Router와 Supabase로 만든 질문·답변 커뮤니티입니다. 질문 검색, 카테고리 필터, 정렬, 이메일 인증, 질문·답변 CRUD, 원자적 조회수 증가와 RLS 정책을 포함합니다.

## 로컬 실행

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`에 Supabase 프로젝트 값을 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Supabase SQL Editor에서 `supabase/migrations/20260916000000_initial_schema.sql`을 실행하거나 Supabase CLI로 마이그레이션을 적용합니다.

```bash
supabase link --project-ref your-project-ref
supabase db push
```

## 품질 확인

```bash
npm run lint
npm run build
```

현재 프로젝트 경로에 한글이 포함되어 있어 Turbopack의 UTF-8 경로 처리 오류를 피하도록 개발 및 빌드 명령은 Webpack 모드를 사용합니다. Vercel의 영문 경로에서도 동일하게 동작합니다.

## Vercel 배포

1. 이 프로젝트를 GitHub 저장소에 push합니다.
2. Vercel에서 저장소를 import합니다.
3. Production 환경변수에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 등록합니다.
4. 배포 후 Supabase Authentication의 Site URL과 Redirect URLs에 배포 도메인을 추가합니다.
5. Supabase Table Editor에서 RLS가 모든 공개 테이블에 활성화되어 있는지 확인합니다.

Service Role Key는 이 앱에 필요하지 않으며 브라우저 환경변수로 등록하면 안 됩니다.
