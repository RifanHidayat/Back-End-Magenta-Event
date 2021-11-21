const { STRING } = require("sequelize");
var Sequelize = require("sequelize");

var db = require("../../database/magenta_eo");

var purchaseTransactions = db.define(
  "purchase_return_transaction",
  {
    code: Sequelize.STRING,
    date: Sequelize.DATE,
    accountId: Sequelize.STRING,
    supplierId: Sequelize.INTEGER,
    purchaseReturnId: Sequelize.INTEGER,
    amount: Sequelize.INTEGER,
    note: Sequelize.INTEGER,
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = purchaseTransactions;
