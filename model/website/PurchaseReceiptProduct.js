const { STRING } = require("sequelize");
var Sequelize = require("sequelize");

var db = require("../../database/magenta_eo");

var purchaseReceiptProduct = db.define(
  "purchase_receipt_product",
  {
    purchaseReceiptId: Sequelize.INTEGER,
    productId: Sequelize.INTEGER,
    quantity: Sequelize.INTEGER,
    free: Sequelize.INTEGER,
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = purchaseReceiptProduct;
