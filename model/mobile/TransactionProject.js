const { STRING } = require("sequelize");
var Sequelize = require("sequelize");
var db = require("../../database/magenta_eo");
var transactions_project = db.define(
  "transactions_project",
  {
    date: Sequelize.DATE,
    amount: Sequelize.INTEGER,
    description: Sequelize.STRING,
    image: Sequelize.STRING,
    type: Sequelize.STRING,
    connection_id: Sequelize.STRING,
    project_id: Sequelize.STRING,
    connection_table: Sequelize.STRING,
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = transactions_project;
