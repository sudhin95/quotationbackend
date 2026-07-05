const DbModel = require("../../config/db.config");
const md5 = require("md5");
const functionsClass = require("../middleware/functions");
const sendMailClass = require("../middleware/sendmail");
const authMiddleware = require("../middleware/auth");
const date = require("date-and-time");
const dateTime = require("node-datetime");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const Login = function (login) {};

Login.checkUserValid = async(postArr, result) => {
    username = postArr.username
    password = postArr.password

    const conn = DbModel.getConnectDb();

    var md5password = md5(postArr.password);
    var loginqry = `SELECT users.ID as user_id,users.sUserName as username,users.sEmail as email,users.sMobile as mobile,users.sPassword as password,users.iStatus as status FROM users WHERE users.sUserName ='${username}'`;
    conn.query(loginqry,async (err,res)=>{
        if(err){
            result(err, null);
            return;
        }else{
          console.log("res",res)
            if (!res || res.length === 0) {
                return result({ kind: "username_not_found" }, null);
            }

            const user = res[0];

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return result({ kind: "wrong_password" }, null);
            }

           
            if(user.status == 0){
              return result({ kind: "not_approved" }, null);
            }

         

            // if (user.password.trim() !== md5password) {
            //     return result({ kind: "wrong_password" }, null);
            // }

              delete user.password;
              user.userid = functionsClass.encrypt(user.user_id);

              return result(null, user);

        }

    })
}

Login.updateLoginSession = (postArr, result) => {
  console.log("fffffff")
  const conn = DbModel.getConnectDb();
  const now = new Date();
  var dtCreatedOn = date.format(now, "YYYY-MM-DD HH:mm:ss");
  postArr.dtCreatedOn = dtCreatedOn;
  conn.query(
    "INSERT INTO loginuserwisetokenauthentication SET ?",
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