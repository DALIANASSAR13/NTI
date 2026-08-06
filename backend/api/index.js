const app = require('../src/server');
const connectDB = require('../src/config/db');

// Connect to DB on cold start
connectDB();

module.exports = app;
