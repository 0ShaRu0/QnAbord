import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("login is accessible and does not apply signup password length policy", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "다시 만나서 반가워요" })).toBeVisible();
  await expect(page.getByLabel("이메일", { exact: true })).toHaveAttribute("autocomplete", "email");
  await expect(page.getByLabel("비밀번호", { exact: true })).not.toHaveAttribute("minlength", "8");
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await page.getByLabel("이메일", { exact: true }).fill("unknown@example.test");
  await page.getByLabel("비밀번호", { exact: true }).fill("bad");
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toBeVisible();
  await expect(page.getByLabel("이메일", { exact: true })).toHaveValue("unknown@example.test");
  expect(errors).toEqual([]);
});

test("mobile signup and menu fit the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: "함께 질문하고 성장해요" })).toBeVisible();
  await expect(page.getByLabel("비밀번호", { exact: true })).toHaveAttribute("minlength", "8");
  await page.getByLabel("메뉴 열기").click();
  await expect(page.getByRole("navigation", { name: "모바일 메뉴" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test("favicon requests resolve to a real icon", async ({ request }) => {
  const response = await request.get("/favicon.ico");
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("image/svg+xml");
});

test("invalid confirmation links show a useful message", async ({ page }) => {
  await page.goto("/auth/confirm?type=email");
  await expect(page).toHaveURL(/\/login\?confirmation=failed/);
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "인증 링크가 만료되었거나 유효하지 않습니다",
  );
});

test("unconfigured deployments show the root error boundary instead of empty results", async ({
  page,
}) => {
  test.skip(
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    "This case specifically exercises a deployment with no database configuration.",
  );
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "페이지를 불러오지 못했습니다." })).toBeVisible();
  await expect(page.getByRole("button", { name: "다시 시도" })).toBeVisible();
  await expect(page.getByText("검색 결과를 찾을 수 없습니다.")).not.toBeVisible();
});
