const { STRING } = require("sequelize");
var Sequelize = require("sequelize");
var db = require("../../database/magenta_eo");
const quotationPO = require("./QuotationPO");

var transactionTB = db.define(
  "transaction_tb",
  {
    date: Sequelize.DATE,
    description: Sequelize.STRING,
    amount: Sequelize.INTEGER,
    type: Sequelize.STRING,
    id_pictb: Sequelize.INTEGER,
    quotationPoId: Sequelize.INTEGER,
    connection_id: Sequelize.INTEGER,
    connection_table: Sequelize.STRING,
  },

  {
    freezeTableName: true,
    timestamps: false,
  }
);

transactionTB.belongsTo(quotationPO);
quotationPO.hasMany(transactionTB);

module.exports = transactionTB;
