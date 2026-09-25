import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

const serviceKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
test.describe("real Supabase lifecycle", () => {
  test.skip(
    !serviceKey || !supabaseUrl,
    "Requires an isolated Supabase test project and TEST_SUPABASE_SERVICE_ROLE_KEY.",
  );

  test("login, validated question/answer CRUD, and mobile logout", async ({ page }) => {
    const admin = createClient(supabaseUrl!, serviceKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const email = `qa-${randomUUID()}@example.test`;
    const password = `Test-${randomUUID()}`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username: "테스트 회원" },
    });
    expect(error).toBeNull();
    const userId = data.user!.id;
    try {
      await page.goto("/login?redirectTo=/questions/write");
      await page.getByLabel("이메일", { exact: true }).fill(email);
      await page.getByLabel("비밀번호", { exact: true }).fill(password);
      await page.getByRole("button", { name: "로그인", exact: true }).click();
      await expect(page).toHaveURL(/\/questions\/write$/);
      const title = `테스트 질문 ${randomUUID()}`;
      await page.getByLabel("질문 제목", { exact: false }).fill(title);
      await page.getByLabel("카테고리", { exact: false }).selectOption("웹개발");
      await page.getByLabel("질문 내용", { exact: false }).fill("브라우저에서 검증하는 질문 본문");
      await page.getByLabel("태그", { exact: false }).fill("a,b,c,d,e,f");
      await page.getByRole("button", { name: "질문 등록" }).click();
      await expect(page.getByRole("main").getByRole("alert")).toContainText("최대 5개");
      await expect(page.getByLabel("질문 제목", { exact: false })).toHaveValue(title);
      await page.getByLabel("태그", { exact: false }).fill("# javascript, javascript");
      await page.getByRole("button", { name: "질문 등록" }).click();
      await expect(page).toHaveURL(/\/questions\/[0-9a-f-]{36}$/);
      await expect(page.getByRole("heading", { name: title })).toBeVisible();
      const detailUrl = page.url();

      await page.getByLabel("답변 내용", { exact: true }).fill("첫 번째 답변입니다.");
      await page.getByRole("button", { name: "답변 등록" }).click();
      await expect(page.getByText("첫 번째 답변입니다.", { exact: true })).toBeVisible();
      await expect(page.getByLabel("답변 내용", { exact: true })).toHaveValue("");
      await page.getByRole("button", { name: "수정", exact: true }).click();
      await page.getByLabel("답변 수정", { exact: true }).fill("수정된 답변입니다.");
      await page.getByRole("button", { name: "저장", exact: true }).click();
      await expect(page.getByText("수정된 답변입니다.", { exact: true })).toBeVisible();
      const answer = page.locator("article").filter({ hasText: "수정된 답변입니다." });
      await answer.getByRole("button", { name: "삭제", exact: true }).click();
      await page
        .getByRole("dialog", { name: "답변을 삭제할까요?" })
        .getByRole("button", { name: "삭제하기" })
        .click();
      await expect(page.getByText("아직 답변이 없습니다.")).toBeVisible();

      await page.getByRole("link", { name: "수정", exact: true }).click();
      await page.getByLabel("질문 제목", { exact: false }).fill(`${title} 수정`);
      await page.getByRole("button", { name: "수정 완료" }).click();
      await expect(page.getByRole("heading", { name: `${title} 수정` })).toBeVisible();
      await page.getByRole("button", { name: "삭제", exact: true }).click();
      await page
        .getByRole("dialog", { name: "질문을 삭제할까요?" })
        .getByRole("button", { name: "삭제하기" })
        .click();
      await expect(page).toHaveURL(/\/questions$/);
      await page.goto(detailUrl);
      await expect(page.getByRole("heading", { name: "질문을 찾을 수 없습니다" })).toBeVisible();

      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("/");
      await page.getByRole("button", { name: "로그아웃", exact: true }).click();
      await expect(page.getByRole("link", { name: "로그인", exact: true })).toBeVisible();
    } finally {
      const { error: cleanupError } = await admin.auth.admin.deleteUser(userId);
      expect(cleanupError).toBeNull();
    }
  });

  test("email confirmation establishes a server cookie session", async ({ page }) => {
    const admin = createClient(supabaseUrl!, serviceKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const email = `confirm-${randomUUID()}@example.test`;
    // Generate the same one-time token used by the configured confirmation email.
    // Delivery itself is provided by Supabase; this verifies the app's callback.
    const { data, error } = await admin.auth.admin.generateLink({
      type: "signup",
      email,
      password: `Test-${randomUUID()}`,
    });
    expect(error).toBeNull();
    try {
      await page.goto(
        `/auth/confirm?token_hash=${encodeURIComponent(data.properties!.hashed_token)}&type=email&next=/questions/write`,
      );
      await expect(page).toHaveURL(/\/questions\/write$/);
      await expect(page.getByRole("heading", { name: "무엇이 궁금한가요?" })).toBeVisible();
      await page.reload();
      await expect(page.getByRole("button", { name: "로그아웃", exact: true })).toBeVisible();
    } finally {
      await admin.auth.admin.deleteUser(data.user!.id);
    }
  });
});
