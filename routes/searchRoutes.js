const express = require('express');
const router = express.Router();

const {
    runSearchTest,
    getAllResults
} = require('../controllers/searchController');

// Run Search Test
router.post('/run', runSearchTest);

// Get All Search Test Results
router.get('/results', getAllResults);
console.log("searchTest Loaded");

module.exports = router;