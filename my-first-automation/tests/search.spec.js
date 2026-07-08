const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");


// =====================================
// Read Latest Search Data
// Avoid require cache issue
// =====================================

const searchDataPath = path.join(
  __dirname,
  "../test-data/searchData.json"
);

const searchData = JSON.parse(
  fs.readFileSync(searchDataPath, "utf8")
);


// =====================================
// Test Steps
// =====================================

const testSteps = [];


function addStep(
  id,
  title,
  description,
  expectedResult,
  actualResult,
  status
) {

  const now = new Date();

  testSteps.push({

    id,
    title,
    description,
    expectedResult,
    actualResult,
    status,
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString()

  });

}


// =====================================
// Test Case Metadata
// =====================================

const testCase = {

  id: "TC001",
  module: "Search",
  title: "Search Product",
  description: "Verify search functionality",
  expectedResult:
    "Search page should open successfully",
  browser: "chromium"

};



// =====================================
// Test
// =====================================


test(
`${testCase.id} | ${testCase.module} | ${testCase.title}`,

async ({ page, browserName }, testInfo)=>{


testSteps.length = 0;



// Metadata

testInfo.annotations.push({

type:"metadata",

description:JSON.stringify({

...testCase,
browser:browserName,
searchText:searchData.searchText

})

});



// =====================================
// Log Search Keyword
// =====================================


console.log(
"Searching Product:",
searchData.searchText
);



if(!searchData.searchText){

throw new Error(
"Search text is empty"
);

}



// =====================================
// Open Website
// =====================================


let startTime = Date.now();



await page.goto(
"https://crowcrowcrow.com/",
{
waitUntil:"domcontentloaded",
timeout:60000
}
);



let endTime = Date.now();



console.log(
`🏠 Homepage Load Time: ${endTime-startTime} ms`
);



addStep(

"TC001",

"Homepage Loaded",

"Open website homepage",

"Homepage should open",

"Homepage opened successfully",

"passed"

);



// =====================================
// Search Box
// =====================================


console.log(
"Waiting for search box..."
);



const searchBox =
page.locator(
"input[placeholder='Search USA products...']"
);



await expect(searchBox)
.toBeVisible({

timeout:30000

});



console.log(
"Search box found"
);


console.log("Clicking search box...");
await searchBox.click();

console.log("Clearing search box...");
await searchBox.clear();

console.log("Filling search box...");
await searchBox.click();

await searchBox.fill("");

await searchBox.type(searchData.searchText, {
  delay: 120,
});

await expect(searchBox).toHaveValue(searchData.searchText);

console.log("Search text entered");

console.log("Text entered:", searchData.searchText);



addStep(

"TC002",

"Enter Search Text",

"Enter product keyword",

"Keyword should be entered",

`${searchData.searchText} entered`,

"passed"

);



// =====================================
// Search Button
// =====================================



// =====================================
// Execute Search
// =====================================

// =====================================
// Execute Search
// =====================================

startTime = Date.now();

console.log("Waiting for search button...");

const searchButton = page.locator(
  "button[aria-label='Search'][type='submit']"
);

await expect(searchButton).toBeVisible({
  timeout: 30000,
});

console.log("Clicking search button...");

await searchButton.click();

// Wait for URL to change
await page.waitForURL(
  url => url.toString().includes("/search"),
  {
    timeout: 60000,
  }
);

// Wait for page loading
await page.waitForLoadState("domcontentloaded");
await page.waitForTimeout(3000);

endTime = Date.now();

console.log(
  `🔍 Search Results Load Time: ${endTime - startTime} ms`
);

console.log("Current URL:", page.url());

addStep(
  "TC003",
  "Click Search Button",
  "Click Search button",
  "Search page should open",
  page.url(),
  "passed"
);

// =====================================
// Verify Search Results
// =====================================

const products = page.locator(
  "a[href*='/product'], a[href*='/products']"
);

const productCount = await products.count();

console.log("Products Found:", productCount);

addStep(
  "TC004",
  "Verify Search Results",
  "Verify products are displayed",
  "Products should be displayed",
  `${productCount} product(s) displayed`,
  productCount > 0 ? "passed" : "failed"
);


// =====================================
// Screenshot
// =====================================


const screenshotDir =
path.join(
process.cwd(),
"screenshots"
);



if(!fs.existsSync(screenshotDir)){

fs.mkdirSync(
screenshotDir,
{
recursive:true
}
);

}



const screenshotName =
`search-${Date.now()}.png`;



await page.screenshot({

path:path.join(
screenshotDir,
screenshotName
),

fullPage:true

});



console.log(
"Screenshot:",
screenshotName
);



addStep(

"TC005",

"Capture Screenshot",

"Capture final page",

"Screenshot saved",

screenshotName,

"passed"

);



// =====================================
// Final
// =====================================



console.log(
"Search Test Completed Successfully"
);



testInfo.annotations.push({

type:"steps",

description:
JSON.stringify(testSteps)

});



}

);