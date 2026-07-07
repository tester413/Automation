const fs = require("fs");
const path = require("path");

class JsonReporter {

    constructor() {
        this.tests = [];
    }

    onTestEnd(test, result) {

        // =========================
        // Read metadata
        // =========================
        let metadata = {};

        const annotation = test.annotations.find(
            a => a.type === "metadata"
        );

        if (annotation) {
            try {
                metadata = JSON.parse(annotation.description);
            } catch (err) {
                console.log("Failed to parse metadata:", err.message);
            }
        }

        // =========================
        // Read Steps
        // =========================
        let steps = [];

        const stepsAnnotation = test.annotations.find(
            a => a.type === "steps"
        );

        if (stepsAnnotation) {
            try {
                steps = JSON.parse(stepsAnnotation.description);
            } catch (err) {
                console.log("Failed to parse steps:", err.message);
            }
        }

        const parts = test.title.split("|").map(x => x.trim());

        // =========================
        // Save Steps
        // =========================
        if (steps.length > 0) {

            steps.forEach(step => {

this.tests.push({

    id: step.id,

    module: metadata.module || parts[1] || "General",

    title: step.title,

    description: step.description,

    expectedResult: step.expectedResult,

    actualResult: step.actualResult,

    browser: metadata.browser || "",

    status: step.status,

    date: step.date,

    time: step.time,

    duration: result.duration,

    file: path.basename(test.location.file),

    line: test.location.line,

    column: test.location.column,

    error: result.error
        ? result.error.message
        : null

});
            });

        } else {

            // Fallback (Old Method)

            this.tests.push({

    id: metadata.id || parts[0] || "",

    module: metadata.module || parts[1] || "General",

    title: metadata.title || parts[2] || test.title,

    description: metadata.description || "",

    expectedResult: metadata.expectedResult || "",

    actualResult: metadata.actualResult || "",

    browser: metadata.browser || "",

    status: result.status,

    date: new Date().toLocaleDateString(),

    time: new Date().toLocaleTimeString(),

    duration: result.duration,

    file: path.basename(test.location.file),

    line: test.location.line,

    column: test.location.column,

    error: result.error
        ? result.error.message
        : null

});

        }

    }

    async onEnd() {

        const report = {

            generatedAt: new Date(),

            summary: {

                total: this.tests.length,

                passed: this.tests.filter(
                    t => t.status === "passed"
                ).length,

                failed: this.tests.filter(
                    t => t.status === "failed"
                ).length,

                skipped: this.tests.filter(
                    t => t.status === "skipped"
                ).length,

                totalDuration: this.tests.reduce(
                    (sum, t) => sum + (t.duration || 0),
                    0
                )

            },

            tests: this.tests

        };

        const reportDir = path.join(
            process.cwd(),
            "reports"
        );

        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, {
                recursive: true
            });
        }

        fs.writeFileSync(

            path.join(reportDir, "report.json"),

            JSON.stringify(report, null, 2)

        );

        console.log("Report Created");

    }

}

module.exports = JsonReporter;