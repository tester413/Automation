const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const https = require("https");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const listEndpoints = require("express-list-endpoints");

const app = express();



// =====================
// DATABASE
// =====================
connectDB();

// =====================
// MIDDLEWARE
// =====================
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

// =====================
// SCREENSHOT SERVING
// =====================
const screenshotsPath = path.join(
    process.cwd(),
    "my-first-automation",
    "screenshots"
);

console.log("📸 Serving screenshots from:");
console.log(screenshotsPath);

console.log("Folder Exists:", fs.existsSync(screenshotsPath));

if (fs.existsSync(screenshotsPath)) {
    console.log("📂 Screenshot Files:");
    console.log(fs.readdirSync(screenshotsPath));
}

app.use("/screenshots", express.static(screenshotsPath));

// Test Route (Remove later if you want)
app.get("/test-image", (req, res) => {
    const imagePath = path.join(screenshotsPath, "8-save-visible.png");

    if (fs.existsSync(imagePath)) {
        return res.sendFile(imagePath);
    }

    res.status(404).json({
        success: false,
        message: "Image not found"
    });
});

// =====================
// ROUTES
// =====================
const testRoutes = require("./routes/testRoutes");
const searchRoutes = require("./routes/searchRoutes");
const supportRoutes = require("./routes/supportRoutes");
const newsRoutes = require("./routes/newsRoutes");
const testResultRoutes = require("./routes/allRoutes");

let reportRoutes;

try {
    reportRoutes = require("./routes/reportRoutes");
    console.log("✅ reportRoutes imported successfully");
} catch (err) {
    console.error("❌ Error importing reportRoutes");
    console.error(err);
}

app.use("/api", testRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/news", newsRoutes);
app.use("/api", testResultRoutes);

if (reportRoutes) {
    app.use("/api/report", reportRoutes);
}

// =====================
// ROOT
// =====================
app.get("/", (req, res) => {
    res.send("Backend Running Successfully");
});

// =====================
// PRINT ROUTES
// =====================
console.log("\n========== REGISTERED ROUTES ==========");
console.log(listEndpoints(app));
console.log("=======================================\n");

// =====================
// 404 HANDLER
// =====================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});