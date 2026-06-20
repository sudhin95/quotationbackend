const DbModel = require("../../config/db.config");
const md5 = require("md5");
const functionsClass = require("../middleware/functions");
const authMiddleware = require("../middleware/auth");
const date = require("date-and-time");
const dateTime = require("node-datetime");
const Login = function (login) {};



Login.checkUserValid = (postArr, result) => {
    username = postArr.username
    password = postArr.password
    const conn = DbModel.getConnectDb();

    var md5password = md5(postArr.password);
    var loginqry = `SELECT bls_users.ID as user_id,bls_users.sDisplayName as name,bls_users.sEmail as email,bls_users.sMobile as mobile,bls_users.sUserName as username FROM bls_users WHERE bls_users.sUserName ='${username}' AND sPassword='${md5password}'`;
    conn.query(loginqry,(err,res)=>{
        if(err){
            result(err, null);
            return;
        }else{
            if(res && res.length>0){
                res[0].userid = functionsClass.encrypt(res[0].user_id);
                result(err, res[0]);
                return;
            }else{
                result(
                    {
                      kind: "not_found",
                    },
                    null
                  );
                // result(err, []);
                return;
                
            }
        }

    })
}

Login.updateLoginSession = (postArr, result) => {
  const conn = DbModel.getConnectDb();
  const now = new Date();
  var dtCreatedOn = date.format(now, "YYYY-MM-DD HH:mm:ss");
  postArr.dtCreatedOn = dtCreatedOn;
  conn.query(
    "INSERT INTO bls_loginuserwisetokenauthentication SET ?",
    [postArr],
    (err, res) => {
      conn.end();
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result(
          {
            kind: "not_found",
          },
          null
        );
        return;
      }
      result(null, {
        id: postArr.iUserId,
        ...postArr,
      });
    }
  );
}
Login.getAllSideMenus = (postArr, result) => {
  const conn = DbModel.getConnectDb();
  var qry="SELECT bls_featuremodules.ID,bls_featuremodules.sModuleName,bls_featuremodules.sUrl,bls_featuremodules.sIcon FROM bls_featuremodules WHERE bls_featuremodules.iStatus = 1 AND bls_featuremodules.iShowSideMenu = 1 ORDER BY bls_featuremodules.iOrder ASC"
  conn.query(qry,(err,res)=>{
    if(err){
      result(err,null);
      return;
    }
    if(res){
      if(res.length>0){
        result(null,res);
        return;
      }
    }
  })
}

module.exports = Login;