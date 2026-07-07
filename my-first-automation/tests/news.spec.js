const { test, expect } = require("@playwright/test");
const newsData = require("../test-data/newsData.json");
const fs = require("fs");
const path = require("path");
const screenshots = [];

console.log(
  "AUTH FILE EXISTS:",
  fs.existsSync(
    path.join(process.cwd(),"auth","auth.json")
  )
);

test.use({
  storageState: "auth/auth.json",
});

test("Newsletter Subscription", async ({ page }) => {
  // ==========================
  // Open Website
  // ==========================

  const startTime = Date.now();

  await page.goto("https://crowcrowcrow.com/", {
    waitUntil: "networkidle",
  });

  const endTime = Date.now();

  console.log(`🏠 Homepage Load Time: ${endTime - startTime} ms`);

  // ==========================
  // Scroll to Footer
  // ==========================

  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });

  await page.waitForTimeout(2000);

  // ==========================
  // Email Input
  // ==========================

  const emailInput = page
    .locator("input[placeholder='Enter your email address']")
    .last();

  await emailInput.scrollIntoViewIfNeeded();
  await expect(emailInput).toBeVisible({ timeout: 10000 });

  await emailInput.click();
  await emailInput.fill(newsData.email);

  await expect(emailInput).toHaveValue(newsData.email);

  // ==========================
  // Subscribe Button
  // ==========================

  const subscribeBtn = page.getByRole("button", {
    name: /subscribe/i,
  });

  await subscribeBtn.scrollIntoViewIfNeeded();
  await expect(subscribeBtn).toBeVisible({ timeout: 10000 });
  await expect(subscribeBtn).toBeEnabled();

  await subscribeBtn.click();

  await page.waitForTimeout(3000);

  // ==========================
  // Screenshot
  // ==========================

  const screenshotDir = path.join(process.cwd(), "screenshots");

  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const screenshotName = `newsletter-${Date.now()}.png`;

  await page.screenshot({
    path: path.join(screenshotDir, screenshotName),
    fullPage: true,
  });


  screenshots.push(screenshotName);

  fs.writeFileSync(
    path.join(screenshotDir, "screenshots.json"),
    JSON.stringify(screenshots, null, 2)
);

console.log("Screenshot list created");
  // Backend reads this value
  console.log(`SCREENSHOT_NAME=${screenshotName}`);

  console.log("Newsletter Test Completed Successfully");
});