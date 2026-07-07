const { test, expect } = require('@playwright/test');

test('Sports & Outdoors - Add Product to Cart', async ({ page }) => {

  // ================= Homepage Load Time =================
  let startTime = Date.now();

  await page.goto('https://crowcrowcrow.com/', {
    waitUntil: 'networkidle'
  });

  let endTime = Date.now();
  console.log(`🏠 Homepage Load Time: ${endTime - startTime} ms`);

  // Step 2: Scroll down
  await page.mouse.wheel(0, 1000);
  await page.waitForTimeout(1000);

  // ================= Category Page Load Time =================
  const sportsCategory = page.getByRole('heading', {
    name: /Sports & Outdoors/i
  });

  await expect(sportsCategory).toBeVisible({ timeout: 30000 });

  startTime = Date.now();

  await sportsCategory.click();
  await page.waitForLoadState('networkidle');

  endTime = Date.now();
  console.log(`🏀 Sports & Outdoors Page Load Time: ${endTime - startTime} ms`);

  // Step 4: Scroll up
  await page.mouse.wheel(0, -800);
  await page.waitForTimeout(1000);

  // Step 5: Scroll down
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(1500);

  // ================= Product Page Load Time =================
  const product = page.getByRole('heading', {
    name: /Gamfeiny Colorful Lighting Baby Balance Bike Toys/i
  });

  await expect(product).toBeVisible({ timeout: 30000 });
  await product.scrollIntoViewIfNeeded();

  startTime = Date.now();

  await product.click();
  await page.waitForLoadState('networkidle');

  endTime = Date.now();
  console.log(`🛒 Product Page Load Time: ${endTime - startTime} ms`);

  // Step 7: Scroll up
  await page.mouse.wheel(0, -800);
  await page.waitForTimeout(1000);

  // Step 8: Scroll down to Add to Cart section
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(1500);

  // Step 9: Click Add to Cart
  const addToCart = page.getByRole('button', {
    name: /^Add to Cart$/i
  });

  await expect(addToCart).toBeVisible({ timeout: 30000 });
  await expect(addToCart).toBeEnabled();

  await addToCart.scrollIntoViewIfNeeded();

  startTime = Date.now();

  await addToCart.click();
  await page.waitForTimeout(3000);

  endTime = Date.now();
  console.log(`🛍️ Add to Cart Action Time: ${endTime - startTime} ms`);

}); 