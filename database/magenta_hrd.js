
var Sequelize=require('sequelize');

var db=new Sequelize("magenta_hrd","root","",{
    dialect:'mysql',
    host:'localhost'
})

module.exports=db