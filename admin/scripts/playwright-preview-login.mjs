/**
 * One-off Preview login smoke check. Does not print secrets/tokens/cookies.
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE =
  process.env.PREVIEW_URL ||
  "https://elidzconnect-rcaqte7sn-tebogolekgothoane5-gmailcoms-projects.vercel.app";
const EMAIL = process.env.PREVIEW_EMAIL || "tebogo.lekgothoane@appimate.com";
const PASSWORD = process.env.PREVIEW_PASSWORD || "12345678";
const bypassPath = path.join(__dirname, ".vercel-bypass-secret");
const BYPASS =
  process.env.VERCEL_AUTOMATION_BYPASS_SECRET ||
  (fs.existsSync(bypassPath) ? fs.readFileSync(bypassPath, "utf8").trim() : "");

const findings = [];
const note = (msg) => {
  findings.push(msg);
  console.log(msg);
};

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1400, height: 900 },
    extraHTTPHeaders: BYPASS
      ? {
          "x-vercel-protection-bypass": BYPASS,
          "x-vercel-set-bypass-cookie": "true",
        }
      : {},
  });
  const page = await context.newPage();
  note(BYPASS ? "Using Vercel protection bypass header" : "No bypass secret configured");

  const loginPosts = [];
  page.on("response", async (res) => {
    try {
      const url = res.url();
      if (!url.includes("/api/auth/session/login") || res.request().method() !== "POST") return;
      const status = res.status();
      let body = "";
      try {
        body = await res.text();
      } catch {
        body = "";
      }
      // Redact token-like fields if present
      const redacted = body
        .replace(/"(accessToken|refreshToken|token|password)"\s*:\s*"[^"]*"/gi, '"$1":"[REDACTED]"')
        .slice(0, 400);
      loginPosts.push({ status, redacted, setCookiePresent: Boolean(res.headers()["set-cookie"]) });
    } catch {
      // ignore listener errors
    }
  });

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 300));
  });
  page.on("pageerror", (err) => {
    consoleErrors.push(String(err.message || err).slice(0, 300));
  });

  note(`Opening ${BASE}/auth/login`);
  const nav = await page.goto(`${BASE}/auth/login`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  note(`Login page HTTP ${nav?.status()}`);
  const title = await page.title();
  note(`Page title: ${title}`);

  const bodyText = await page.locator("body").innerText().catch(() => "");
  if (/vercel.*authentication|protected deployment|log in to vercel/i.test(bodyText + title)) {
    note("BLOCKED: Vercel Deployment Protection is intercepting the page (SSO/password gate).");
    note("Cannot complete app login without a protection bypass.");
    await page.screenshot({ path: "scripts/preview-login-blocked.png", fullPage: true });
    await browser.close();
    process.exitCode = 2;
    return;
  }

  // Prefer labeled inputs / common auth field names
  const email = page.locator('input[type="email"], input[name="email"], input[id*="email" i]').first();
  const password = page.locator('input[type="password"], input[name="password"]').first();
  await email.waitFor({ timeout: 15000 });
  await email.fill(EMAIL);
  await password.fill(PASSWORD);

  const submit = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")').first();
  note("Submitting login form…");
  await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes("/api/auth/") && r.request().method() === "POST",
      { timeout: 30000 }
    ).catch(() => null),
    submit.click(),
  ]);

  await page.waitForTimeout(2500);

  if (loginPosts.length === 0) {
    // Check whether Supabase auth was used instead
    const supabaseHits = [];
    page.on("request", () => {});
    note("No /api/auth/session/login POST observed yet; waiting briefly…");
    await page.waitForTimeout(2000);
  }

  for (const hit of loginPosts) {
    note(
      `Login POST /api/auth/session/login → HTTP ${hit.status}; Set-Cookie present=${hit.setCookiePresent}; body=${hit.redacted || "(empty)"}`
    );
  }

  const urlAfter = page.url();
  note(`URL after submit: ${urlAfter}`);

  const errUi = await page.locator(".text-red-500, [class*='error'], [role='alert']").allInnerTexts().catch(() => []);
  if (errUi.length) note(`UI error text: ${errUi.join(" | ").slice(0, 300)}`);

  // Navigate/refresh dashboard if we landed there
  if (!urlAfter.includes("/dashboard")) {
    note("Did not land on /dashboard automatically; trying /dashboard…");
    const dashNav = await page.goto(`${BASE}/dashboard`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    note(`Dashboard navigation HTTP ${dashNav?.status()}`);
    await page.waitForTimeout(2000);
  } else {
    note("Refreshing dashboard to verify session persistence…");
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
  }

  note(`Final URL: ${page.url()}`);
  const finalStatus = await page.evaluate(() => document.body?.innerText?.slice(0, 1500) || "");
  const looksGuest = /\bGuest\b/i.test(finalStatus);
  const looksWelcome = /Welcome back/i.test(finalStatus);
  const hasName = /Tebogo/i.test(finalStatus);
  const isLogin = page.url().includes("/auth/login");
  const is500 = /Internal Server Error|Application error/i.test(finalStatus);

  note(`Dashboard signals: guest=${looksGuest} welcome=${looksWelcome} nameVisible=${hasName} onLogin=${isLogin} serverError=${is500}`);
  if (consoleErrors.length) {
    note(`Console errors (${consoleErrors.length}): ${consoleErrors.slice(0, 5).join(" || ")}`);
  } else {
    note("No browser console errors captured.");
  }

  await page.screenshot({ path: "scripts/preview-login-result.png", fullPage: true });
  note("Screenshot saved: scripts/preview-login-result.png");

  await browser.close();

  const ok =
    loginPosts.some((h) => h.status >= 200 && h.status < 300) &&
    !looksGuest &&
    hasName &&
    !isLogin &&
    !is500;

  process.exitCode = ok ? 0 : 1;
  note(ok ? "RESULT: login + Super Admin identity look OK" : "RESULT: issues detected (see notes above)");
}

main().catch((err) => {
  console.error("Script failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
