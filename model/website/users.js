const { STRING } = require("sequelize");
var Sequelize = require("sequelize");
var db = require("../../database/magenta_eo");

var users = db.define(
  "tb_users",
  {
    username: Sequelize.STRING,
    group_name: Sequelize.STRING,
    email: Sequelize.STRING,
    firstname: Sequelize.STRING,
    lastname: Sequelize.STRING,
    phone: Sequelize.STRING,
    gender: Sequelize.STRING,
    is_active: Sequelize.INTEGER,
    id_group: Sequelize.INTEGER,
    password: Sequelize.STRING,
    finance_permission: Sequelize.STRING,
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = users;
