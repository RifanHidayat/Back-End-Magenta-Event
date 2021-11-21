const { STRING } = require("sequelize");
var Sequelize = require("sequelize");
var db = require("../../database/magenta_eo");
const quotationPO = require("./QuotationPO");
var outTransactions = db.define(
  "out_transactions",
  {
    date: Sequelize.DATE,
    description: Sequelize.STRING,
    amount: Sequelize.INTEGER,
    out_pictb_amount: Sequelize.STRING,
    account_id: Sequelize.INTEGER,
    out_account_amount: Sequelize.INTEGER,
    label: Sequelize.STRING,
    project_id: Sequelize.STRING,
    pictb_id: Sequelize.STRING,
    pictb_id_source: Sequelize.STRING,
    quotationPoId: Sequelize.INTEGER,
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);
outTransactions.belongsTo(quotationPO);
quotationPO.hasMany(outTransactions);

module.exports = outTransactions;
