const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

// =============================
// Read Search Data
// =============================
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
    testInfo.setTimeout(120000);

    testInfo.annotations.push({
      type: "metadata",
      description: JSON.stringify({
        ...testCase,
        browser: browserName,
        searchText: searchData.searchText,
      }),
    });

    console.log("Searching Product:", searchData.searchText);

    // =============================
    // Open Website
    // =============================

    const start = Date.now();

    await page.goto("https://crowcrowcrow.com", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await page.waitForLoadState("networkidle");

    console.log("TITLE:", await page.title());
    console.log("URL:", page.url());

    console.log(
      "Homepage Load:",
      Date.now() - start,
      "ms"
    );

    addStep(
      "TC001",
      "Open Website",
      "Navigate to homepage",
      "Homepage should open",
      "Homepage opened successfully",
      "passed"
    );

    // =============================
    // Debug Inputs
    // =============================

    const inputCount = await page.locator("input").count();

    console.log("TOTAL INPUTS:", inputCount);

    for (let i = 0; i < inputCount; i++) {
      console.log(
        "INPUT",
        i,
        await page
          .locator("input")
          .nth(i)
          .getAttribute("placeholder")
      );
    }

    // =============================
    // Search Box
    // =============================

    const searchBox = page.locator(
      "input[placeholder='Search USA products...']"
    );

    await expect(searchBox).toBeVisible({
      timeout: 30000,
    });

    console.log("Search box found");

    await searchBox.scrollIntoViewIfNeeded();

    // Focus using JS (avoids overlay issues)
    await searchBox.evaluate((el) => el.focus());

    console.log("Focused search box");

    // Set value using JS (avoids click/fill hanging)
    await searchBox.evaluate(
      (el, value) => {
        el.value = "";
        el.value = value;
        el.dispatchEvent(
          new Event("input", {
            bubbles: true,
          })
        );
      },
      searchData.searchText
    );

    console.log("Text Entered:", searchData.searchText);

    addStep(
      "TC002",
      "Enter Search Text",
      "Enter keyword",
      "Keyword entered",
      searchData.searchText,
      "passed"
    );

    // =============================
    // Submit Search
    // =============================

    console.log("Press Enter");

    await searchBox.press("Enter");

    try {
      await page.waitForURL(
        (url) => url.toString().includes("/search"),
        {
          timeout: 10000,
        }
      );
    } catch {
      console.log("Enter failed. Clicking button.");

      const button = page.locator(
        "button[type='submit']"
      );

      await button.click();

      await page.waitForURL(
        (url) => url.toString().includes("/search"),
        {
          timeout: 30000,
        }
      );
    }

    await page.waitForLoadState("networkidle");

    console.log("Current URL:", page.url());

    addStep(
      "TC003",
      "Search",
      "Submit search",
      "Search page opens",
      page.url(),
      "passed"
    );

    // =============================
    // Product Count
    // =============================

    const products = page.locator(
      "[data-testid='product-card'], .product-card"
    );

    const count = await products.count();

    console.log("Products Found:", count);

    addStep(
      "TC004",
      "Verify Products",
      "Verify products appear",
      "Products should display",
      `${count} Products`,
      count > 0 ? "passed" : "failed"
    );

    // =============================
    // Screenshot
    // =============================

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
      "Screenshot",
      "Capture screenshot",
      "Screenshot saved",
      screenshotName,
      "passed"
    );

    testInfo.annotations.push({
      type: "steps",
      description: JSON.stringify(testSteps),
    });

    console.log("Search Test Completed Successfully");
  }
);