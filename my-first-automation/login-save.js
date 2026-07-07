const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://crowcrowcrow.com/login');

  console.log('Login manually and enter OTP');
  console.log('After successful login, press ENTER in terminal');

  process.stdin.once('data', async () => {
    await context.storageState({
      path: 'auth/auth.json'
    });

    console.log('Session saved successfully');
    await browser.close();
  });
})();