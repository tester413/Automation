const { exec } = require("child_process");
const TestResult = require("../models/TestResult");
const fs = require("fs");
const path = require("path");

const runSupportTest = async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);

    const { category, subject, description } = req.body;

    // Validation
    if (!category || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: "category, subject and description are required",
      });
    }

    // Save data for Playwright
    const dataFilePath = path.join(
      "C:/Users/CPuser/CCC/my-first-automation",
      "test-data",
      "supportData.json"
    );

    fs.writeFileSync(
      dataFilePath,
      JSON.stringify(
        {
          category,
          subject,
          description,
        },
        null,
        2
      )
    );

    console.log("SUPPORT DATA SAVED");

    const startTime = Date.now();

    exec(
      "npx playwright test tests/Support.spec.js --project=chromium",
      {
        cwd: "C:/Users/CPuser/CCC/my-first-automation",
      },
      async (error, stdout, stderr) => {
        const executionTime = Number(
          ((Date.now() - startTime) / 1000).toFixed(2)
        );

        // ================= Screenshot =================

        let screenshot = null;

        const match = stdout.match(/SCREENSHOT_NAME=(.*\.png)/);

        if (match) {
          screenshot = `http://localhost:5000/screenshots/${match[1].trim()}`;
        }

        try {
          if (error) {
            const failedResult = await TestResult.create({
              testName: "Support Test",
              status: "FAILED",
              output: stderr || stdout || error.message,
              executionTime,
            });

            return res.status(500).json({
              success: false,
              message: "Support Test Failed",
              error: error.message,
              executionTime,
              screenshot,
              stdout,
              stderr,
              result: failedResult,
            });
          }

          const passedResult = await TestResult.create({
            testName: "Support Test",
            status: "PASSED",
            output: stdout,
            executionTime,
             screenshots: screenshot ? [screenshot] : []  ,
          });

          return res.status(200).json({
            success: true,
            message: "Support test executed successfully",
            testData: {
              category,
              subject,
              description,
            },
            executionTime,
            screenshot,
            stdout,
            result: passedResult,
          });
        } catch (dbError) {
          return res.status(500).json({
            success: false,
            message: dbError.message,
          });
        }
      }
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllResults = async (req, res) => {
  try {
    const results = await TestResult.find().sort({
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
  runSupportTest,
  getAllResults,
};