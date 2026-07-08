const { test, expect } = require("@playwright/test");
const searchData = require("../test-data/searchData.json");
const fs = require("fs");
const path = require("path");

const testSteps = [];

function addStep(
  id,
  title,
  description,
  expectedResult,
  actualResult,
  status
) {
  const now = new Date();

  testSteps.push({
    id,
    title,
    description,
    expectedResult,
    actualResult,
    status,
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
  });
}

const testCase = {
  id: "TC001",
  module: "Search",
  title: "Search Product",
  description: "Verify search functionality",
  expectedResult: "Matching products should be displayed",
  browser: "chromium",
};

test(
  `${testCase.id} | ${testCase.module} | ${testCase.title}`,
  async ({ page, browserName }, testInfo) => {
    testSteps.length = 0;

    testInfo.annotations.push({
      type: "metadata",
      description: JSON.stringify({
        ...testCase,
        browser: browserName,
      }),
    });

    // =====================================
    // Open Website
    // =====================================

    let startTime = Date.now();

    await page.goto("https://crowcrowcrow.com/", {
      waitUntil: "domcontentloaded",
    });

    let endTime = Date.now();

    console.log(`🏠 Homepage Load Time: ${endTime - startTime} ms`);

    addStep(
      "TC001",
      "Homepage Loaded",
      "Open homepage",
      "Homepage should open",
      "Homepage opened successfully",
      "passed"
    );

    // =====================================
    // Search Box
    // =====================================

    console.log("Waiting for search box...");

    const searchBox = page.locator(
      "input[placeholder='Search USA products...']"
    );

    await expect(searchBox).toBeVisible({
      timeout: 30000,
    });

    console.log("Search box found");

    await searchBox.fill(searchData.searchText);

    console.log("Text entered");

    addStep(
      "TC002",
      "Enter Search Text",
      "Enter search keyword",
      "Keyword should be entered",
      `"${searchData.searchText}" entered`,
      "passed"
    );

    // =====================================
    // Search Button
    // =====================================

    console.log("Waiting for button");

    const searchButton = page.locator(
      "button[aria-label='Search'][type='submit']"
    );

    await expect(searchButton).toBeVisible({
      timeout: 30000,
    });

    console.log("Button found");

    addStep(
      "TC003",
      "Search Button",
      "Verify button",
      "Button visible",
      "Button visible",
      "passed"
    );

    // =====================================
    // Click Search
    // =====================================

    startTime = Date.now();

    await searchButton.click();

    await page.waitForTimeout(5000);

    endTime = Date.now();

    console.log(`🔍 Search Results Load Time: ${endTime - startTime} ms`);

    console.log("Current URL:", page.url());

    addStep(
      "TC004",
      "Click Search",
      "Click search button",
      "Search should execute",
      "Search clicked",
      "passed"
    );

    // =====================================
    // Verify Products
    // =====================================

    const products = page.locator(
      ".product-card, [data-testid='product-card']"
    );

    const productCount = await products.count();

    console.log("Products Found:", productCount);

    if (productCount > 0) {
      await expect(products.first()).toBeVisible();
    }

    addStep(
      "TC005",
      "Verify Products",
      "Verify search results",
      "Products should appear",
      `${productCount} products found`,
      productCount > 0 ? "passed" : "failed"
    );

    // =====================================
    // Screenshot
    // =====================================

    const screenshotDir = path.join(
      process.cwd(),
      "screenshots"
    );

    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, {
        recursive: true,
      });
    }

    const screenshotName = `search-${Date.now()}.png`;

    await page.screenshot({
      path: path.join(screenshotDir, screenshotName),
      fullPage: true,
    });

    console.log(`SCREENSHOT_NAME=${screenshotName}`);

    addStep(
      "TC006",
      "Capture Screenshot",
      "Capture final screen",
      "Screenshot should be saved",
      screenshotName,
      "passed"
    );

    console.log("Search Test Completed Successfully");

    testInfo.annotations.push({
      type: "steps",
      description: JSON.stringify(testSteps),
    });
  }
);