const { exec } = require("child_process");
const TestResult = require("../models/TestResult");
const fs = require("fs");
const path = require("path");

const runSearchTest = async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);

    const { searchText } = req.body;

    if (!searchText) {
      return res.status(400).json({
        success: false,
        message: "searchText is required",
      });
    }

    // Save test data
    const dataFilePath = path.join(
      "C:/Users/CPuser/CCC/my-first-automation",
      "test-data",
      "searchData.json"
    );

    fs.writeFileSync(
      dataFilePath,
      JSON.stringify({ searchText }, null, 2)
    );

    console.log("SEARCH DATA SAVED");

    const startTime = Date.now();

    exec(
      "npx playwright test tests/search.spec.js --project=chromium",
      {
        cwd: "C:/Users/CPuser/CCC/my-first-automation",
      },
      async (error, stdout, stderr) => {
        try {

          // ⭐ NEW - Read Playwright JSON Report
          const reportPath = path.join(
            "C:/Users/CPuser/CCC/my-first-automation",
            "reports",
            "report.json"
          );

          let report = null;

          if (fs.existsSync(reportPath)) {
            report = JSON.parse(
              fs.readFileSync(reportPath, "utf8")
            );
          }

          console.log("========== PLAYWRIGHT REPORT ==========");
          console.log(JSON.stringify(report, null, 2));

          const executionTime = Number(
            ((Date.now() - startTime) / 1000).toFixed(2)
          );

          console.log("========== PLAYWRIGHT STDOUT ==========");
          console.log(stdout);

          console.log("========== PLAYWRIGHT STDERR ==========");
          console.log(stderr);

          let screenshot = null;

          // Match screenshot filename
          const match = stdout.match(/SCREENSHOT_NAME=(.+\.png)/);

          console.log("MATCH =>", match);

          if (match && match[1]) {
            screenshot = `http://localhost:5000/screenshots/${match[1].trim()}`;
          }

          console.log("SCREENSHOT URL =>", screenshot);

          // ⭐ NEW - Use report title if available
          const testName =
            report?.tests?.[0]?.title || "Search Test";

          const resultData = {
            testName,
            status: error ? "FAILED" : "PASSED",
            output: error ? (stderr || stdout) : stdout,
            executionTime,
            screenshots: screenshot ? [screenshot] : [],

            // ⭐ Save full report
            report
          };

          console.log("========== DATA TO SAVE ==========");
          console.log(JSON.stringify(resultData, null, 2));

          const savedResult = await TestResult.create(resultData);

          console.log("========== SAVED RESULT ==========");
          console.log(savedResult);

          if (error) {
            return res.status(500).json({
              success: false,
              message: "Search Test Failed",
              stdout,
              stderr,
              screenshot,
              result: savedResult,
            });
          }

          return res.status(200).json({
            success: true,
            message: "Search Test Passed",
            executionTime,
            screenshot,
            stdout,
            report, // ⭐ Return report to frontend
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

const getAllResults = async (req, res) => {
  try {
    const results = await TestResult.find().sort({ executedAt: -1 });

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