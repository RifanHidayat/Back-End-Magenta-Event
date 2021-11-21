const { STRING } = require("sequelize");
var Sequelize = require("sequelize");

var db = require("../../database/magenta_eo");

var purchaseReturn = db.define(
  "purchase_return",
  {
    code: Sequelize.STRING,
    date: Sequelize.DATE,
    accountId: Sequelize.INTEGER,
    supplierId: Sequelize.INTEGER,
    purchaseOrderId: Sequelize.INTEGER,
    quantity: Sequelize.INTEGER,
    amount: Sequelize.INTEGER,
    note: Sequelize.INTEGER,
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = purchaseReturn;
