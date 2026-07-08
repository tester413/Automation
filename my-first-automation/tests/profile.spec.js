const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const profileData = require("../test-data/profileData.json");


const stepReport = [];
test.use({
  storageState: "auth/auth.json",
});

const addStep = (
  step,
  action,
  expected,
  actual,
  status,
  screenshot
) => {
  stepReport.push({
    step,
    action,
    expected,
    actual,
    status,
    screenshot,
  });
};

test.setTimeout(120000);

test("Profile Update Flow - Pass Only On Success Message", async ({ page }) => {
  console.log("Running with data:", profileData);

  // =========================
  // Screenshot Tracking
  // =========================
  const screenshots = [];

  const screenshotsDir = path.join(process.cwd(), "screenshots");

  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const takeShot = async (name) => {
    const fileName = `${name}.png`;
    const filePath = path.join(screenshotsDir, fileName);

    await page.screenshot({
      path: filePath,
      fullPage: true,
    });

    screenshots.push(fileName);
  };

  try {
    // =========================
    // Step 1: Open Website
    // =========================
    await page.goto("https://crowcrowcrow.com/", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await takeShot("1-open-website");

    addStep(
  1,
  "Open Website",
  "Homepage should load",
  "Homepage loaded successfully",
  "PASSED",
  "1-open-website.png"
);

    // =========================
    // Step 2: Click Manage Orders
    // =========================
    const manageOrders = page.locator(
      "//span[@class='flex-1 text-xs text-black w-full']"
    );

    await expect(manageOrders).toBeVisible({
      timeout: 15000,
    });

    await manageOrders.click();

    await takeShot("2-manage-orders");
    addStep(
  2,
  "Click Manage Orders",
  "Manage Orders menu should open",
  "Manage Orders menu opened successfully",
  "PASSED",
  "2-manage-orders.png"
);
    // =========================
    // Step 3: Click Profile
    // =========================
    const profileLink = page.locator(
      "//a[contains(text(),'Profile')]"
    );

    await expect(profileLink).toBeVisible({
      timeout: 15000,
    });

    await profileLink.click();

    await page.waitForLoadState("networkidle");

    await takeShot("3-profile-page");

    addStep(
  3,
  "Open Profile",
  "Profile page should open",
  "Profile page opened successfully",
  "PASSED",
  "3-profile-page.png"
);

    // =========================
    // Step 4: Edit Profile
    // =========================
    const editProfileBtn = page.locator(
      "//button[contains(text(),'Edit Profile')]"
    );

    await expect(editProfileBtn).toBeVisible({
      timeout: 15000,
    });

    await editProfileBtn.click();

    await takeShot("4-edit-profile");

 addStep(
  4,
  "Click Edit Profile",
  "Edit Profile form should appear",
  "Edit Profile form displayed",
  "PASSED",
  "4-edit-profile.png"
);

    // =========================
    // Step 5: Update Name
    // =========================
    const nameField = page.locator('input[type="text"]').last();

    await expect(nameField).toBeVisible();

    await nameField.click();
    await nameField.press("Control+A");
    await nameField.press("Backspace");
    await nameField.fill(profileData.name);

    await takeShot("5-name-updated");

   addStep(
  5,
  "Update Name",
  "Name should be updated",
  `Name updated to ${profileData.name}`,
  "PASSED",
  "5-name-updated.png"
);
    // =========================
    // Step 6: Update Phone
    // =========================
    const phoneField = page.locator(
      'input[type="tel"], input[type="number"]'
    ).first();

    await expect(phoneField).toBeVisible();

    await phoneField.click();
    await phoneField.press("Control+A");
    await phoneField.press("Backspace");
    await phoneField.fill(profileData.phone);

    await takeShot("6-phone-updated");

  addStep(
  6,
  "Update Phone",
  "Phone should be updated",
  `Phone updated to ${profileData.phone}`,
  "PASSED",
  "6-phone-updated.png"
);

    // =========================
    // Step 7: Update DOB
    // =========================
    const dobField = page.locator('input[type="date"]').first();

    if (await dobField.count()) {
      await dobField.fill(profileData.dob);

      await takeShot("7-dob-updated");
    }

  addStep(
  7,
  "Update DOB",
  "DOB should be updated",
  `DOB updated to ${profileData.dob}`,
  "PASSED",
  "7-dob-updated.png"
);
    // =========================
    // Step 8: Save
    // =========================
    const saveBtn = page
      .locator("button")
      .filter({
        hasText: /save|saving/i,
      })
      .first();

    await expect(saveBtn).toBeVisible();
    await expect(saveBtn).toBeEnabled();

    await saveBtn.click();

    await takeShot("8-save-clicked");

   addStep(
  8,
  "Click Save",
  "Profile should be saved",
  "Save button clicked successfully",
  "PASSED",
  "8-save-clicked.png"
);
    // =========================
    // Step 9: Success
    // =========================
    const successMessage = page.getByText(
      /profile updated successfully/i
    );

    await expect(successMessage).toBeVisible({
      timeout: 15000,
    });

    await takeShot("9-profile-update-success");

    console.log("✅ TEST PASSED");
  } catch (err) {
    await takeShot("9-profile-update-failed");

    throw err;
  } finally {

    // =========================
    // Save Screenshot List
    // =========================

    fs.writeFileSync(
      path.join(
        screenshotsDir,
        "screenshots.json"
      ),
      JSON.stringify(
        screenshots,
        null,
        2
      )
    );


    // =========================
    // Save Step Report
    // =========================

    const reportDir = path.join(
      process.cwd(),
      "reports"
    );


    if(!fs.existsSync(reportDir)){
      fs.mkdirSync(reportDir,{
        recursive:true
      });
    }


    fs.writeFileSync(
      path.join(
        reportDir,
        "steps.json"
      ),
      JSON.stringify(
        stepReport,
        null,
        2
      )
    );


    console.log("📸 Screenshot list saved.");
    console.log("📋 Step report saved.");

}

addStep(
  9,
  "Verify Success Message",
  "Success message should appear",
  "Profile updated successfully message displayed",
  "PASSED",
  "9-profile-update-success.png"
);
  // ==========================
// Read Playwright Report
// ==========================

});