const { STRING } = require("sequelize");
var Sequelize = require("sequelize");

var db = require("../../database/magenta_eo");

const products = require("./Product");

var purchaseOrderProduct = db.define(
  "purchase_order_product",
  {
    purchaseOrderId: Sequelize.INTEGER,
    productId: Sequelize.INTEGER,
    stock: Sequelize.INTEGER,
    price: Sequelize.INTEGER,
    quantity: Sequelize.INTEGER,
    discount: Sequelize.INTEGER,
    description: Sequelize.STRING,
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

// purchaseOrderProduct.belongsTo(products);
// products.hasMany(purchaseOrderProduct);

module.exports = purchaseOrderProduct;
