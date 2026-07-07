const fs = require("fs");
const path = require("path");

const downloadReport = async (req, res) => {

    try {

        const reportPath = path.join(
            "C:/Users/CPuser/CCC/my-first-automation",
            "reports",
            "report.json"
        );

        if (!fs.existsSync(reportPath)) {
            return res.status(404).send("Report not found");
        }

        const report = JSON.parse(
            fs.readFileSync(reportPath, "utf8")
        );

        const html = `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>Playwright Automation Report</title>

<style>

body{
font-family:Arial;
padding:30px;
background:#f5f5f5;
}

h1{
color:#2563eb;
}

.summary{
display:flex;
gap:20px;
margin-bottom:20px;
}

.card{
background:white;
padding:15px;
border-radius:10px;
box-shadow:0 2px 5px rgba(0,0,0,.1);
}

table{
width:100%;
border-collapse:collapse;
background:white;
}

th,td{
border:1px solid #ddd;
padding:10px;
text-align:left;
}

th{
background:#2563eb;
color:white;
}

.pass{
color:green;
font-weight:bold;
}

.fail{
color:red;
font-weight:bold;
}

</style>

</head>

<body>

<h1>Playwright Automation Report</h1>

<p><b>Generated:</b> ${new Date(report.generatedAt).toLocaleString()}</p>

<div class="summary">

<div class="card">
<b>Total</b><br>
${report.summary.total}
</div>

<div class="card">
<b>Passed</b><br>
${report.summary.passed}
</div>

<div class="card">
<b>Failed</b><br>
${report.summary.failed}
</div>

<div class="card">
<b>Skipped</b><br>
${report.summary.skipped}
</div>

</div>

<table>

<tr>

<th>ID</th>
<th>Module</th>
<th>Title</th>
<th>Description</th>
<th>Expected</th>
<th>Actual</th>
<th>Browser</th>
<th>Status</th>
<th>Date</th>
<th>Time</th>
<th>Duration</th>

</tr>

${report.tests.map(test=>`

<tr>

<td>${test.id}</td>

<td>${test.module}</td>

<td>${test.title}</td>

<td>${test.description}</td>

<td>${test.expectedResult}</td>

<td>${test.actualResult}</td>

<td>${test.browser}</td>

<td class="${test.status==="passed"?"pass":"fail"}">
${test.status.toUpperCase()}
</td>

<td>${test.date}</td>

<td>${test.time}</td>

<td>${test.duration} ms</td>

</tr>

`).join("")}

</table>

</body>

</html>
`;

        res.setHeader(
            "Content-Type",
            "text/html"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=AutomationReport.html"
        );

        res.send(html);

    } catch (err) {

        res.status(500).send(err.message);

    }

};

module.exports = {
    downloadReport
};