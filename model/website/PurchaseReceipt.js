const { STRING } = require("sequelize");
var Sequelize = require("sequelize");

var db = require("../../database/magenta_eo");

var purchaseTransactions = db.define(
  "purchase_receipt",
  {
    code: Sequelize.STRING,
    date: Sequelize.DATE,
    supplierId: Sequelize.INTEGER,
    purchaseOrderId: Sequelize.INTEGER,
    quantity: Sequelize.INTEGER,
    note: Sequelize.INTEGER,
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = purchaseTransactions;
