const { STRING } = require("sequelize");
var Sequelize = require("sequelize");
const { accounts } = require("..");
var db = require("../../database/magenta_eo");
const account = require("../website/accounts");
const supplier = require("../website/Supplier");
const purchaseTransactions = require("./purchaseTransactions");

var purchaseOrder = db.define(
  "purchase_order",
  {
    code: Sequelize.STRING,
    date: Sequelize.DATE,
    total: Sequelize.INTEGER,
    shipping_cost: Sequelize.INTEGER,
    discount: Sequelize.INTEGER,
    net_total: Sequelize.INTEGER,
    pay_amount: Sequelize.INTEGER,
    supplierId: Sequelize.INTEGER,
    accountId: Sequelize.INTEGER,
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

// purchaseOrder.belongsTo(account);
// ac.hasMany(transactionTB);

module.exports = purchaseOrder;
