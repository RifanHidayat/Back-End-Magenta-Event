const { STRING } = require("sequelize");
var Sequelize = require("sequelize");
var db = require("../../database/magenta_eo");

var purchaseOrderProduct = require("../website/PurchaseOrderProduct");

var products = db.define(
  "product",
  {
    code: Sequelize.STRING,
    name: Sequelize.STRING,
    description: Sequelize.STRING,
    purchase_price: Sequelize.INTEGER,
    selling_price: Sequelize.INTEGER,
    stock: Sequelize.STRING,
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

// purchaseOrderProduct.hasMany(products);
// products.hasMany(purchaseOrderProduct);

module.exports = products;
