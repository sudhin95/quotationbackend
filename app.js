const express = require("express");
var session = require('express-session')
const logger = require('./src/logger/dailyLogger')
const cookieParser = require('cookie-parser')
const compression = require('compression');
const cors = require('cors');
const multer = require("multer");

const upload = multer();
//const helmet = require('helmet')
const app = express();
// logger.debug("Configuring namespaceSession");
var createNamespace = require('cls-hooked').createNamespace;
var namespaceSession = createNamespace('auth-middleware-namespace');
app.use((_, __, next) => {
  namespaceSession.run(function () {
    next();
  })
});
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

logger.debug("Adding compression");
// gzip compression middleware to improve application performance.
app.use(compression())
logger.debug("Configuring event emitter listeners.");
require('events').EventEmitter.prototype._maxListeners = 0;
// Parsers for POST data
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

const port = 5200
const loginRouter = require('./src/routes/login.route');


app.use(express.static("webroot"));
app.use('/api/v1/login', loginRouter);



app.all('/', function (req, res) {
  res.json({ message: "Welcome to Bahrain Local Search APIs" });
});
app.listen(port, () => {
  // console.log(`Server is running on port  ${port}`);
});

