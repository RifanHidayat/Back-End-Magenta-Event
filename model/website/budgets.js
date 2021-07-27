const { STRING } = require('sequelize')
var Sequelize=require('sequelize')
var db=require('../../database/magenta_eo')
var budget_project=db.define('budget_project',{
    project_id:{type:Sequelize.INTEGER,primaryKey:true},

    budget_start_date:Sequelize.DATE,
    budget_end_date:Sequelize.DATE,
    opening_balance:Sequelize.INTEGER,


   
},
{
    freezeTableName:true,
    timestamps:false
}
)
budget_project.removeAttribute('id')
module.exports=budget_project