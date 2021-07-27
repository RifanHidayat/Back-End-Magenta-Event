const { STRING } = require('sequelize')
var Sequelize=require('sequelize')
var db=require('../../database/magenta_eo')
var budget_projejct=require('./budgets')
var projects=db.define('projects',{

    project_number:Sequelize.STRING,
    quotation_number:Sequelize.DATE,
    project_created_date:Sequelize.DATE,
    project_start_date:Sequelize.DATE,
    event_customer:Sequelize.STRING,
    event_customer:Sequelize.STRING,
    description:Sequelize.STRING,
    members:Sequelize.STRING,
    latitude:Sequelize.STRING,
    longtitude:Sequelize.STRING,
    grand_total:Sequelize.STRING,
    status:Sequelize.STRING,
    id_quotation:Sequelize.STRING,
    project_id:Sequelize.INTEGER
},
{
    freezeTableName:true,
    timestamps:false
}
)



projects.removeAttribute('id')
module.exports=projects