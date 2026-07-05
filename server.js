  // const http = require("http");
  // const app = require('./app');

  // const server = http.createServer((req, res) => {
  //   res.writeHead(200, { "Content-Type": "text/plain" });
  //   res.end("Node app is running!");
  // });

  // server.listen(3000, () => {
  //   console.log("Server started on http://localhost:3000");
  // });

  const app = require('./app');

const PORT = process.env.PORT || 5200;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});