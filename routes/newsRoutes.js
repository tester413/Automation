const express = require("express");

const router = express.Router();

const {
    runNewsTest,
    getNewsResults
} = require("../controllers/newsController");

router.post("/run", runNewsTest);

router.get("/results", getNewsResults);

console.log("Hum Load Ho gaya");

module.exports = router;