const jsonStringify = require('safe-stable-stringify');
const { MESSAGE } = require('triple-beam');
const { createLogger, transports, format, config } = require('winston');
require("winston-daily-rotate-file");
class TimestampFirst {
    constructor(enabled = true) {
        this.enabled = enabled;
    }
    transform(obj) {
        if (this.enabled) {
            var ts = {
                timestamp: ''
            };
            ts = Object.assign(ts, obj);
            return ts;
        }
        return obj;
    }
}
var simpleFormat = format(info => {
    const stringifiedRest = jsonStringify(Object.assign({}, info, {
        timestamp: undefined,
        level: undefined,
        message: undefined,
        splat: undefined
    }));
    const padding = info.padding && info.padding[info.level] || '';
    if (stringifiedRest !== '{}') {
        info[MESSAGE] = `${info.timestamp} ${info.level}:${padding} ${info.message} ${stringifiedRest}`;
    } else {
        info[MESSAGE] = `${info.timestamp} ${info.level}:${padding} ${info.message}`;
    }
    return info;
});
var defaultFormat = format.combine(
    format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
    }),
    new TimestampFirst(true),
    simpleFormat()
);
const defaultFileRotateTransport = new transports.DailyRotateFile({
    filename: "logs/daily-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxFiles: "30d",
    maxSize: "100m"
});
const defaultConfiguration = {
    level: "debug",
    format: defaultFormat,
    transports: [new transports.Console()],
};
const defaultRollingConfiguration = {
    level: "debug",
    format: defaultFormat,
    transports: [defaultFileRotateTransport, new transports.Console()],
    exceptionHandlers: [
        defaultFileRotateTransport, new transports.Console()
    ],
    exitOnError: false
};
const defaultHttpConfiguration = {
    level: 'http',
    format: defaultFormat,
    transports: [new transports.Console()]
};
let logger = {};
/**
 * Following are the supported configurations.
 * 
    {
        silent,
        format,
        defaultMeta,
        levels,
        level = 'info',
        exitOnError = true,
        transports,
        colors,
        emitErrs,
        formatters,
        padLevels,
        rewriters,
        stripColors,
        exceptionHandlers,
        rejectionHandlers
    }
 * @param {config} configuration. See https://github.com/winstonjs/winston/tree/master/examples for more details
 * @returns winston logger
 */
logger.createLogger = function (configuration) {
    let c = Object.assign({}, configuration);
    let config = Object.assign(c, defaultConfiguration);
    return createLogger(config);
}
logger.createDailyRollingLogger = function (configuaration) {
    let c = Object.assign({}, configuaration);
    let config = Object.assign(c, defaultRollingConfiguration);
    var l = createLogger();
    l.configure(config);
    return l;
}
logger.http = function (configuration) {
    let c = Object.assign({}, configuration);
    return createLogger(Object.assign(c, defaultHttpConfiguration));
}
module.exports = logger;