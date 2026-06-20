const { clone } = require("lodash");
const CACHE_KEY_PREFIX = '__bls_cache__key__';
const __values__ = {};
let bbdCache = {
    get: function (key) {
        var val = __values__[key];
        if (!val || val && val.o && val.o.exp && val.o.exp < Date.now()) {
            return null;
        }
        return val.v;
    },
    set: function (key, value, options = { exp: Date.now() + (10 * 60 * 1000 ) }) {
        __values__[key] = { v: value, o: options };
    },
    cleanup: function () {
        let keys = clone(Object.keys(__values__));
        keys.forEach((key, index) => {
            var val = __values__[key];
            if (val && val.v && val.o && val.o.exp && val.o.exp < Date.now()) {
                console.log('Removing key from cache ', key, JSON.stringify(val), index);
                delete __values__[key];
            }
        });
        setTimeout(() => this.cleanup, 60 * 1000);
    },
    remove: function (key) {
        if (key && Object.keys(__values__).indexOf(key) >= 0) {
            delete __values__[key];
        }
      },
};
console.log("Initializing cache cleanup procedure.");
setInterval(bbdCache.cleanup, 60 * 1000);
let cachecFunction = function (req, res, next) {
    let key = CACHE_KEY_PREFIX + (req.originalUrl || req.url);
    let cachedResponse = bbdCache.get(key);
    if (cachedResponse) {
        res.send(cachedResponse);
        return;
    }
    res.sendResponseBody = res.send;
    res.send = (body) => {
        // console.log('response ', body);
        if (res.statusCode === 200) {
            bbdCache.set(key, body);
        }
        res.sendResponseBody(body);
    }
    next();
};
cachecFunction.capabilities = bbdCache;
module.exports = cachecFunction;