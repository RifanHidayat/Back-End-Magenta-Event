const { STRING } = require("sequelize");
var Sequelize = require("sequelize");

var db = require("../../database/magenta_eo");
const accounts = require("./accounts");
const purchaseOrder = require("./PurchaseOrder");

var purchaseTransactions = db.define(
  "purchase_transactions",
  {
    code: Sequelize.STRING,
    date: Sequelize.DATE,
    accountId: Sequelize.STRING,
    supplierId: Sequelize.INTEGER,
    purchaseOrderId: Sequelize.INTEGER,
    amount: Sequelize.INTEGER,
    note: Sequelize.INTEGER,
    group: Sequelize.STRING,
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

// purchaseTransactions.belongsTo(accounts);
// accounts.hasMany(purchaseTransactions);

purchaseTransactions.belongsTo(purchaseOrder);
purchaseOrder.hasMany(purchaseTransactions);

module.exports = purchaseTransactions;
