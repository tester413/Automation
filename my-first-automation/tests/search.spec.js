const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

// =====================================
// Read Search Data
// =====================================

const searchData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../test-data/searchData.json"),
    "utf8"
  )
);

const testSteps = [];

function addStep(
  id,
  title,
  description,
  expectedResult,
  actualResult,
  status
) {
  testSteps.push({
    id,
    title,
    description,
    expectedResult,
    actualResult,
    status,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
  });
}

const testCase = {
  id: "TC001",
  module: "Search",
  title: "Search Product",
};

test(
  `${testCase.id} | ${testCase.module} | ${testCase.title}`,
  async ({ page, browserName }, testInfo) => {
    testInfo.setTimeout(180000);

    testInfo.annotations.push({
      type: "metadata",
      description: JSON.stringify({
        ...testCase,
        browser: browserName,
        searchText: searchData.searchText,
      }),
    });

    console.log("Searching Product:", searchData.searchText);

    // =====================================
    // Open Website
    // =====================================

    // =====================================
// TC001 - Open Website
// =====================================

console.log("Opening Website...");

const startTime = Date.now();

await page.goto("https://crowcrowcrow.com/", {
  waitUntil: "domcontentloaded",
  timeout: 120000,
});

await page.waitForLoadState("networkidle");

const loadTime = Date.now() - startTime;

console.log(`🏠 Homepage Load Time: ${loadTime} ms`);
console.log("TITLE:", await page.title());
console.log("URL:", page.url());

await expect(page).toHaveURL("https://crowcrowcrow.com/");

addStep(
  "TC001",
  "Open Website",
  "Navigate to https://crowcrowcrow.com/",
  "Website should open successfully",
  `Website opened successfully in ${loadTime} ms`,
  "passed"
);
    // =====================================
    // Debug Inputs
    // =====================================

    const inputCount = await page.locator("input").count();

    console.log("TOTAL INPUTS:", inputCount);

    for (let i = 0; i < inputCount; i++) {
      console.log(
        "INPUT",
        i,
        await page.locator("input").nth(i).getAttribute("placeholder")
      );
    }

    // =====================================
    // Search Box
    // =====================================

    const searchBox = page.locator(
  "input[placeholder='Search USA products...']"
);

await expect(searchBox).toBeVisible({
  timeout: 60000,
});

console.log("Search box found");

// Wait for page to settle
await page.waitForTimeout(3000);

console.log("Visible:", await searchBox.isVisible());
console.log("Enabled:", await searchBox.isEnabled());
console.log("Editable:", await searchBox.isEditable());

await expect(searchBox).toBeEditable({
  timeout: 60000,
});

console.log("Filling search text...");

await searchBox.fill(searchData.searchText);

console.log("Search text entered:", searchData.searchText);

addStep(
  "TC002",
  "Enter Search Text",
  "Enter keyword",
  "Keyword should be entered",
  searchData.searchText,
  "passed"
);

    // =====================================
    // Search Button
    // =====================================

    const searchButton = page.locator(
      "button[aria-label='Search'][type='submit']"
    );

    await expect(searchButton).toBeVisible({
      timeout: 60000,
    });

    console.log("Waiting for search button...");

    await searchButton.scrollIntoViewIfNeeded();

    console.log("Clicking search button...");

    const searchStart = Date.now();

    await searchButton.click({
      force: true,
    });

    // =====================================
    // Wait Search Result
    // =====================================

    await page.waitForURL(
      url => url.toString().includes("/search"),
      {
        timeout: 60000,
      }
    );

    await page.waitForLoadState("domcontentloaded");

    await page.waitForTimeout(3000);

    console.log(
      "Search Results Load Time:",
      Date.now() - searchStart,
      "ms"
    );

    console.log("Current URL:", page.url());

    addStep(
      "TC003",
      "Execute Search",
      "Click search button",
      "Search page should open",
      page.url(),
      "passed"
    );

    // =====================================
    // Product Count
    // =====================================

    const products = page.locator(
      ".product-card, [data-testid='product-card']"
    );

    const productCount = await products.count();

    console.log("Products Found:", productCount);

    addStep(
      "TC004",
      "Verify Search Results",
      "Verify products are displayed",
      "Products should be displayed",
      `${productCount} product(s)`,
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
      path: path.join(
        screenshotDir,
        screenshotName
      ),
      fullPage: true,
    });

    console.log(
      "SCREENSHOT_NAME=" + screenshotName
    );

    addStep(
      "TC005",
      "Capture Screenshot",
      "Capture search page",
      "Screenshot should be saved",
      screenshotName,
      "passed"
    );

    // =====================================
    // Save Steps
    // =====================================

    testInfo.annotations.push({
      type: "steps",
      description: JSON.stringify(testSteps),
    });

    console.log("Search Test Completed Successfully");
  }
);