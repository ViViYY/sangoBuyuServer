const mysql = require('mysql');
let client = undefined;

exports.connect = function (config) {
    client = mysql.createPool(config);
};

exports.checkAccount = function (uid, password, cb) {
    let sql = 'select * from t_account where uid =  "' + uid + '";';
    query(sql, function (err, data) {
        if(err){
            console.log(' checkAccount err: ' + err + ' , uid =  ' + uid);
        } else {
            console.log(' check account: ' + JSON.stringify(data));
        }
        //验证
        if(data[0] && password != data[0].password){
            cb('密码不对');
        } else {
            cb(err, data);
        }
    });
};

exports.insertAccountInfo = function (data) {
    let sql = insertSql('t_account', data);
    console.log('sql = ' + sql);
    query(sql, function (err, res) {
        if(err){
            console.log(' insertAccountInfo err : ' + err);
        } else {
            console.log(' insertAccountInfo res : ' + JSON.stringify(res));
        }
    });
};

exports.updateAccountInfo = function (data) {
    let sql = updateSql('t_account', data);
    console.log('sql = ' + sql);
    query(sql, function (err, res) {
        if(err){
            console.log(' updateAccountInfo err : ' + err);
        } else {
            console.log(' updateAccountInfo res : ' + JSON.stringify(res));
        }
    });
};

const query = function (sql, cb) {
    console.log('query = ' + sql);
    client.getConnection(function (err, connection) {
        if(err){
            console.log('connection mysql err :' + err);
            throw err;
        } else {
            connection.query(sql, function (connerr, result, fileds) {
                if(connerr){
                    console.log(' query err : ' + connerr);
                    cb(connerr);
                } else {
                    cb(null, result);
                }
                connection.release();
            });
        }
    });
};

//封装数据库插入语句
const insertSql = function (table, data) {
    let sql = ' insert into ' + table;
    let keyStr = ' ( ';
    let valueStr = ' values (  ';
    for(let i in data){
        keyStr += i + ',';
        if((typeof data[i]).indexOf('string') == 0){
            valueStr += "'" + data[i] + "',";
        } else {
            valueStr += data[i] + ",";
        }
    }
    keyStr = keyStr.substring(0, keyStr.length - 1);
    keyStr += ') ';
    valueStr = valueStr.substring(0, valueStr.length - 1);
    valueStr += ') ';
    sql += keyStr + valueStr;
    return sql;
};

//封装数据库更新语句
const updateSql = function (table, mainKey, mainValue, data) {
    let sql = ' update  ' + table + ' set ';
    for(let i in data){
        if((typeof data[i]).indexOf('string') == 0){
            sql += i + " = '" + data[i] + " ' ,";
        } else {
            sql += i + ' = ' + data[i] + " , ";
        }
    }
    sql = sql.substring(0, sql.length - 1);
    if((typeof mainValue).indexOf('string') == 0){
        sql = ' where ' + mainKey + " = '" + mainValue + " ' ";
    } else {
        sql = ' where ' + mainKey + ' = ' + mainValue;
    }
    return sql;
};
