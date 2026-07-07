const mongoose = require("mongoose");

// ==========================
// Test Case Schema
// ==========================
const testSchema = new mongoose.Schema({

    id: {
        type: String
    },

    module: {
        type: String
    },

    title: {
        type: String
    },

    description: {
        type: String
    },

    expectedResult: {
        type: String
    },

    actualResult: {
        type: String
    },

    browser: {
        type: String
    },

    status: {
        type: String
    },

    date: {
        type: String
    },

    time: {
        type: String
    },

    duration: {
        type: Number
    },

    file: {
        type: String
    },

    line: {
        type: Number
    },

    column: {
        type: Number
    },

    error: {
        type: String,
        default: null
    }

}, { _id: false });


// ==========================
// Report Schema
// ==========================
const reportSchema = new mongoose.Schema({

    generatedAt: {
        type: Date
    },

    summary: {

        total: {
            type: Number
        },

        passed: {
            type: Number
        },

        failed: {
            type: Number
        },

        skipped: {
            type: Number
        },

        totalDuration: {
            type: Number
        }

    },

    tests: [testSchema]

}, { _id: false });


// ==========================
// Main Test Result Schema
// ==========================
const testResultSchema = new mongoose.Schema({

    testName: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["PASSED", "FAILED"],
        required: true
    },

    output: {
        type: String
    },

    screenshots: [{
        type: String
    }],

    executionTime: {
        type: Number
    },

    report: reportSchema,

    executedAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("TestResult", testResultSchema);