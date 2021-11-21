const { STRING } = require("sequelize");
var Sequelize = require("sequelize");
var db = require("../../database/magenta_eo");

var picEvent = db.define(
  "pic_event",
  {
    pic_name: Sequelize.INTEGER,
    jabatan: Sequelize.INTEGER,
    email: Sequelize.DATE,
    customer: Sequelize.INTEGER,
    customer_id: Sequelize.INTEGER,
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = picEvent;
