const { STRING } = require('sequelize')
var Sequelize=require('sequelize')
var db=require('../../database/magenta_hrd')
var transaction_account=db.define('transaction_account',{
 
    date:Sequelize.DATE,
    amount:Sequelize.INTEGER,
    description:Sequelize.STRING,
    image:Sequelize.STRING,
    type:'in',
    transaction_id:Sequelize.STRING,
    account_id:Sequelize.INTEGER    
},
{
    freezeTableName:true,
    timestamps:false
}
)

module.exports=transaction_account