const fs = require("fs");
const http = require("http");
const url = require("url");

const replaceTemplate = require("./modules/replaceTemplate.js");

///////////////////////////////////////////////
// FILES

//Blocking, synchronous way
/* const textIn = fs.readFileSync("./txt/input.txt", 'utf-8');
console.log(textIn)

const textOut = `This is what we know about avocados:\n ${textIn}`
fs.writeFileSync('./txt/output.txt', textOut)
console.log('File written!') */

//Non-blockn, asynchronous
/* fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
  fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
    console.log(data2);
    fs.readFile(`./txt/append.txt`, "utf-8", (err, data3) => {
      console.log(data3);

      fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
        console.log("File has been written!");
      });
    });
  });
});
console.log("Will read file!"); */

///////////////////////////////////////////////
// SERVER

// Reads the file in the beginning so that it does not need to be sent again every time a user clicks the url
// Synchronous is ok when in top level and desirable because it is only executed once in the beggining and is not a danger to other code executing
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObj = JSON.parse(data);

// Loading the different templates
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);

// Initializing the server/Router
const server = http.createServer((req, res) => {
  // Getting the query out of the url e.g. (?id=0); true puts query in object
  // console.log(url.parse(req.url, true))
  const { query, pathname } = url.parse(req.url, true);

  //Overview
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, { "Content-type": "text/html" });

    const cardsHTML = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join("");
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHTML);

    res.end(output);

    // Product
  } else if (pathname === "/product") {
    res.writeHead(200, { "Content-type": "text/html" });
    // Retrieving the product from the dataObj based on the query object {id: 0}
    const product = dataObj[query.id];
    // Replace the placeholders in the template with the values of the retrieved product object
    const output = replaceTemplate(tempProduct, product);

    res.end(output);

    // API
  } else if (pathname === "/api") {
    res.writeHead(200, { "Content-type": "application/json" });
    res.end(data);

    // 404 Not Found
  } else {
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "hello world",
    });
    res.end("<h1>Page not found</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000");
});
