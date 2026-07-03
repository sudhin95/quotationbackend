const DbModel = require("../../config/db.config");
const md5 = require("md5");
const functionsClass = require("../middleware/functions");
const sendMailClass = require("../middleware/sendmail");
const authMiddleware = require("../middleware/auth");
const date = require("date-and-time");
const dateTime = require("node-datetime");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const Quotations = function (quotations) {};
Quotations.getAllQuotations = (postArr, result) => {
    const conn = DbModel.getConnectDb();  
    var qry=`SELECT quotations.ID as id,quotations.sQuotationNumber as quotationnumber,quotations.sTitle as title,quotations.fTotalAmount as totalamount,quotations.iStatus as status,quotations.dtCreatedOn as createdon,quotations.iCreatedBy as createdby,clients.sClientName as createdname,clients.sCompanyName as company,clients.sEmail as email,clients.sPhoneNumber as phone,clients.sNotes as notes
    FROM quotations 
    LEFT JOIN clients ON quotations.iClientId = clients.ID 
    WHERE 1=1 ORDER BY quotations.dtCreatedOn DESC`;
    conn.query(qry,(err,res)=>{
        if(err){
        result(err,null);
        return;
        }
        if(res){
        if(res.length>0){
            for(let element of res){
                element.quotationid = functionsClass.encrypt(element.id);
                if(element.status==0){
                    element.statusname = "Draft";
                }else if(element.status==1){
                    element.statusname = "Sent";
                }else if(element.status==2){
                    element.statusname="Approved";
                }else{
                    element.statusname="Rejected";
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

Quotations.addQuotations = async (postArr, result) => {
    const conn = DbModel.getConnectDb(); 
    const now = new Date();
    var dtCreatedOn = date.format(now, "YYYY-MM-DD HH:mm:ss");

     var quotdate = functionsClass.formatDateString(postArr.quotationDate);


    //  var quotationnumber = await functionsClass.getNamesWithConn(
    //     conn,
    //     `quotations`,
    //     `sQuotationNumber`,
    //     `1=1 ORDER BY ID DESC`
    // );

    // console.log("quotationnumber", quotationnumber)
    // if(quotationnumber == "" || quotationnumber == null || quotationnumber == undefined){
    //     quotationnumber = 1000;
    // }else{
    //         var quotationnumber = parseInt(quotationnumber) + 1; 

    // }   

    clientid = functionsClass.decrypt(postArr.clientid);
    
    var sql = `INSERT INTO quotations (sQuotationNumber, sTitle, fTotalAmount, iStatus, dtCreatedOn, dtQuotationDate, iClientId, iCreatedBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    conn.query(sql, [postArr.quotnumber, postArr.title, postArr.totalamount, 0, dtCreatedOn, quotdate, clientid, 1], async (err, res) => {
        if (err) {
            result(err, null);
            return;
        }
        if(res){
            var insertdet = await insertQuotationDetails(conn, res.insertId, postArr.items);
            if(insertdet){
                result(null, res);
                return;
            }
        }
    });
}

function insertQuotationDetails(conn, quotationId, quotationDetails) {
    console.log("phonenumber", quotationDetails )
    return new Promise((resolve, reject) => {
        const now = new Date();
        const dtCreatedOn = date.format(now, "YYYY-MM-DD HH:mm:ss");
        // convert array into bulk insert format
        const values = quotationDetails.map(item => [
            quotationId,
            item.title,
            item.description,
            item.quantity,
            item.unitprice,
            item.totalprice,
            dtCreatedOn,
            1
        ]);
        const sql = `INSERT INTO quotation_details (iQuotationId, sTitle, sDescription, fQuantity, fUnitPrice, fTotalPrice, dtCreatedOn, iCreatedBy) VALUES ?`;
        conn.query(sql, [values], (err, res) => {
            if (err) {
                return reject(err);
            }
            resolve(res);
        });
    });
}

Quotations.updateQuotations = async (editId, postArr, result) => {
    console.log("editId", postArr);

    const conn = DbModel.getConnectDb();
    const now = new Date();
    var dtCreatedOn = date.format(now, "YYYY-MM-DD HH:mm:ss");

    const quotationId = functionsClass.decrypt(editId);


    const sql = `
        UPDATE quotations 
        SET 
            sTitle = ?, 
            fTotalAmount = ?, 
            iStatus = ?, 
            iCreatedBy = ?,
            dtQuotationDate = ?
        WHERE ID = ?
    `;

    conn.query(sql, [
        postArr.title,
        postArr.totalamount,
        postArr.status,
        1,
        postArr.quotationDate,
        quotationId
    ], async (err, res) => {

        if (err) {
            result(err, null);
            return;
        }

        try {
            // STEP 1: delete old details
            await deleteQuotationDetails(conn, quotationId);

            // STEP 2: insert new details
            await insertQuotationDetails(conn, quotationId, postArr.items);

            result(null, res);

        } catch (error) {
            result(error, null);
        }
    });
};

function deleteQuotationDetails(conn, quotationId) {
    return new Promise((resolve, reject) => {

        const sql = `
            DELETE FROM quotation_details 
            WHERE iQuotationId = ?
        `;

        conn.query(sql, [quotationId], (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
}

Quotations.getQuotationsById = (quotId, result) => {
    const conn = DbModel.getConnectDb();
    const quotationId = functionsClass.decrypt(quotId);
    var qry=`SELECT quotations.ID as id,quotations.sQuotationNumber as quotnumber,quotations.sTitle as title,quotations.fTotalAmount as totalamount,quotations.iStatus as statusid,quotations.dtCreatedOn as createdon,quotations.iCreatedBy as createdby,clients.sClientName as clientname,clients.sCompanyName as companyname,clients.sEmail as email,clients.sPhoneNumber as phone,clients.sNotes as notes,quotations.iClientId as client_id,quotations.dtQuotationDate as quotationDate
    FROM quotations 
    LEFT JOIN clients ON quotations.iClientId = clients.ID 
    WHERE quotations.ID = ?`;
    conn.query(qry,[quotationId],async (err,res)=>{
        if(err){
        result(err,null);
        return;
        }
        if(res){
        if(res.length>0){
         var items = await getQuotationDetailsById(conn, quotationId);
          const clientid = functionsClass.encrypt(res[0].client_id);
         res[0].items = items;
         res[0].clientid = clientid;

         if(res[0].statusid==0){
            res[0].status = "Draft";
        }else if(res[0].statusid==1){
            res[0].status = "Sent";
        }else if(res[0].statusid==2){
            res[0].status="Approved";
        }else{    
            res[0].status="Rejected";
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
function getQuotationDetailsById(conn, quotationId) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT sTitle as title,sDescription as description,fQuantity as quantity,fUnitPrice as unitprice,fTotalPrice as totalprice FROM quotation_details WHERE iQuotationId = ?`;  
        conn.query(sql, [quotationId], (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
}
Quotations.deleteQuotations = (deleteID, result) => {
    console.log("deleteID", deleteID)
    const conn = DbModel.getConnectDb(); 
    var quotationid = functionsClass.decrypt(deleteID);
    console.log("quotationid", quotationid);
    const sql = `DELETE FROM quotations WHERE ID = ?`;
    conn.query(sql, [quotationid], async (err, res) => {
        if (err) {
            result(err, null);
            return;
        }
        if(res){
             await deleteQuotationDetails(conn, quotationid);
        }
        result(null, res);
    });
}

Quotations.getAllQuotationItems = (quotId, result) => {
    const conn = DbModel.getConnectDb();
    const quotationId = functionsClass.decrypt(quotId);
    var qry=`SELECT quotation_details.ID,quotation_details.sTitle,quotation_details.sDescription,quotation_details.fQuantity,quotation_details.fUnitPrice,quotation_details.fTotalPrice,quotation_details.dtCreatedOn,quotation_details.iCreatedBy
    FROM quotation_details  WHERE quotation_details.iQuotationId = ?`;
    conn.query(qry,[quotationId],async (err,res)=>{
        if(err){
        result(err,null);
        return;
        }
        if(res){
        if(res.length>0){         
            result(null,res);
            return;
        }else{
            result(null,[]);
            return;
        }
        }
    })
}


module.exports = Quotations;