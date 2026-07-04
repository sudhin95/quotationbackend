const DbModel = require("../../config/db.config");
const md5 = require("md5");
const functionsClass = require("../middleware/functions");
const sendMailClass = require("../middleware/sendmail");
const authMiddleware = require("../middleware/auth");
const date = require("date-and-time");
const dateTime = require("node-datetime");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { generateQuotationDraft } = require('../services/geminiService.js');
const { validateQuotationDraft } = require('../services/quotationValidation.js');
const axios = require('axios');


const Quotations = function (quotations) {};
Quotations.getAllQuotations = (postArr, result) => {
    const conn = DbModel.getConnectDb();  
    var qry=`SELECT quotations.ID as id,quotations.sQuotationNumber as quotationnumber,quotations.sTitle as title,quotations.fTotalAmount as totalamount,quotations.iStatus as status,quotations.dtCreatedOn as createdon,quotations.iCreatedBy as createdby,clients.sClientName as createdname,clients.sCompanyName as company,clients.sEmail as email,clients.sPhoneNumber as phone,clients.sNotes as notes,quotations.sDescription as description 
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


    clientid = functionsClass.decrypt(postArr.clientid);
    
    var sql = `INSERT INTO quotations (sQuotationNumber, sTitle, fTotalAmount, iStatus, dtCreatedOn, dtQuotationDate, sDescription, iClientId, iCreatedBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    conn.query(sql, [postArr.quotnumber, postArr.title, postArr.totalamount, 0, dtCreatedOn, quotdate, postArr.description, clientid, 1], async (err, res) => {
        if (err) {
            result(err, null);
            return;
        }
        if(res){
            var insertdet = await insertQuotationDetails(conn, res.insertId, postArr.items);
            if(insertdet){
                await updateAILogs(conn, res.insertId);
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

    const conn = DbModel.getConnectDb();
    const now = new Date();
    var dtCreatedOn = date.format(now, "YYYY-MM-DD HH:mm:ss");

    const quotationId = functionsClass.decrypt(editId);


      let previousStatus;
    try {
        previousStatus = await getCurrentStatus(conn, quotationId);
    } catch (err) {
        return result(err, null);
    }


    const sql = `
        UPDATE quotations 
        SET 
            sTitle = ?, 
            fTotalAmount = ?, 
            iStatus = ?, 
            iCreatedBy = ?,
            dtQuotationDate = ?,
            sDescription = ?
        WHERE ID = ?
    `;

    conn.query(sql, [
        postArr.title,
        postArr.totalamount,
        postArr.status,
        1,
        postArr.quotationDate,
        postArr.description,
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

            const newStatus = Number(postArr.status);
            const wasApproved = Number(previousStatus) === 2;
            const isNowApproved = newStatus === 2;

            if (isNowApproved && !wasApproved) {
                // Fire-and-forget: don't let webhook failure block the response
                notifyQuotationApproved(conn, quotationId, postArr).catch(webhookErr => {
                    console.error('n8n webhook failed (non-blocking):', webhookErr.message);
                });
            }

            result(null, res);

        } catch (error) {
            result(error, null);
        }
    });
};

function getCurrentStatus(conn, quotationId) {
    return new Promise((resolve, reject) => {
        conn.query(
            `SELECT iStatus FROM quotations WHERE ID = ?`,
            [quotationId],
            (err, rows) => {
                if (err) return reject(err);
                if (!rows.length) return reject(new Error('Quotation not found'));
                resolve(rows[0].iStatus);
            }
        );
    });
}

async function notifyQuotationApproved(conn, quotationId, postArr) {
    const webhookUrl = process.env.N8N_APPROVAL_WEBHOOK_URL;
    if (!webhookUrl) {
        console.error('N8N_APPROVAL_WEBHOOK_URL is not configured');
        return;
    }
    // Pull client details for a useful notification payload
    const details = await getQuotationSummaryForNotification(conn, quotationId);

    try {
        await axios.post(webhookUrl, {
            quotationId,
            quotationNumber: details.quotationnumber,
            title: postArr.title,
            totalAmount: postArr.totalamount,
            clientName: details.clientname,
            companyName: details.companyname,
            approvedAt: functionsClass.formatDate(new Date())
        }, { timeout: 10000 });
    } catch (err) {
        if (err.code === 'ECONNABORTED') {
            throw new Error('n8n webhook timed out');
        }
        throw new Error('n8n webhook request failed: ' + err.message);
    }
}

function getQuotationSummaryForNotification(conn, quotationId) {
    return new Promise((resolve, reject) => {
        const qry = `
            SELECT quotations.sQuotationNumber as quotationnumber,
                   clients.sClientName as clientname,
                   clients.sCompanyName as companyname
            FROM quotations
            LEFT JOIN clients ON quotations.iClientId = clients.ID
            WHERE quotations.ID = ?
        `;
        conn.query(qry, [quotationId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows[0] || {});
        });
    });
}

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
    var qry=`SELECT quotations.ID as id,quotations.sQuotationNumber as quotnumber,quotations.sTitle as title,quotations.fTotalAmount as totalamount,quotations.iStatus as statusid,quotations.dtCreatedOn as createdon,quotations.iCreatedBy as createdby,clients.sClientName as clientname,clients.sCompanyName as companyname,clients.sEmail as email,clients.sPhoneNumber as phone,clients.sNotes as notes,quotations.iClientId as client_id,quotations.dtQuotationDate as quotationDate,quotations.sDescription as description
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

Quotations.generateQuotationDraft = async (req, result) => {
    const requestText = req.title;

    if (!requestText || typeof requestText !== "string" || !requestText.trim()) {
        return result({ status: 400, message: "Request text is required" }, null);
   
    }

    let aiResponse;
    try {
        aiResponse = await generateQuotationDraft(requestText.trim());
    } catch (err) {
        console.error("AI call failed:", err.message);

        if (err.message.startsWith("PROMPT_TEMPLATE_MISSING")) {
            return result({ status: 500, message: "Server configuration error" }, null);
        }
        if (err.message.startsWith("AI_EMPTY_RESPONSE")) {
            return result({ status: 502, message: "AI returned no content. Please try again." }, null);
        }
        // AI_CALL_FAILED or anything else — treat as upstream/service failure
        return result({ status: 502, message: "AI service is currently unavailable. Please try again shortly." }, null);
    }

    let parsed;
    try {
        parsed = typeof aiResponse === "string" ? JSON.parse(aiResponse) : aiResponse;
    } catch (parseErr) {
        console.error("JSON Parse Error:", parseErr.message);
        return result({ status: 502, message: "AI returned an unreadable response. Please try again." }, null);
    }

    let validated;
    try {
        validated = validateQuotationDraft(parsed);

        await insertAILogs( validated, requestText);

    } catch (validationErr) {
        console.error("AI response failed validation:", validationErr.message);
        return result({ status: 502, message: "AI response was invalid. Please rephrase and try again." }, null);
    }

    return result(null, validated);
};

function insertAILogs( validatedData, userRequest) {
    return new Promise((resolve, reject) => {
        const conn = DbModel.getConnectDb();
        const now = new Date();
        const dtCreatedOn = date.format(now, "YYYY-MM-DD HH:mm:ss");
        const sql = `INSERT INTO ai_logs (sUserRequest, sAIResponse,iQuotationAdded, dtCreatedOn, iCreatedBy) VALUES (?, ?, ?, ?, ?)`;    
        conn.query(sql, [userRequest, JSON.stringify(validatedData), 0, dtCreatedOn, 1], (err, res) => {
            if (err) {
                console.error("Failed to log AI response:", err.message);
                return reject(err);
            }   
           return resolve(res);
        });
    });
}   


Quotations.approveQuotation = (quotId, result) => {
    const conn = DbModel.getConnectDb();
    const quotationId = functionsClass.decrypt(quotId);
    const sql = `UPDATE quotations SET iStatus = 2 WHERE ID = ?`;
    conn.query(sql, [quotationId], async (err, res) => {
        if (err) {  
            result(err, null);
            return;
        }   
        result(null, res);
    });
}

function updateAILogs(conn, quotationId) {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE ai_logs SET iQuotationAdded = 1, iQuotationId = ? WHERE iQuotationAdded = 0 ORDER BY dtCreatedOn DESC LIMIT 1`;
        conn.query(sql, [quotationId], (err, res) => {
            if (err) {
                console.error("Failed to update AI logs:", err.message);
                return reject(err);
            }
            return resolve(res);
        });
    });
}

module.exports = Quotations;