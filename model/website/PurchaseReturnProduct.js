const { STRING } = require("sequelize");
var Sequelize = require("sequelize");

var db = require("../../database/magenta_eo");

var purchaseReturnProducts = db.define(
  "purchase_return_product",
  {
    purchaseReturnId: Sequelize.INTEGER,
    productId: Sequelize.INTEGER,
    quantity: Sequelize.INTEGER,
    amount: Sequelize.INTEGER,
    cause: Sequelize.STRING,
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = purchaseReturnProducts;
