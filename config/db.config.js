// const mysql = require('mysql2');

// const db = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'db_bahrainbanksdirectory',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// module.exports = db;

const { createPool } = require("mysql2");

const DbModel = function () { };
DbModel.pool = null;

DbModel.getConnectDb = () => {
  if (DbModel.pool) {
    return DbModel.pool;
  }

  const DBPORT =  3306;
  const DBHOST = "localhost";
  const DBUSER = "root";
  const DBPASSWORD = "root";
  const DBNAME = "db_quotation"; // your single DB

  const pool = createPool({
    port: DBPORT,
    host: DBHOST,
    user: DBUSER,
    password: DBPASSWORD,
    database: DBNAME,
    connectionLimit: 10,
    queueLimit: 0,
    waitForConnections: true,
    multipleStatements: true,
    connectTimeout: 120000,
    dateStrings: true,
  }).promise();

  // Wrap query for easier usage
  pool.queryLytty = pool.query;
  pool.query = async (sql, values, cb) => {
    if (typeof values === 'function') {
      cb = values;
      values = undefined;
    }
    try {
      const result = await (values ? pool.queryLytty(sql, values) : pool.queryLytty(sql));
      if (cb) cb(null, result[0]);
      return result[0];
    } catch (error) {
      if (cb) cb(error);
      return error;
    }
  };

  // Override end to prevent accidental pool close
  pool.end = () => { };

  DbModel.pool = pool;
  return pool;
};

module.exports = DbModel;
