var Sequelize = require("sequelize");

var db = new Sequelize("magenta_finance", "root", "", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = db;
