const express = require('express');
const router = express.Router();



const {
    runProfileTest,
    getAllResults
} = require('../controllers/testController');

router.post('/run-profile-test', runProfileTest);

router.get('/results', getAllResults);

console.log("Test Loaded");
module.exports = router;