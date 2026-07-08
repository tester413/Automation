const express = require("express");
const router = express.Router();

const {
  runProfileTest,
  getAllResults,
} = require("../controllers/testController");

router.post("/run-profile-test", runProfileTest);
router.get("/results", getAllResults);

module.exports = router;