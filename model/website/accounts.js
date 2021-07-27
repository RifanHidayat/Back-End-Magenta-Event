
var Sequelize=require('sequelize')
var db=require('../../database/magenta_hrd')
var bank_accounts=db.define('bank_accounts',{

    bank_name:Sequelize.STRING,
    account_number:Sequelize.STRING,
    account_owner:Sequelize.STRING,
    account_balance:Sequelize.INTEGER,
    type:Sequelize.STRING

},
{
    freezeTableName:true,
    timestamps:false
}
)
module.exports=bank_accounts