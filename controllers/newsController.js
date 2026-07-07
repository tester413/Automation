const { exec } = require("child_process");
const TestResult = require("../models/TestResult");
const fs = require("fs");
const path = require("path");

const BASE_URL =
  process.env.BASE_URL || "http://localhost:5000";

const PROJECT_ROOT = process.cwd();

// Playwright project location
const PLAYWRIGHT_ROOT = path.join(PROJECT_ROOT, "my-first-automation");

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

    // ================= SAVE TEST DATA =================

   const dataDir = path.join(PLAYWRIGHT_ROOT, "test-data");

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const dataFilePath = path.join(dataDir, "newsData.json");

    fs.writeFileSync(
      dataFilePath,
      JSON.stringify({ email }, null, 2)
    );

    console.log("NEWS DATA SAVED:", dataFilePath);

    const startTime = Date.now();

    console.log("PLAYWRIGHT_ROOT:", PLAYWRIGHT_ROOT);
console.log(
  "Config exists:",
  fs.existsSync(path.join(PLAYWRIGHT_ROOT, "playwright.config.js"))
);
console.log(
  "News test exists:",
  fs.existsSync(path.join(PLAYWRIGHT_ROOT, "tests", "news.spec.js"))
);

    exec(
        "./node_modules/.bin/playwright test tests/news.spec.js --reporter=line",
      {
       cwd: PLAYWRIGHT_ROOT,
       maxBuffer: 1024 * 1024 * 20,
      },
      async (error, stdout, stderr) => {
        try {
          const executionTime = Number(
            ((Date.now() - startTime) / 1000).toFixed(2)
          );
          console.log(stdout);
    console.log(stderr);

          const screenshotsJson = path.join(
            PLAYWRIGHT_ROOT,
            "screenshots",
            "screenshots.json"
          );

          let screenshots = [];

          if (fs.existsSync(screenshotsJson)) {
            const files = JSON.parse(
              fs.readFileSync(screenshotsJson, "utf8")
            );

            screenshots = files.map(file =>
              `${BASE_URL}/screenshots/${encodeURIComponent(file)}`
            );
          }

          const resultData = {
            testName: "Newsletter Test",
            status: error ? "FAILED" : "PASSED",
            output: error
              ? (stderr || stdout || error.message)
              : stdout,
            executionTime,
            screenshots,
          };

          const savedResult = await TestResult.create(resultData);

           console.log("ERROR:", error);
console.log("STDOUT:", stdout);
console.log("STDERR:", stderr);
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