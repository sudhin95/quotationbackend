const getNamespace = require('cls-hooked').getNamespace;
const namespaceSession = getNamespace('auth-middleware-namespace');
const jwt = require('jsonwebtoken');
const DbModel = require("../../config/db.config");


const authMiddleware = {};

authMiddleware.verifyToken = (req, res, next) => {
    let authHeader = req.headers.authorization;
    if (authHeader == undefined) {
        res.status(401).send({ return_message: "No valid token provided", return_status: false, return_code: 10000 })
    } else {
        var token = authHeader.split(" ").pop();
        jwt.verify(token, "BLS2026", { expiresIn: 86400 }, function (err, decoded) {
            if (err) {
                res.status(401).send({ return_message: "Authentication failed", return_status: false, return_code: 10001 })
            } else {
                authMiddleware.checkUserSessionValid(token, (errmsg, data) => {
                    if (errmsg) {
                        res.status(401).send({ return_message: "Authentication failed, Invalid token provided", return_status: false, return_code: 10002 })
                    } else {
                         authMiddleware.userId = data.userId;
                         authMiddleware.settings = data.settings;
                        next();
                    }
                });
            }
        });
    }
};

authMiddleware.checkUserSessionValid = (sLoginSessionJWT, result) => {
    const conn = DbModel.getConnectDb();
    conn.query(`SELECT bls_users.*
        FROM bls_loginuserwisetokenauthentication	          
        LEFT JOIN bls_users ON bls_users.ID = bls_loginuserwisetokenauthentication.iUserId 
        WHERE bls_loginuserwisetokenauthentication.sToken = '${sLoginSessionJWT}'  `, async (err, res) => {
        if (err) {
            result(err, null);
            return;
        }
        if (res.length) {
            var settingsArr = await getDetailsSettings();
            result(null, { userId: res[0]['ID'],settings:settingsArr[0] });
            return;
        }
        result({ data: "not_found" }, null);
    });

};
function getDetailsSettings() {
    const conn = DbModel.getConnectDb();
    return new Promise((resolve, reject) => {
        var queryString = `SELECT * FROM bls_settings WHERE  1=1`;
        conn.query(queryString, (error, results) => {
            conn.end();
            if (error) {
                return reject(error);
            }
            return resolve(results);
        });
    })
}

authMiddleware.setMyValues = (data, res, next) => {
    authMiddleware.userId = data.userId;
    authMiddleware.roleId = data.roleId;
    authMiddleware.currencyId = data.currencyId;
    authMiddleware.settings = data.settings;
};
module.exports = authMiddleware;