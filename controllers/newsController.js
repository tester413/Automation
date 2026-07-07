const { exec } = require("child_process");
const TestResult = require("../models/TestResult");
const fs = require("fs");
const path = require("path");


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

    const dataFilePath = path.join(
      "C:/Users/CPuser/CCC/my-first-automation",
      "test-data",
      "newsData.json"
    );

    fs.writeFileSync(
      dataFilePath,
      JSON.stringify({ email }, null, 2)
    );

    console.log("NEWS DATA SAVED");

    const startTime = Date.now();

    exec(
      "npx playwright test tests/news.spec.js --project=chromium",
      {
        cwd: "C:/Users/CPuser/CCC/my-first-automation",
      },
      async (error, stdout, stderr) => {
        try {
          const executionTime = Number(
            ((Date.now() - startTime) / 1000).toFixed(2)
          );
const screenshotsJson = path.join(
    "C:/Users/CPuser/CCC/my-first-automation",
    "screenshots",
    "screenshots.json"
);

let screenshots = [];

if (fs.existsSync(screenshotsJson)) {

    const files = JSON.parse(
        fs.readFileSync(screenshotsJson, "utf8")
    );

    screenshots = files.map(file =>
        `http://localhost:5000/screenshots/${encodeURIComponent(file)}`
    );
}

          console.log("SCREENSHOT URL:", screenshots);

         const resultData = {
  testName: "Newsletter Test",
  status: error ? "FAILED" : "PASSED",
  output: error ? (stderr || stdout || error.message) : stdout,
  executionTime,
  screenshots,
};

          console.log("DATA TO SAVE:");
          console.log(resultData);

          const savedResult = await TestResult.create(resultData);

          console.log("SAVED RESULT:");
          console.log(savedResult);

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