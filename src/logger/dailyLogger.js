const logger = require('./logger');
const dailyLogger = logger.createDailyRollingLogger();
module.exports = dailyLogger;