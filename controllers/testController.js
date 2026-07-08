const { exec } = require("child_process");
const TestResult = require("../models/TestResult");
const fs = require("fs");
const path = require("path");

// =============================
// Configuration
// =============================
const BASE_URL =
  process.env.BASE_URL ||
  `http://localhost:${process.env.PORT || 5000}`;

const PLAYWRIGHT_ROOT = path.join(
  process.cwd(),
  "my-first-automation"
);

// Windows / Linux command
const PLAYWRIGHT_COMMAND =
  process.platform === "win32"
    ? "npx playwright test tests/profile.spec.js --project=chromium"
    : "npx playwright test tests/profile.spec.js --project=chromium";

// =============================
// Run Profile Test
// =============================
const runProfileTest = async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);

    const { name, phone, dob } = req.body;

    if (!name || !phone || !dob) {
      return res.status(400).json({
        success: false,
        message: "name, phone and dob are required",
      });
    }

    // =============================
    // Save Test Data
    // =============================
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
      "profileData.json"
    );

    fs.writeFileSync(
      dataFilePath,
      JSON.stringify(
        {
          name,
          phone,
          dob,
        },
        null,
        2
      )
    );

    console.log("PROFILE DATA SAVED");

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
            ((Date.now() - startTime) / 1000).toFixed(2)
          );

          // =============================
          // Read screenshots.json
          // =============================
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
                `${BASE_URL}/screenshots/${encodeURIComponent(file)}`
            );
          }

          // =============================
          // Read report.json
          // =============================

          // =============================
// Read steps.json
// =============================

let steps = [];

const stepsPath = path.join(
  PLAYWRIGHT_ROOT,
  "reports",
  "steps.json"
);


if (fs.existsSync(stepsPath)) {

  steps = JSON.parse(
    fs.readFileSync(
      stepsPath,
      "utf8"
    )
  );

}
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

          // =============================
          // Save Result
          // =============================
          const resultData = {

    testName: "Profile Update Test",

    status: error 
      ? "FAILED" 
      : "PASSED",


    testData:{
      name,
      phone,
      dob
    },


    steps,   // 👈 Add this


    output: error
      ? stderr || stdout || error.message
      : stdout,


    executionTime,

    screenshots,

    report,

};

          const savedResult =
            await TestResult.create(resultData);

          console.log("========== PROFILE TEST ==========");
          console.log("ERROR:", error);
          console.log("STDOUT:", stdout);
          console.log("STDERR:", stderr);
          console.log("==================================");

          if (error) {
            return res.status(500).json({
              success: false,
              message: "Profile Test Failed",
              name,
              phone,
              dob,
              executionTime,
              screenshots,
              stdout,
              stderr,
              result: savedResult,
            });
          }

          return res.status(200).json({
            success: true,
            message: "Profile Test Passed",
            name,
            phone,
            dob,
            executionTime,
            screenshots,
            stdout,
            result: savedResult,
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

// =============================
// Get All Results
// =============================
const getAllResults = async (req, res) => {
  try {
    const results = await TestResult.find({
      testName: "Profile Update Test",
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

// =============================
// Export
// =============================
module.exports = {
  runProfileTest,
  getAllResults,
};