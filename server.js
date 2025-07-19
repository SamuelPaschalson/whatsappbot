const http = require("http");
const api = require('./api');

const port = process.env.PORT || 5000;

const server = http.createServer(api)

server.listen(port);