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
    var qry=`SELECT quotations.ID,quotations.sQuotationNumber,quotations.sTitle,quotations.fTotalAmount,quotations.iStatus,quotations.dtCreatedOn,quotations.iCreatedBy,clients.sClientName,clients.sCompanyName,clients.sEmail,clients.sPhoneNumber,clients.sNotes
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
                element.quotationid = functionsClass.encrypt(element.ID);
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

     var quotationnumber = await functionsClass.getNamesWithConn(
        conn,
        `quotations`,
        `sQuotationNumber`,
        `1=1 ORDER BY ID DESC`
    );

    console.log("quotationnumber", quotationnumber)
    if(quotationnumber == "" || quotationnumber == null || quotationnumber == undefined){
        quotationnumber = 1000;
    }else{
            var quotationnumber = parseInt(quotationnumber) + 1; 

    }   

    clientid = functionsClass.decrypt(postArr.clientid);
    
    var sql = `INSERT INTO quotations (sQuotationNumber, sTitle, fTotalAmount, iStatus, dtCreatedOn, iClientId, iCreatedBy) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    conn.query(sql, [quotationnumber, postArr.title, postArr.totalamount, 0, dtCreatedOn, clientid, 1], async (err, res) => {
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
    console.log("editId", editId);

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
            iCreatedBy = ?
        WHERE ID = ?
    `;

    conn.query(sql, [
        postArr.title,
        postArr.totalamount,
        postArr.status,
        1,
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
    var qry=`SELECT quotations.ID,quotations.sQuotationNumber,quotations.sTitle,quotations.fTotalAmount,quotations.iStatus,quotations.dtCreatedOn,quotations.iCreatedBy,clients.sClientName,clients.sCompanyName,clients.sEmail,clients.sPhoneNumber,clients.sNotes
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
         res[0].items = items;
         
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
        const sql = `SELECT sTitle,sDescription,fQuantity,fUnitPrice,fTotalPrice FROM quotation_details WHERE iQuotationId = ?`;  
        conn.query(sql, [quotationId], (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
}
Quotations.deleteQuotations = (deleteID, result) => {
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