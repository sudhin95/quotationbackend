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
                        next();
                    }
                });
            }
        });
    }
};

authMiddleware.checkUserSessionValid = (sLoginSessionJWT, result) => {
    const conn = DbModel.getConnectDb();
    conn.query(`SELECT users.*
        FROM loginuserwisetokenauthentication	          
        LEFT JOIN users ON users.ID = loginuserwisetokenauthentication.iUserId 
        WHERE loginuserwisetokenauthentication.sToken = '${sLoginSessionJWT}'  `, async (err, res) => {
        if (err) {
            result(err, null);
            return;
        }
        if (res.length) {
            result(null, { userId: res[0]['ID'] });
            return;
        }
        result({ data: "not_found" }, null);
    });

};


authMiddleware.setMyValues = (data, res, next) => {
    authMiddleware.userId = data.userId;

};
module.exports = authMiddleware;