# 배포 및 장애 복구

## `870205635`: `question_feed`를 찾지 못하는 오류

확인된 원본 오류:

```text
Could not find the table 'public.question_feed' in the schema cache
```

`question_feed`는 테이블이 아니라 뷰입니다. React 오류 번호 자체보다 Vercel Runtime Logs의 원본 오류와 연결 프로젝트를 확인합니다.

1. 오류가 난 **배포의** Production/Preview 환경변수에서 Supabase URL의 프로젝트 참조를 확인합니다.
2. 같은 Supabase 프로젝트의 SQL Editor에서 `supabase/diagnostics.sql`을 실행합니다. 초기 테이블조차 없다면 먼저 아래 초기 마이그레이션을 적용합니다. 진단 파일의 마지막 프로필 조회는 초기 테이블이 필요합니다.
3. 마이그레이션 이력과 실제 객체를 비교합니다. CLI로 이력을 조회하는 명령은 `supabase migration list`입니다.
4. 초기 스키마가 전혀 없으면 초기 마이그레이션부터 순서대로 적용합니다. 초기 스키마가 정상 적용되었고 뷰만 누락된 경우에는 두 번째 마이그레이션이 뷰를 복구합니다.
5. 뷰가 존재하면 `public` API 노출 설정, 뷰와 기반 테이블의 SELECT 권한을 확인합니다. 모든 객체가 정상일 때만 `NOTIFY pgrst, 'reload schema';`로 캐시를 갱신합니다.
6. 올바른 환경변수로 Vercel을 재배포합니다. `NEXT_PUBLIC_*` 변경은 새 빌드에 반영해야 합니다.
7. 앱과 동일한 공개 키로 `npm run check:deployment`를 실행하고 실제 배포의 홈·목록·상세·로그인을 확인합니다.

저장소의 `vercel.json`은 `check:deployment` 통과 후에만 Next 빌드를 실행합니다. 배포가 이 단계에서 실패하면 먼저 DB/환경 설정을 복구합니다. CI의 로컬 Supabase 검증과 별도로 실제 배포 환경을 확인하는 절차입니다.

### 적용할 SQL

```text
supabase/migrations/20260916000000_initial_schema.sql
supabase/migrations/20260925000000_harden_board_contract.sql
```

- 초기 SQL은 반복 실행용이 아닙니다. 기존 테이블·타입이 있으면 무작정 다시 실행하지 않습니다.
- 두 번째 SQL은 초기 스키마를 전제로 하는 **한 번 적용하는 버전 마이그레이션**입니다. 뷰만 없거나 기존 뷰가 있는 두 경우를 테스트합니다.
- 일부 테이블·정책·함수까지 누락된 부분 적용 상태라면 누락 범위를 먼저 복구해야 합니다. 두 번째 SQL을 만능 복구 스크립트로 사용하지 않습니다.
- SQL Editor에서 수동 적용했다면 내용과 실제 객체를 확인한 후 CLI의 `migration repair --status applied <version>`으로 이력을 맞춥니다. 이 명령 자체가 SQL을 실행하지는 않습니다.
- 새 앱은 `search_questions` RPC를 사용하므로 **DB 변경 → 앱 배포 → 스모크 검증** 순서로 진행합니다. 기존 앱의 답변 수정은 `updated_at`을 직접 보내므로 권한 강화 시점부터 새 앱 배포 전까지 실패할 수 있습니다. 해당 변경을 같은 배포 작업으로 진행합니다.

CLI로 신규/이력이 일치하는 프로젝트에 적용할 때:

```bash
supabase link --project-ref <project-ref>
supabase migration list
supabase db push
npm run check:deployment
```

### 기존 데이터 검사

두 번째 마이그레이션은 공백뿐인 제목·본문·사용자명, 정규화 후 빈 태그, 질문당 5개 초과 태그가 있으면 전체 트랜잭션을 중단합니다. 해당 데이터를 확인하고 수정한 후 다시 적용합니다. 자동으로 본문이나 초과 태그를 삭제하지 않습니다.

태그의 앞쪽 `#`와 공백은 정규화하고 같은 이름은 병합하며, 질문 연결은 보존합니다. 기존 auth 사용자 중 프로필이 없는 계정도 보충합니다.

## 이메일 인증

Supabase Authentication에서 다음을 설정합니다.

- Site URL: 실제 배포 도메인
- Redirect URLs: 사용하는 Production/Preview 주소
- Confirm signup 템플릿: `supabase/templates/confirmation.html` 내용

앱의 확인 링크는 다음 형태입니다.

```html
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

확인 라우트가 `verifyOtp`를 실행하고 SSR 쿠키 세션을 설정합니다. 단순히 Site URL만 등록하고 기존 인증 템플릿을 유지하면 이 콜백을 거치지 않을 수 있습니다. Preview마다 인증을 검증하려면 해당 테스트 프로젝트의 Site URL도 일치시킵니다.

## 환경변수

| 변수                             | 용도                                                     |
| -------------------------------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`       | 앱이 사용하는 Supabase 프로젝트 URL                      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | 해당 프로젝트의 공개 anon/publishable 키                 |
| `TEST_DATABASE_URL`              | DB 통합 테스트용 PostgreSQL 서버. 임시 DB 생성 권한 필요 |
| `TYPEGEN_DATABASE_URL`           | 마이그레이션이 적용된 DB의 읽기 가능한 타입 생성 연결    |
| `TEST_SUPABASE_SERVICE_ROLE_KEY` | 격리된 Supabase E2E 환경에서만 테스트 사용자 생성·삭제   |
| `PLAYWRIGHT_BASE_URL`            | 이미 실행 중인 테스트 배포에 E2E를 실행할 때 지정        |

앱은 service-role 키를 사용하지 않습니다. 테스트용 service-role 키를 `NEXT_PUBLIC_*` 변수에 등록하지 않습니다.

## 로그와 오류 처리

서버 로그는 작업명(`questions.list`, `auth.login` 등), DB/Auth 오류 코드, 안전한 리소스 식별자를 기록합니다. DB 상세 메시지는 입력 데이터가 포함될 수 있어 사용자 화면이나 구조화 로그에 그대로 전달하지 않습니다.

기본 게시판 장애는 오류 화면으로, 인기 목록이나 헤더 프로필 장애는 해당 영역의 대체 상태로 표시합니다. 인프라 장애를 빈 검색 결과나 비로그인으로 정상 처리하지 않습니다.

## 검증과 되돌리기

배포 전 DB 백업/복구 시점을 확보하고 마이그레이션은 먼저 테스트 프로젝트에서 확인합니다. 마이그레이션 내부 실패는 트랜잭션으로 롤백됩니다. 이미 완료된 DB 변경을 되돌릴 때는 적용 이력만 지우지 말고 호환되는 전진 마이그레이션이나 확인된 복구 시점을 사용합니다.

새 권한 계약은 이전 답변 수정 코드와 다르므로 앱만 이전 버전으로 롤백할 때도 DB 계약을 확인합니다. 정상 동작하는 새 버전에서 작은 전진 수정으로 복구하는 것을 기본으로 합니다.
