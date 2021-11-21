const { STRING } = require("sequelize");
var Sequelize = require("sequelize");
const { projectTransaction } = require("..");
var db = require("../../database/magenta_eo");
const project = require("./projects");

var projectTransactions = db.define(
  "transactions_project",
  {
    date: Sequelize.DATE,
    description: Sequelize.STRING,
    amount: Sequelize.INTEGER,
    type: Sequelize.STRING,
    project_id: Sequelize.INTEGER,
    connection_id: Sequelize.STRING,
    connection_table: Sequelize.STRING,
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

// projectTransaction.belongsTo(project);
// project.hasMany(projectTransaction);

module.exports = projectTransactions;
