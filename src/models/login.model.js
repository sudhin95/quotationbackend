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

// Login.getRegisterUser = async (postArr, result) => {
//   const conn = DbModel.getConnectDb();
//   var insertArr=[];
//   insertArr.sFirstName = postArr.firstName;
//   insertArr.sLastName = postArr.lastName;
//   insertArr.sEmail = postArr.email;
//   insertArr.sMobile = postArr.phone;
//   insertArr.sUserName = postArr.username;
//   insertArr.sPassword = md5(postArr.password);
//   const hash = await bcrypt.hash(postArr.password, saltRounds);
//   insertArr.sEncPassword = hash; 
//   const now = new Date();
//   var dtCreatedOn = date.format(now, "YYYY-MM-DD HH:mm:ss");
//   insertArr.dtCreatedOn = dtCreatedOn;
//   insertArr.iUserType = 2; // or whatever default user type you want to set
//   insertArr.iStatus = 0; // or whatever default status you want to set
//   insertArr.dtRegisteredOn = dtCreatedOn;

//   const sDisplayName = insertArr.sFirstName + ' ' + insertArr.sLastName;

//   var checkExist = await checkExistUser(conn,postArr);

//   if(checkExist > 0){ 
//     return result({ kind: "already_exist" }, null);
//   } else{

//      const sql = `
//       INSERT INTO bls_users 
//       (sFirstName, sLastName, sDisplayName, sEmail, sMobile, sUserName, sPassword, sEncPassword, dtCreatedOn, iUserType, iStatus, dtRegisteredOn)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//       `;
//     const values = [
//       insertArr.sFirstName,
//       insertArr.sLastName,
//       sDisplayName, 
//       insertArr.sEmail,
//       insertArr.sMobile,
//       insertArr.sUserName,
//       insertArr.sPassword,
//       insertArr.sEncPassword,
//       insertArr.dtCreatedOn,
//       insertArr.iUserType,
//       insertArr.iStatus,
//       insertArr.dtRegisteredOn
//     ];
//   conn.query(sql ,values ,async (err, res) => {
//       conn.end();
//       if (err) {
//         console.log("error: ", err);
//         result(err, null);
//         return;
//       }
//       if(res){
//           let credentials = {
//             mail_host: 'mail-eu.smtp2go.com',
//             smtp_username: 'bahrainlocalsearch.com',
//             smtp_password: 'PHX62CqCf3SSCzyo',
//             smtp_port: 2525,
//             smtp_security: 'tls',
//             from_name: 'BLS',
//             from_email: 'info@bahrainlocalsearch.com',
//           };
//           var mailSend = await sendMailClass.sendemail(credentials);
         
//           if(mailSend.accepted && mailSend.accepted.length > 0){
//             result(null,{kind:"success",body:res});
//             return;
//           }else{
//             result(null,{kind:"partial_success",body:res});
//             return;
//           }
//       }
//     });
//   }
// }

// function checkExistUser(conn,postArr){
//   var qry = `SELECT COUNT(ID) AS count FROM bls_users WHERE sUserName = '${postArr.username}' OR sEmail = '${postArr.email}' OR sMobile = '${postArr.phone}'`;  
//     return new Promise((resolve, reject) => {
//       conn.query(qry, (err, res) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(res[0].count);
//         }
//       });
//   });
// }


module.exports = Login;