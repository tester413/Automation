const { test, expect } = require('@playwright/test');

test('Count all Books products', async ({ page }) => {

  await page.goto('https://crowcrowcrow.com/');

  // Scroll to categories
  await page.evaluate(() => window.scrollBy(0, 2500));

  // Click Books
  await page.locator("//h3[normalize-space()='Books']").click();

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Scroll until no more content loads
  let previousHeight = 0;

  while (true) {
    const currentHeight = await page.evaluate(() => document.body.scrollHeight);

    if (currentHeight === previousHeight)
      break;

    previousHeight = currentHeight;

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
  }

  // Replace this with the actual product locator
  const products = page.locator('YOUR_PRODUCT_LOCATOR');

  const count = await products.count();

  console.log(`Total Books Products: ${count}`);

  expect(count).toBeGreaterThan(0);
});