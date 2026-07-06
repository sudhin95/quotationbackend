// This file exists only as an entry point. All server setup, middleware,
// routes, and app.listen() live in app.js — requiring it here is enough
// to start the server. Do NOT create a second http.createServer() here;
// that was starting a second, unused server on a hardcoded port
// alongside the real Express app, which served no purpose.

require('./app');