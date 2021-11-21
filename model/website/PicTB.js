const { STRING } = require("sequelize");
var Sequelize = require("sequelize");
var db = require("../../database/magenta_eo");

var pictb = db.define(
  "pic_tb",
  {
    opening_balance: Sequelize.INTEGER,
    balance: Sequelize.INTEGER,
    date: Sequelize.DATE,
    pic_id: Sequelize.INTEGER,
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = pictb;
