const mysql = require('mysql2');

var pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : process.env.MY_SQL_USER,
    password        : process.env.MY_SQL_PASSWORD,
    database        : 'todo'
  });
 
  
  const promisePool = pool.promise();
  
  module.exports = promisePool;