const express = require('express');
const router = express.Router();

const supportController = require('../controllers/supportController');

console.log("Support Controller:", supportController);

const { runSupportTest, getAllResults } = supportController;

// Run Search Test
router.post('/run', runSupportTest);

// Get All Search Test Results
router.get('/results', getAllResults);
console.log("✅ supportRoutes loaded");

module.exports = router;