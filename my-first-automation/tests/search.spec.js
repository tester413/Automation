const { test, expect } = require('@playwright/test');
const searchData = require('../test-data/searchData.json');
const fs = require('fs');
const path = require('path');

const testSteps = [];

// =========================
// Add Test Step
// =========================
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
        time: now.toLocaleTimeString()
    });

}

const testCase = {
    id: "TC001",
    module: "Search",
    title: "Search Product",
    description: "Verify search functionality",
    expectedResult: "Matching products should be displayed",
    browser: "chromium"
};

test(
    `${testCase.id} | ${testCase.module} | ${testCase.title}`,
    async ({ page, browserName }, testInfo) => {

        // Clear previous execution steps
        testSteps.length = 0;

        // Metadata
        testInfo.annotations.push({
            type: "metadata",
            description: JSON.stringify({
                ...testCase,
                browser: browserName
            })
        });

        // =========================
        // Homepage
        // =========================

        let startTime = Date.now();

        await page.goto("https://crowcrowcrow.com/", {
            waitUntil: "networkidle"
        });

        let endTime = Date.now();

        console.log(`🏠 Homepage Load Time: ${endTime - startTime} ms`);

        addStep(
            "TC001",
            "Homepage Loads Successfully",
            "Verify homepage loads successfully.",
            "Homepage should load successfully.",
            "Homepage loaded successfully.",
            "passed"
        );

        // =========================
        // Search Box
        // =========================

        const searchBox = page.locator(
            "input[placeholder='Search USA products...']"
        );

        await expect(searchBox).toBeVisible({
            timeout: 30000
        });

        addStep(
            "TC002",
            "Search Box is Visible",
            "Verify search textbox is visible.",
            "Search textbox should be visible.",
            "Search textbox is visible.",
            "passed"
        );

        await searchBox.fill(searchData.searchText);

        addStep(
            "TC003",
            "Enter Search Keyword",
            "Verify user enters keyword.",
            "Keyword should be entered successfully.",
            `Keyword "${searchData.searchText}" entered successfully.`,
            "passed"
        );

        // =========================
        // Search Button
        // =========================

        const searchButton = page.locator(
            "button[aria-label='Search'][type='submit']"
        );

        await expect(searchButton).toBeVisible();

        addStep(
            "TC004",
            "Search Button is Visible",
            "Verify search button is visible.",
            "Search button should be visible.",
            "Search button is visible.",
            "passed"
        );

        // =========================
        // Click Search
        // =========================

        startTime = Date.now();

        await Promise.all([
            page.waitForLoadState("networkidle"),
            searchButton.click()
        ]);

        endTime = Date.now();

        console.log(`🔍 Search Results Load Time: ${endTime - startTime} ms`);

        addStep(
            "TC005",
            "Click Search Button",
            "Verify search button click.",
            "Search request should be submitted.",
            "Search button clicked successfully.",
            "passed"
        );

        // =========================
        // Verify URL
        // =========================

        await expect(page).toHaveURL(/search/i);

        addStep(
            "TC006",
            "Navigate to Search Results",
            "Verify search results page.",
            "Search page should open successfully.",
            `Navigated to ${page.url()}.`,
            "passed"
        );

        // =========================
        // Verify Products
        // =========================

        const products = page.locator(
            ".product-card, [data-testid='product-card']"
        );

        const productCount = await products.count();

        console.log("Products Found:", productCount);

        addStep(
            "TC007",
            "Verify Search Results",
            "Verify products are displayed.",
            "At least one product should be displayed.",
            `${productCount} product(s) displayed.`,
            productCount > 0 ? "passed" : "failed"
        );

        // =========================
        // Screenshot
        // =========================

        const screenshotDir = path.join(
            process.cwd(),
            "screenshots"
        );

        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, {
                recursive: true
            });
        }

        const screenshotName = `search-${Date.now()}.png`;

        await page.screenshot({
            path: path.join(screenshotDir, screenshotName),
            fullPage: true
        });

        console.log(`SCREENSHOT_NAME=${screenshotName}`);

        addStep(
            "TC008",
            "Capture Screenshot",
            "Capture execution screenshot.",
            "Screenshot should be saved successfully.",
            `Screenshot saved as ${screenshotName}.`,
            "passed"
        );

        console.log("Search Test Completed Successfully");

        // Send steps to reporter
        testInfo.annotations.push({
            type: "steps",
            description: JSON.stringify(testSteps)
        });

    }
);