const { STRING } = require("sequelize");
var Sequelize = require("sequelize");
var db = require("../../database/magenta_finance");
const account = require("../website/accounts");

var accountTransactions = db.define(
  "account_transactions",
  {
    number: Sequelize.STRING,
    date: Sequelize.INTEGER,
    description: Sequelize.STRING,
    amount: Sequelize.STRING,
    type: Sequelize.STRING,
    is_group: Sequelize.STRING,
    group_number: Sequelize.INTEGER,
    accountId: Sequelize.INTEGER,
    coa_id: Sequelize.INTEGER,
    table_id: Sequelize.INTEGER,
    table_name: Sequelize.STRING,
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);
accountTransactions.belongsTo(account);
account.hasMany(accountTransactions);
module.exports = accountTransactions;
