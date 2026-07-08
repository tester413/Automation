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
  "npx playwright test tests/search.spec.js --project=chromium";

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

    // Create test-data folder
    const testDataDir = path.join(
      PLAYWRIGHT_ROOT,
      "test-data"
    );

    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, {
        recursive: true,
      });
    }

    // Save search text
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

    console.log("Search Data Saved:", dataFile);

    const startTime = Date.now();

    console.log("PLAYWRIGHT_ROOT:", PLAYWRIGHT_ROOT);
    console.log(
      "PLAYWRIGHT_BROWSERS_PATH:",
      process.env.PLAYWRIGHT_BROWSERS_PATH
    );

    console.log("Starting Playwright...");
    console.log("Command:", PLAYWRIGHT_COMMAND);

    const child = exec(
      PLAYWRIGHT_COMMAND,
      {
        cwd: PLAYWRIGHT_ROOT,
        maxBuffer: 1024 * 1024 * 20,
        env: {
          ...process.env,
          PLAYWRIGHT_BROWSERS_PATH: "0",
        },
      },
      async (error, stdout, stderr) => {
        console.log("Playwright callback reached");

        try {
          const executionTime = Number(
            ((Date.now() - startTime) / 1000).toFixed(2)
          );

          console.log("ERROR:", error);
          console.log("STDOUT:", stdout);
          console.log("STDERR:", stderr);

          // ==========================
          // Read Screenshots
          // ==========================

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

          // ==========================
          // Read Report
          // ==========================

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

          // ==========================
          // Save Result
          // ==========================

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
          console.error("DB ERROR:", dbError);

          return res.status(500).json({
            success: false,
            message: dbError.message,
          });
        }
      }
    );

    // Live logs
    child.stdout.on("data", (data) => {
      console.log("[PW]", data.toString());
    });

    child.stderr.on("data", (data) => {
      console.error("[PW ERROR]", data.toString());
    });

    child.on("close", (code) => {
      console.log("Playwright exited with code:", code);
    });

    child.on("error", (err) => {
      console.error("Spawn Error:", err);
    });

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