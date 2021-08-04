const { STRING } = require('sequelize')
var Sequelize=require('sequelize')
var db=require('../../database/magenta_eo')
var faktur=db.define('faktur',{

    id_faktur:{type:Sequelize.INTEGER,primaryKey:true},
    quotation_number:Sequelize.STRING,
    ser_faktur:Sequelize.STRING,
    REF:Sequelize.STRING,
    syarat_pembayaran:Sequelize.STRING,
    total_sub:Sequelize.STRING,
    total_faktur:Sequelize.STRING,
    pembayaran:Sequelize.STRING,

 },

{
    
    freezeTableName:true,
    timestamps:false

}


)


faktur.removeAttribute('id')
module.exports=faktur