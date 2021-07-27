
var Sequelize=require('sequelize');

var db=new Sequelize("db_magentaeo","root","",{
    dialect:'mysql',
    host:'localhost'
})

module.exports=db