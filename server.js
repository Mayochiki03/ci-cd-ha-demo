const http = require("http");

const PORT = 3000;
const HOST = "0.0.0.0";

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });

  message = "Hello from BUG version\n"; //ไม่มี const / let
  res.end(message);
});

server.listen(PORT, HOST, () => {
  console.log(`Server running on port ${PORT}`);
});
