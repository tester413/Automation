const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Support Form - API Driven Flow', () => {

  test.use({
    storageState: 'auth/auth.json'
  });

  test('Submit support form successfully', async ({ page }) => {

    // Read latest JSON every run
    const supportData = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../test-data/supportData.json'),
        'utf8'
      )
    );

    console.log("Support Data:", supportData);

    // Open website
    await page.goto('https://crowcrowcrow.com/', {
      waitUntil: 'networkidle'
    });

    // Navigate
    await page.locator('nav, header, aside')
      .getByText('Manage orders', { exact: true })
      .click();

    await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
    await page.getByRole('link', { name: 'Support', exact: true }).click();

    await page.waitForLoadState('networkidle');

    // ==========================
    // Category Dropdown
    // ==========================

    const categorySelect = page.locator('select');

    await expect(categorySelect).toBeVisible();

    const options = await categorySelect.locator('option').allTextContents();

    console.log("Available Options:", options);

    // Select by visible label
    await categorySelect.selectOption({
      label: supportData.category
    });

    // Verify selection
    await expect(categorySelect).toHaveValue(
      await categorySelect.evaluate(el => el.value)
    );

    // ==========================
    // Subject
    // ==========================

    const subjectInput = page.locator(
      'input[placeholder="Brief description of your issue"]'
    );

    await expect(subjectInput).toBeVisible();

    await subjectInput.click();
    await subjectInput.press('Control+A');
    await subjectInput.press('Delete');
    await subjectInput.fill(supportData.subject);

    console.log("Subject Filled:", supportData.subject);

    // ==========================
    // Description
    // ==========================

    const descriptionInput = page.locator(
      'textarea[placeholder="Describe your issue in detail..."]'
    );

    await expect(descriptionInput).toBeVisible();

    await descriptionInput.click();
    await descriptionInput.press('Control+A');
    await descriptionInput.press('Delete');
    await descriptionInput.fill(supportData.description);

    console.log("Description Filled:", supportData.description);

    // Verify values
    await expect(subjectInput).toHaveValue(supportData.subject);
    await expect(descriptionInput).toHaveValue(supportData.description);

    // ==========================
    // Submit
    // ==========================

    const responsePromise = page.waitForResponse(response => {
      return (
        response.request().method() === 'POST' &&
        response.url().includes('/api/support')
      );
    });

    const submitButton = page.getByRole('button', {
      name: /submit|send/i
    });

    await expect(submitButton).toBeEnabled();

    await submitButton.click();

    const response = await responsePromise;

    console.log("Captured API:", response.url());
    console.log("Status:", response.status());

    expect(response.status()).toBe(200);

    // ==========================
    // Screenshot
    // ==========================

    const screenshotName = `support-${Date.now()}.png`;

    await page.screenshot({
      path: `screenshots/${screenshotName}`,
      fullPage: true
    });

    console.log("SCREENSHOT_NAME=" + screenshotName);

    console.log("Support Test Completed Successfully");
  });

});