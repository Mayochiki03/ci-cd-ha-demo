const http = require('http');

const PORT = 3000;
const HOST = '0.0.0.0';

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello from CI/CD build - Version V2\n');
});

server.listen(PORT, HOST, () => {
  console.log(`Server running on port ${PORT}`);
});

