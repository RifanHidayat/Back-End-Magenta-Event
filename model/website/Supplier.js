const { STRING } = require("sequelize");
var Sequelize = require("sequelize");
var db = require("../../database/magenta_eo");

var suppliers = db.define(
  "supplier",
  {
    code: Sequelize.STRING,
    name: Sequelize.STRING,
    address: Sequelize.STRING,
    phone: Sequelize.STRING,
    email: Sequelize.STRING,
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = suppliers;
