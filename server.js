const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = 3000;
const HOST = "0.0.0.0";

// serve static files
function serveStatic(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Internal Server Error");
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
}

const server = http.createServer((req, res) => {
  // API สำหรับ load balance test
  if (req.url === "/api/whoami") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        server: os.hostname(),
        time: new Date().toISOString(),
      }),
    );
  }

  // routing static
  if (req.url === "/" || req.url === "/index.html") {
    return serveStatic(res, "./public/index.html", "text/html");
  }

  if (req.url === "/style.css") {
    return serveStatic(res, "./public/style.css", "text/css");
  }

  if (req.url === "/app.js") {
    return serveStatic(res, "./public/app.js", "application/javascript");
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
