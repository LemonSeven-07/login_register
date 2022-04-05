const mysql = require('mysql');

// 创建数据库连接对象
const db = mysql.createPool({
  host: 'xxx.xxx.xxx.xxx',
  user: 'root',
  password: '123456',
  database: 'login_register',
  connectionLimit: 20,
});


let query = function(sql, values) {
  return new Promise((resolve, reject) => {
    db.getConnection(function(err, connection) {
      if (err) {
        return console.log('mysql-connection-err:' + err);
        reject(err);
      } else {
        // 执行 SQL 语句
        connection.query(sql, values, (err, rows) => {
          if (err) {
            return console.log('mysql-err:' + err);
            reject(err);
          } else {
            resolve(rows);
          }
          connection.release();
        })
      }
    })
  })
};

module.exports =  query;