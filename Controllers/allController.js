const TestResult = require('../models/TestResult');

const getAllResults = async (req, res) => {
  try {
    const results = await TestResult.find().sort({ executedAt: -1 });

    res.status(200).json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllResults
};