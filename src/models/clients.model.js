const DbModel = require("../../config/db.config");
const md5 = require("md5");
const functionsClass = require("../middleware/functions");
const sendMailClass = require("../middleware/sendmail");
const authMiddleware = require("../middleware/auth");
const date = require("date-and-time");
const dateTime = require("node-datetime");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const Clients = function (clients) {};

Clients.getAllClients = (postArr, result) => {
    const conn = DbModel.getConnectDb();  
    var qry="SELECT clients.ID as id,clients.sClientName as name,clients.sCompanyName as company,clients.sEmail as email,clients.sPhoneNumber as phone,clients.sNotes as notes,clients.iStatus as status,clients.dtCreatedOn as createdAt FROM clients WHERE clients.iStatus = 1 ORDER BY ID DESC";
    conn.query(qry,(err,res)=>{
        if(err){
        result(err,null);
        return;
        }
        if(res){
        if(res.length>0){
            for(let element of res){
                element.clientid = functionsClass.encrypt(element.id);
            }
            result(null,res);
            return;
        }else{
            result(null,[]);
            return;
        }
        }
    })

}

Clients.addClients = (postArr, result) => {
    const conn = DbModel.getConnectDb(); 
    const now = new Date();
    var dtCreatedOn = date.format(now, "YYYY-MM-DD HH:mm:ss");
    var sql = `INSERT INTO clients (sClientName, sCompanyName, sEmail, sPhoneNumber, sNotes, iStatus, dtCreatedOn) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    console.log("postArr",postArr)
    conn.query(sql, [postArr.name, postArr.company, postArr.email, postArr.phone, postArr.notes, 1, dtCreatedOn], (err, res) => {
        if (err) {
            result(err, null);
            return;
        }
        result(null, res);
    });
}

Clients.updateClients = (editID,postArr, result) => {
    console.log("editID", editID)
    const conn = DbModel.getConnectDb(); 
    var clientid = functionsClass.decrypt(editID);

    var sql = `UPDATE clients SET sClientName = ?, sCompanyName = ?, sEmail = ?, sPhoneNumber = ?, sNotes = ?, iStatus = ? WHERE ID = ?`;

    conn.query(sql,[
    postArr.name,
    postArr.company,
    postArr.email,
    postArr.phone,
    postArr.notes,
    1,
    clientid   // IMPORTANT: the record ID to update
  ],
  (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, res);
  }
);
}

Clients.deleteClients = (deleteID, result) => {
    const conn = DbModel.getConnectDb(); 
    var clientid = functionsClass.decrypt(deleteID);
    const sql = `DELETE FROM clients WHERE ID = ?`;
    conn.query(sql, [clientid], (err, res) => {
        if (err) {
            result(err, null);
            return;
        }
        result(null, res);
    });
}

Clients.getClientsById = (id, result) => {
    const conn = DbModel.getConnectDb();  
    var clientid = functionsClass.decrypt(id);
    var qry="SELECT clients.ID as id,clients.sClientName as name,clients.sCompanyName as company,clients.sEmail as email,clients.sPhoneNumber as phone,clients.sNotes as notes,clients.iStatus as status,clients.dtCreatedOn as createdAt FROM clients WHERE clients.ID = ?";
    conn.query(qry,[clientid],(err,res)=>{
        if(err){
        result(err,null);
        return;
        }
        if(res){
            console.log("res",res)
        if(res.length>0){
            for(let element of res){
                element.clientid = functionsClass.encrypt(element.id);
            }
            result(null,res);
            return;
        }else{
            result(null,[]);
            return;
        }
        }
    })

}


module.exports = Clients;