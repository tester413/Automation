const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

// ===============================
// Read Search Data
// ===============================
const searchDataPath = path.join(
  __dirname,
  "../test-data/searchData.json"
);

const searchData = JSON.parse(
  fs.readFileSync(searchDataPath, "utf8")
);

// ===============================
// Test Steps
// ===============================
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

// ===============================
// Metadata
// ===============================
const testCase = {
  id: "TC001",
  module: "Search",
  title: "Search Product",
  description: "Verify Search functionality",
  expectedResult: "Search page should open",
  browser: "chromium",
};

// ===============================
// Test
// ===============================
test(
  `${testCase.id} | ${testCase.module} | ${testCase.title}`,
  async ({ page, browserName }, testInfo) => {
    testSteps.length = 0;

    testInfo.annotations.push({
      type: "metadata",
      description: JSON.stringify({
        ...testCase,
        browser: browserName,
        searchText: searchData.searchText,
      }),
    });

    console.log("Searching Product:", searchData.searchText);

    if (!searchData.searchText) {
      throw new Error("Search Text is empty.");
    }

    // ===============================
    // Open Website
    // ===============================

    let start = Date.now();

    await page.goto("https://crowcrowcrow.com/", {
      waitUntil: "networkidle",
      timeout: 60000,
    });

    console.log("TITLE:", await page.title());
    console.log("URL:", page.url());

    let end = Date.now();

    console.log(`🏠 Homepage Load Time: ${end - start} ms`);

    addStep(
      "TC001",
      "Homepage Loaded",
      "Open Homepage",
      "Homepage should load",
      "Homepage loaded successfully",
      "passed"
    );

    // ===============================
    // Find Search Box
    // ===============================

    console.log("Finding Search Box...");

    const searchBox = page.locator(
      "input[placeholder='Search USA products...']"
    );

    await expect(searchBox).toBeVisible({
      timeout: 30000,
    });

    await expect(searchBox).toBeEditable({
      timeout: 30000,
    });

    console.log("Search Box Found");

    console.log(
      "Editable:",
      await searchBox.isEditable()
    );

    console.log(
      "Enabled:",
      await searchBox.isEnabled()
    );

    console.log(
      "Visible:",
      await searchBox.isVisible()
    );

    await searchBox.scrollIntoViewIfNeeded();

    await page.waitForTimeout(1000);

    // Fill directly
    await searchBox.fill("");

    await searchBox.fill(searchData.searchText);

    console.log("Search text entered");

    addStep(
      "TC002",
      "Enter Search Keyword",
      "Enter Search Text",
      "Keyword should be entered",
      searchData.searchText,
      "passed"
    );

    // ===============================
    // Search Button
    // ===============================

    const searchButton = page.locator(
      "button[aria-label='Search'][type='submit']"
    );

    await expect(searchButton).toBeVisible({
      timeout: 30000,
    });

    await searchButton.scrollIntoViewIfNeeded();

    console.log("Search Button Found");

    addStep(
      "TC003",
      "Search Button",
      "Verify Search Button",
      "Search button should be visible",
      "Button Visible",
      "passed"
    );

    // ===============================
    // Click Search
    // ===============================

    start = Date.now();

    console.log("Clicking Search Button");

    await searchButton.click({
      force: true,
    });

    await page.waitForURL(
      (url) => url.toString().includes("/search"),
      {
        timeout: 60000,
      }
    );

    await page.waitForLoadState("networkidle");

    end = Date.now();

    console.log(
      `🔍 Search Results Load Time: ${end - start} ms`
    );

    console.log("Current URL:", page.url());

    addStep(
      "TC004",
      "Search Executed",
      "Search Product",
      "Search page should open",
      page.url(),
      "passed"
    );

    // ===============================
    // Verify Products
    // ===============================

    const products = page.locator(".product-card");

    const productCount = await products.count();

    console.log("Products Found:", productCount);

    addStep(
      "TC005",
      "Verify Results",
      "Verify Search Results",
      "Products should appear",
      `${productCount} Products`,
      productCount > 0 ? "passed" : "failed"
    );

    // ===============================
    // Screenshot
    // ===============================

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
      path: path.join(
        screenshotDir,
        screenshotName
      ),
      fullPage: true,
    });

    console.log("SCREENSHOT_NAME=" + screenshotName);

    addStep(
      "TC006",
      "Capture Screenshot",
      "Capture Result",
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