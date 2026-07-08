const { exec } = require("child_process");
const TestResult = require("../models/TestResult");
const fs = require("fs");
const path = require("path");

// =========================
// Base URL
// =========================
const BASE_URL =
  process.env.BASE_URL ||
  `http://localhost:${process.env.PORT || 5000}`;

const PROJECT_ROOT = process.cwd();

// Playwright project folder
const PLAYWRIGHT_ROOT = path.join(
  PROJECT_ROOT,
  "my-first-automation"
);

// Windows / Linux command
const PLAYWRIGHT_COMMAND =
  process.platform === "win32"
    ? "npx playwright test tests/news.spec.js --reporter=line"
    : "./node_modules/.bin/playwright test tests/news.spec.js --reporter=line";

const runNewsTest = async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // =========================
    // Save Test Data
    // =========================

    const dataDir = path.join(
      PLAYWRIGHT_ROOT,
      "test-data"
    );

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, {
        recursive: true,
      });
    }

    const dataFilePath = path.join(
      dataDir,
      "newsData.json"
    );

    fs.writeFileSync(
      dataFilePath,
      JSON.stringify({ email }, null, 2)
    );

    console.log("NEWS DATA SAVED:", dataFilePath);

    console.log("PLAYWRIGHT_ROOT:", PLAYWRIGHT_ROOT);

    console.log(
      "Config exists:",
      fs.existsSync(
        path.join(
          PLAYWRIGHT_ROOT,
          "playwright.config.js"
        )
      )
    );

    console.log(
      "Test exists:",
      fs.existsSync(
        path.join(
          PLAYWRIGHT_ROOT,
          "tests",
          "news.spec.js"
        )
      )
    );

    console.log(
      "Auth exists:",
      fs.existsSync(
        path.join(
          PLAYWRIGHT_ROOT,
          "auth",
          "auth.json"
        )
      )
    );

    const startTime = Date.now();

    exec(
      PLAYWRIGHT_COMMAND,
      {
        cwd: PLAYWRIGHT_ROOT,
        maxBuffer: 1024 * 1024 * 20,
      },
      async (error, stdout, stderr) => {
        try {
          const executionTime = Number(
            (
              (Date.now() - startTime) /
              1000
            ).toFixed(2)
          );

          // =========================
          // Read screenshots.json
          // =========================

          const screenshotsJson = path.join(
            PLAYWRIGHT_ROOT,
            "screenshots",
            "screenshots.json"
          );

          let screenshots = [];

          if (fs.existsSync(screenshotsJson)) {
            const files = JSON.parse(
              fs.readFileSync(
                screenshotsJson,
                "utf8"
              )
            );

            screenshots = files.map(
              (file) =>
                `${BASE_URL}/screenshots/${encodeURIComponent(
                  file
                )}`
            );
          }

          console.log("Screenshots:", screenshots);

          // =========================
          // Read report.json
          // =========================

          let report = null;

          const reportPath = path.join(
            PLAYWRIGHT_ROOT,
            "reports",
            "report.json"
          );

          if (fs.existsSync(reportPath)) {
            report = JSON.parse(
              fs.readFileSync(
                reportPath,
                "utf8"
              )
            );
          }

          const resultData = {
            testName: "Newsletter Test",
            status: error ? "FAILED" : "PASSED",
            output: error
              ? stderr || stdout || error.message
              : stdout,
            executionTime,
            screenshots,
            report,
          };

          const savedResult =
            await TestResult.create(resultData);

          console.log("========== PLAYWRIGHT ==========");
          console.log("ERROR:", error);
          console.log("STDOUT:\n", stdout);
          console.log("STDERR:\n", stderr);
          console.log("===============================");

          if (error) {
            return res.status(500).json({
              success: false,
              message: "Newsletter Test Failed",
              email,
              executionTime,
              screenshots,
              stdout,
              stderr,
              result: savedResult,
            });
          }

          return res.status(200).json({
            success: true,
            message: "Newsletter Test Passed",
            email,
            executionTime,
            screenshots,
            stdout,
            result: savedResult,
          });
        } catch (dbError) {
          console.error("DATABASE ERROR:", dbError);

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

const getNewsResults = async (req, res) => {
  try {
    const results = await TestResult.find({
      testName: "Newsletter Test",
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
  runNewsTest,
  getNewsResults,
};