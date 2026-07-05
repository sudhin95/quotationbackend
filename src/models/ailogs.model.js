const DbModel = require("../../config/db.config");
const md5 = require("md5");
const functionsClass = require("../middleware/functions");
const sendMailClass = require("../middleware/sendmail");
const authMiddleware = require("../middleware/auth");
const date = require("date-and-time");
const dateTime = require("node-datetime");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const AILogs = function (ailogs) {};

AILogs.getAllAILogs = (postArr, result) => {
    const conn = DbModel.getConnectDb();  
    var qry="SELECT ai_logs.ID as id,ai_logs.sUserRequest as request,ai_logs.sAIResponse as response,ai_logs.dtCreatedOn as createdAt,ai_logs.iQuotationAdded as quotationAdded,ai_logs.iQuotationId as quotationId FROM ai_logs ORDER BY ID DESC";
    conn.query(qry,async(err,res)=>{
        if(err){
        result(err,null);
        return;
        }
        if(res){
        if(res.length>0){
            for(let element of res){
                element.logid = functionsClass.encrypt(element.id);
                if(element.quotationAdded==1){
                    element.quotadded = "Added";
                }else{
                    element.quotadded="Not Added";
                }
                if(element.quotationId!=0){
                    element.quotationencid = functionsClass.encrypt(element.quotationId);
                     var quotnumber = await functionsClass.getNamesWithConn(
                            conn,
                            `quotations`,
                            `sQuotationNumber`,
                            `ID='${element.quotationId}'  `
                        );
                    element.quotationNumber =  quotnumber ;  
                }else{
                    element.quotationNumber =  "" ; 
                }
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

module.exports = AILogs;