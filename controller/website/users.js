const model = require("../../model/index");
const { Op } = require("sequelize");

const controller = {};
const bcrypt = require("bcrypt");
const { users } = require("../../model/index");
const passwordHash = require("password-hash");

controller.login = async function (req, res) {
  const user = await model.users.findOne({
    where: { username: req.body.username },
  });
  if (user != null) {
    //Use bcryptjs module
    const bcrypt = require("bcryptjs");
    bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
      if (err) {
        return err;
      }
      if (isMatch) {
        console.log(user.is_active);
        if (user.is_active == 0) {
          res.status(400).json({
            code: 400,
            message: "Akun belum aktif",
          });
        } else {
          if (user.finance_permission === "null") {
            res.status(400).json({
              code: 400,
              message: "Akun tidak mempunyai akses",
            });
          } else {
            res.status(200).json({
              code: 200,
              data: user,
            });
          }
        }
      } else {
        res.status(400).json({
          code: 400,
          message: "Incorret usrname/password",
        });
      }
    });
  } else {
    res.status(400).json({
      code: 400,
      message: "Incorret usrname/password",
    });
  }
};

module.exports = controller;
