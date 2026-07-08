require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const listEndpoints = require("express-list-endpoints");

const app = express();

// ==========================
// DATABASE
// ==========================
connectDB();

// ==========================
// MIDDLEWARE
// ==========================
app.use(
  cors({
    origin: "*", // Change to your frontend URL after deployment
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

// ==========================
// REQUEST LOGGER
// ==========================
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// ==========================
// SCREENSHOTS
// ==========================
const screenshotsPath = path.join(
  __dirname,
  "my-first-automation",
  "screenshots"
);

console.log("📸 Serving screenshots from:");
console.log(screenshotsPath);

console.log("Folder Exists:", fs.existsSync(screenshotsPath));

if (fs.existsSync(screenshotsPath)) {
  console.log("Files:", fs.readdirSync(screenshotsPath));
}

app.use("/screenshots", express.static(screenshotsPath));

// ==========================
// ROUTES
// ==========================
app.use("/api", require("./routes/testRoutes"));
app.use("/api/search", require("./routes/searchRoutes"));
app.use("/api/support", require("./routes/supportRoutes"));
app.use("/api/news", require("./routes/newsRoutes"));
app.use("/api", require("./routes/allRoutes"));

try {
  app.use("/api/report", require("./routes/reportRoutes"));
  console.log("✅ reportRoutes loaded");
} catch (err) {
  console.log("❌ reportRoutes not found");
}

// ==========================
// ROOT
// ==========================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Automation Backend Running",
  });
});

// ==========================
// SHOW ALL ROUTES
// ==========================
console.log("\n========== REGISTERED ROUTES ==========");
console.log(listEndpoints(app));
console.log("=======================================\n");

// ==========================
// 404
// ==========================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `${req.method} ${req.originalUrl} not found`,
  });
});

// ==========================
// START SERVER
// ==========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});