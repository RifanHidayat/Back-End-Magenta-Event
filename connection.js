var mysql=require('mysql');

const conn=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"db_magentaeo"

});

conn.connect((err)=>{
    if (err) throw err;
    console.log("mysql terkoneksi");
    var count = "10"
    console.log(Number(count)+Number("11"));


});



module.exports=conn;