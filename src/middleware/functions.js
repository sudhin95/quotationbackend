const dateTime = require("node-datetime");
const DbModel = require("../../config/db.config");

const date = require("date-and-time");
const _ = require("lodash");
const thumb = require("axios");
const sharp = require("sharp");
const moment = require('moment-timezone');
const request = require("request");
const fs = require("fs");
const momentjs = require("moment");
// crypto module
const crypto = require("crypto");
const { invalid } = require("moment");
const { default: axios } = require("axios");
const blsCache = require('./blscache');
const algorithm = "aes-256-cbc";
// generate 16 bytes of random data
const initVector = "vOVH6sdmpNWjRRIq";
// protected data
const message = "This is a secret message";
// secret key generate 32 bytes of random data
const Securitykey = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3";
// the cipher function
// password vald
const rateLimit = require('express-rate-limit');
const passwordValidator = require('password-validator');
const md5 = require('md5'); // Assuming you use md5 for hashing passwords
// passwordvalid
const encrypt = (text) => {
  text = text.toString();
  const encryptText = `Encrypt_Key-${text}`;
  let cachedValue = blsCache.capabilities.get(encryptText);
  if (cachedValue) {
    return cachedValue;
  }
  const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
  let encryptedData = cipher.update(text, "utf-8", "hex");
  encryptedData += cipher.final("hex");
  blsCache.capabilities.set(encryptText, encryptedData, { exp: Date.now() + (24 * 60 * 60 * 1000) });
  return encryptedData;
};
const decrypt = (hash) => {
  try {
    const decipher = crypto.createDecipheriv(
      algorithm,
      Securitykey,
      initVector
    );
    let decryptedData = decipher.update(hash, "hex", "utf-8");
    decryptedData += decipher.final("utf8");
    return decryptedData;
  } catch (e) {
    return null;
  }
};
const getDateTime = () => {
  const now = new Date();
  var gmt = date.format(now, "YYYY-MM-DD HH:mm:ss");
  return (gmt);
}


const getGmtDate = () => {
  const now = new Date();

  const pad = (n) => (n < 10 ? "0" + n : n);

  return (
    now.getUTCFullYear() +
    "-" +
    pad(now.getUTCMonth() + 1) +
    "-" +
    pad(now.getUTCDate()) +
    " " +
    pad(now.getUTCHours()) +
    ":" +
    pad(now.getUTCMinutes()) +
    ":" +
    pad(now.getUTCSeconds())
  );
};


const padZero = (value) => {
  return value < 10 ? `0${value}` : value;
};

const getUserToGmtDate = (date, gmtOffset) => {
  date = date.trim();
  
  const [d, t] = date.split(" ");
  const [year, month, day] = d.split("-").map(Number);
  const [hh, mm, ss] = t.split(":").map(Number);

  // Create local date
  const localDate = new Date(year, month - 1, day, hh, mm, ss);

  // Parse offset
  const sign = gmtOffset.startsWith("-") ? -1 : 1;
  const offsetHours = parseInt(gmtOffset.slice(1, 4), 10) * sign;
  const offsetMinutes = parseInt(gmtOffset.slice(4), 10) * sign;

  // Convert LOCAL → UTC by subtracting offset
  const utcDate = new Date(
    localDate.getTime() - (offsetHours * 60 + offsetMinutes) * 60000
  );

  const pad = (n) => (n < 10 ? "0" + n : n);

  return `${utcDate.getUTCFullYear()}-${pad(utcDate.getUTCMonth() + 1)}-${pad(utcDate.getUTCDate())} ${pad(utcDate.getUTCHours())}:${pad(utcDate.getUTCMinutes())}:${pad(utcDate.getUTCSeconds())}`;
};


//gmtTime parameter format type YYYY-MM-DD HH:mm:ss  
// const getGmtToUserDate = (gmtTime, gmtOffset) => {
//   const [getdate, gettime] = gmtTime.split(' ');
//   // if(gettime=="00:00:000"){
//   //   var formattedDate=gmtTime
//   //   return formattedDate;
//   // }
//   // else{
//     const inputDate = new Date(gmtTime);
//     const isNegativeOffset = gmtOffset.startsWith('-');
//     const gmtOffsetHours = parseInt(gmtOffset.slice(1, 4), 10);
//     const gmtOffsetMinutes = parseInt(gmtOffset.slice(4), 10);
//     const adjustedLocalHours = isNegativeOffset
//       ? inputDate.getUTCHours() - gmtOffsetHours
//       : inputDate.getUTCHours() + gmtOffsetHours;
//     const localTime = new Date(
//       inputDate.getUTCFullYear(),
//       inputDate.getUTCMonth(),
//       inputDate.getUTCDate(),
//       adjustedLocalHours,
//       inputDate.getUTCMinutes() + gmtOffsetMinutes,
//       inputDate.getUTCSeconds()
//     );
//     const formattedDate = `${localTime.getFullYear()}-${padZero(localTime.getMonth() + 1)}-${padZero(localTime.getDate())} ${padZero(localTime.getHours())}:${padZero(localTime.getMinutes())}:${padZero(localTime.getSeconds())}`;
//     return formattedDate;
//   // }
// };
const getGmtToUserDate = (gmtTime, gmtOffset) => {
  const inputDate = new Date(gmtTime); // this is UTC

  const sign = gmtOffset.startsWith('-') ? -1 : 1;
  const hours = parseInt(gmtOffset.slice(1, 3), 10);
  const minutes = parseInt(gmtOffset.slice(3, 5), 10);

  const offsetMs = sign * ((hours * 60) + minutes) * 60 * 1000;

  // Convert GMT to target timezone
  const localDate = new Date(inputDate.getTime() + offsetMs);

  const formattedDate = 
    `${localDate.getFullYear()}-${padZero(localDate.getMonth() + 1)}-${padZero(localDate.getDate())} ` +
    `${padZero(localDate.getHours())}:${padZero(localDate.getMinutes())}:${padZero(localDate.getSeconds())}`;

  return formattedDate;
};

function formatDate(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date)) return ''; // return empty if invalid date

    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-GB', { month: 'long' });
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${year} ${hours}:${minutes}`;

  }

function formatDateShortMonth(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date)) return ''; // return empty if invalid date

  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-GB', { month: 'short' }); // short month name
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day} ${month} ${year} ${hours}:${minutes}`;

}
const getfilterStartAndEndOfDayInUTC = (inputDateString,offsetgmt) => {
  if (typeof inputDateString !== 'string') {
    console.error("Invalid date input");
    return;
  }
  // Parse the input string to a Date object
  const dateObject = new Date(inputDateString);
  if (isNaN(dateObject.getTime())) {
    console.error("Invalid date input");
    return;
  }
  // Convert to UTC string
  const utcString = dateObject.toISOString();
  // Extract date from the UTC string
  const [datePart] = utcString.split('T');
  const gmtdate = datePart;
var timezone = offsetgmt
var start_date = 
              moment.utc(
                moment(gmtdate)
                  .utcOffset(timezone)
                  .startOf('day')
              ).format("YYYY-MM-DD  HH:mm:ss");
var end_date = 
              moment.utc(
                moment(gmtdate)
                  .utcOffset(timezone)
                  .endOf('day')
              ).format("YYYY-MM-DD  HH:mm:ss");
              return  { start: start_date, end: end_date };
}
function formatAnyDate(dateInput) {
    const date = new Date(dateInput);
    if (isNaN(date)) return '';

    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${year}`;

    // return `${day} ${month} ${year} ${hours}:${minutes}`;
}
const getNamesWithConn = (conn, table_name, column, where = "") => {
  return new Promise((resolve, reject) => {
    // if (where != "") {
    //  // where = " AND " + where;
    // }
    if (where == "") {
      where = " 1=1 ";
    }
    var return_value = "";
    var qry = `SELECT  ${column}  as return_value FROM  ${table_name}  WHERE ${where} LIMIT 1 ;`;
    conn.query(qry, (err, res) => {
      if (err) {
        reject(err);
      }
      if (res != undefined && res != null) {
        if (res.length) {
          return_value = res[0].return_value;
        }
      }
      resolve(return_value);
    });
  });
};

function formatDateString(isoString) {
  if (!isoString) return '';

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  const pad = (n) => n.toString().padStart(2, '0');

  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const ss = pad(date.getSeconds());

  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

module.exports = {
  encrypt,
  decrypt,
  getGmtDate,
  getUserToGmtDate,
  getGmtToUserDate,
  getDateTime,
  formatDate,
  formatDateShortMonth,
  getfilterStartAndEndOfDayInUTC,
  formatAnyDate,
  getNamesWithConn,
  formatDateString
}