const { STRING } = require("sequelize");
var Sequelize = require("sequelize");
const { transactionTB } = require("..");
var db = require("../../database/magenta_eo");
const transationTB = require("./TransactionTB");

var quotationPO = db.define(
  "quotation_po",
  {
    code: Sequelize.STRING,
    name: Sequelize.INTEGER,
    amount: Sequelize.INTEGER,
    date: Sequelize.DATE,
    quotation_id: Sequelize.INTEGER,
  },

  {
    freezeTableName: true,
    timestamps: false,
  }
);

// transactionTB.belongsTo(quotationPO);
// quotationPO.hasMany(transactionTB);

module.exports = quotationPO;
