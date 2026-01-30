const http = require("http");
const os = require("os");

const PORT = 3000;
const HOST = "0.0.0.0";

const server = http.createServer((req, res) => {
  try {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
      <html>
        <body style="font-family:sans-serif;text-align:center;margin-top:50px">
          <h1>CI/CD + Load Balance Demo</h1>
          <p>Response from: <b>${os.hostname()}</b></p>
        </body>
      </html>
    `);
  } catch (err) {
    res.writeHead(500);
    res.end("Internal Server Error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
