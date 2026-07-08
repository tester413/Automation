const { exec } = require("child_process");
const TestResult = require("../models/TestResult");
const fs = require("fs");
const path = require("path");

// =====================================
// Configuration
// =====================================

const BASE_URL =
  process.env.BASE_URL || "http://localhost:5000";

const PLAYWRIGHT_ROOT = path.join(
  process.cwd(),
  "my-first-automation"
);

const PLAYWRIGHT_COMMAND =
  process.platform === "win32"
    ? "npx playwright test tests/search.spec.js --project=chromium"
    : "npx playwright test tests/search.spec.js --project=chromium";

// =====================================
// Run Search Test
// =====================================

const runSearchTest = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { searchText } = req.body;

    if (!searchText) {
      return res.status(400).json({
        success: false,
        message: "searchText is required",
      });
    }

    // =====================================
    // Create test-data folder
    // =====================================

    const testDataDir = path.join(
      PLAYWRIGHT_ROOT,
      "test-data"
    );

    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, {
        recursive: true,
      });
    }

    // =====================================
    // Save JSON
    // =====================================

    const dataFile = path.join(
      testDataDir,
      "searchData.json"
    );

    fs.writeFileSync(
      dataFile,
      JSON.stringify(
        {
          searchText,
        },
        null,
        2
      )
    );

    console.log("Search Data Saved:");
    console.log(dataFile);

    const startTime = Date.now();

    exec(
      PLAYWRIGHT_COMMAND,
     exec(PLAYWRIGHT_COMMAND, {
  cwd: PLAYWRIGHT_ROOT,
  maxBuffer: 1024 * 1024 * 20,
  env: {
    ...process.env,
    PLAYWRIGHT_BROWSERS_PATH: "0",
  },
}, callback),
  
      async (error, stdout, stderr) => {
        try {
          const executionTime = Number(
            ((Date.now() - startTime) / 1000).toFixed(2)
          );

          // =====================================
          // Read screenshots
          // =====================================

          const screenshotsFile = path.join(
            PLAYWRIGHT_ROOT,
            "screenshots",
            "screenshots.json"
          );

          let screenshots = [];

          if (fs.existsSync(screenshotsFile)) {
            const files = JSON.parse(
              fs.readFileSync(screenshotsFile, "utf8")
            );

            screenshots = files.map(
              (file) =>
                `${BASE_URL}/screenshots/${encodeURIComponent(file)}`
            );
          }

          // =====================================
          // Read Report
          // =====================================

          let report = null;

          const reportPath = path.join(
            PLAYWRIGHT_ROOT,
            "reports",
            "report.json"
          );

          if (fs.existsSync(reportPath)) {
            report = JSON.parse(
              fs.readFileSync(reportPath, "utf8")
            );
          }

          const result = await TestResult.create({
            testName: "Search Test",
            status: error ? "FAILED" : "PASSED",
            output: error
              ? stderr || stdout || error.message
              : stdout,
            executionTime,
            screenshots,
            report,
          });

          if (error) {
            return res.status(500).json({
              success: false,
              message: "Search Test Failed",
              searchText,
              executionTime,
              stdout,
              stderr,
              screenshots,
              result,
            });
          }

          return res.status(200).json({
            success: true,
            message: "Search Test Passed",
            searchText,
            executionTime,
            stdout,
            screenshots,
            result,
          });
        } catch (dbError) {
          console.error(dbError);

          return res.status(500).json({
            success: false,
            message: dbError.message,
          });
        }
      }
    );
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Get Results
// =====================================

const getAllResults = async (req, res) => {
  try {
    const results = await TestResult.find({
      testName: "Search Test",
    }).sort({
      executedAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  runSearchTest,
  getAllResults,
};