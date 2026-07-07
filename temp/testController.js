const { exec } = require("child_process");
const TestResult = require("../models/TestResult");
const fs = require("fs");
const path = require("path");

const runProfileTest = async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);

    const { name, phone, dob } = req.body;

    // ==========================
    // Validation
    // ==========================
    if (!name || !phone || !dob) {
      return res.status(400).json({
        success: false,
        message: "name, phone and dob are required",
      });
    }

    // ==========================
    // Update Playwright Test Data
    // ==========================
    const dataFilePath = path.join(
      "C:/Users/CPuser/CCC/my-first-automation",
      "test-data",
      "profileData.json"
    );

    fs.writeFileSync(
      dataFilePath,
      JSON.stringify({ name, phone, dob }, null, 2)
    );

    console.log("TEST DATA SAVED");

    // ==========================
    // Screenshot Folder
    // ==========================
    const screenshotsDir = path.join(
      "C:/Users/CPuser/CCC/my-first-automation",
      "screenshots"
    );

    // Remove old screenshots before running
    if (fs.existsSync(screenshotsDir)) {
      fs.readdirSync(screenshotsDir).forEach((file) => {
        if (file.endsWith(".png")) {
          fs.unlinkSync(path.join(screenshotsDir, file));
        }
      });
    }

    const startTime = Date.now();

    exec(
      "npx playwright test tests/profile.spec.js --project=chromium",
      {
        cwd: "C:/Users/CPuser/CCC/my-first-automation",
      },
      async (error, stdout, stderr) => {
        const executionTime = Number(
          ((Date.now() - startTime) / 1000).toFixed(2)
        );

        try {
          // ==========================
          // Read Screenshots
          // ==========================
         // ==========================
// Read screenshots.json
// ==========================
const screenshotsJsonPath = path.join(
  screenshotsDir,
  "screenshots.json"
);

let screenshots = [];

if (fs.existsSync(screenshotsJsonPath)) {
  const files = JSON.parse(
    fs.readFileSync(screenshotsJsonPath, "utf8")
  );

  screenshots = files.map(
    (file) =>
      `http://localhost:5000/screenshots/${encodeURIComponent(file)}`
  );
}

console.log("Screenshots Found:", screenshots);

          // ==========================
          // FAILED
          // ==========================
          if (error) {
            const failedResult = await TestResult.create({
              testName: "Profile Update Test",
              status: "FAILED",
              output: stderr || stdout || error.message,
              executionTime,
              screenshots,
            });

            return res.status(500).json({
              success: false,
              message: "Profile test failed",
              error: error.message,
              stdout,
              stderr,
              result: failedResult,
            });
          }

          // ==========================
          // PASSED
          // ==========================
          // Read report.json
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

const passedResult = await TestResult.create({
    testName: "Profile Update Test",
    status: "PASSED",
    output: stdout,
    executionTime,
    screenshots,
    report
});

          return res.status(200).json({
            success: true,
            message: "Profile test executed successfully",
            testData: {
              name,
              phone,
              dob,
            },
            stdout,
            result: passedResult,
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
  runProfileTest,
  getAllResults,
};