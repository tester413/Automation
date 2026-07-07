const express = require('express');
const router = express.Router();

const { getAllResults } = require('../controllers/allController');

router.get('/results', getAllResults);

module.exports = router;