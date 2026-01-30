const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = 3000;
const HOST = "0.0.0.0";

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    const html = fs.readFileSync(path.join(__dirname, "public/index.html"));
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
    return;
  }

  if (req.url === "/style.css") {
    const css = fs.readFileSync(path.join(__dirname, "public/style.css"));
    res.writeHead(200, { "Content-Type": "text/css" });
    res.end(css);
    return;
  }

  if (req.url === "/api/server") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(`Host: ${os.hostname()}`);
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
