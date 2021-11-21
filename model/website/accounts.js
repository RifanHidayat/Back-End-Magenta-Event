// var Sequelize = require("sequelize");
// var db = require("../../database/magenta_hrd");
// var transactionAccount = require("../website/AccountTransaction");
// var bank_accounts = db.define(
//   "bank_accounts",
//   {
//     bank_name: Sequelize.STRING,
//     account_number: Sequelize.STRING,
//     account_owner: Sequelize.STRING,
//     account_balance: Sequelize.INTEGER,
//     type: Sequelize.STRING,
//     status: Sequelize.STRING,
//   },
//   {
//     freezeTableName: true,
//     timestamps: false,
//   }
// );
// transactionAccount.belongsTo(bank_accounts);
// bank_accounts.hasMany(transactionAccount);
// module.exports = bank_accounts;

var Sequelize = require("sequelize");
var db = require("../../database/magenta_finance");

var accounts = db.define(
  "accounts",
  {
    number: Sequelize.STRING,
    name: Sequelize.STRING,
    type: Sequelize.STRING,
    date: Sequelize.DATE,
    init_balance: Sequelize.INTEGER,
    active: Sequelize.STRING,
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);
module.exports = accounts;
