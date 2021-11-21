const model = require("../../model/index");
const { Op, where } = require("sequelize");
const { purchaseTransactions, purchaseOrder } = require("../../model/index");
const db = require("../../database/magenta_eo");
const controller = {};
const dateFormat = require("dateformat");
controller.show = async function (req, res) {
  try {
    await model.purchaseReturnTransactions
      .findAll({})
      .then((response) => {
        if (response.length > 0) {
          res.status(200).json({
            code: 200,
            error: false,
            message: "successfully",
            data: response,
          });
        } else {
          res.status(200).json({
            code: 200,
            error: false,

            message: "successfully",
            data: [],
          });
        }
      })
      .catch((e) => {
        res.status(504).json({
          code: 404,
          error: false,
          data: [],
          message: `${e}`,
        });
      });
  } catch (e) {
    res.status(404).json({
      code: 404,
      error: false,
      data: [],
      message: `${e}`,
    });
  }
};

controller.create = async function (req, res) {
  let code = req.body.code;
  let accountId = req.body.account_id;
  let supplierId = req.body.supplier_id;
  let purchaseReturnId = req.body.purchase_return_id;
  let payAmount = req.body.pay_amount;
  let date = req.body.date;
  let note = req.body.note;
  let nextday = dateFormat(new Date(date).getTime() + 86400000, "yyyy-mm-dd");

  var purchaseTransactionCode = "";
  try {
    await model.purchaseReturnTransactions
      .count({
        where: {
          date: {
            [Op.between]: [date, nextday],
          },
        },
      })
      .then((response) => {
        var count = Math.floor(100000 + Number(response + 1));

        purchaseTransactionCode =
          "PRT" +
          dateFormat(date, "ddmmyyyy") +
          "-" +
          count.toString().substring(1, 6);
      })
      .catch((e) => {
        res.status(404).json({
          code: 404,
          error: true,
          message: `${e}`,
          data: [],
        });
      });
  } catch (e) {
    res.status(404).json({
      code: 404,
      error: true,
      message: `${e}`,
      data: [],
    });
  }

  try {
    await model.purchaseReturnTransactions
      .create({
        code: purchaseTransactionCode,
        accountId: accountId,
        supplierId: supplierId,
        purchaseReturnId: purchaseReturnId,
        amount: payAmount,
        note: note,
        date: date,
      })
      .then((response) => {
        res.status(200).json({
          code: 200,
          error: false,
          message: "Data has been saved",
          data: response,
        });
      })
      .catch((e) => {
        res.status(404).json({
          code: 404,
          error: true,
          message: `${e}`,
          data: [],
        });
      });
  } catch (e) {
    res.status(404).json({
      code: 404,
      error: true,
      message: `${e}`,
      data: [],
    });
  }
};

controller.update = async function (req, res) {
  let code = req.body.code;
  let name = req.body.name;
  let address = req.body.address;
  let phone = req.body.phone;
  let email = req.body.email;
  let id = req.params.id;

  try {
    await model.suppliers
      .update(
        {
          code: code,
          name: name,
          address: address,
          phone: phone,
          email: email,
        },
        {
          where: {
            id: id,
          },
        }
      )
      .then((response) => {
        res.status(200).json({
          code: 200,
          error: false,
          message: "Data has been saved",
          data: response,
        });
      })
      .catch((e) => {
        res.status(404).json({
          code: 404,
          error: true,
          message: `${e}`,
          data: [],
        });
      });
  } catch (e) {
    res.status(404).json({
      code: 404,
      error: true,
      message: `${e}`,
      data: [],
    });
  }
};
controller.destroy = async function (req, res) {
  try {
    let id = req.params.id;
    await model.suppliers
      .destroy({
        where: { id: id },
      })
      .then((response) => {
        res.status(200).json({
          code: 200,
          error: false,
          message: "Data has been deleted",
          data: response,
        });
      })
      .catch((error) => {
        res.status(404).json({
          code: 404,
          error: true,
          message: `${e}`,
          data: [],
        });
      });
  } catch (e) {
    res.status(404).json({
      code: 404,
      error: true,
      message: `${e}`,
      data: [],
    });
  }
};
controller.detail = async function (req, res) {
  try {
    let purchaseReturnId = req.params.id;
    await model.purchaseReturnTransactions
      .findAll({
        where: { purchaseReturnId: purchaseReturnId },
      })
      .then((response) => {
        if (response.length > 0) {
          res.status(200).json({
            code: 200,
            error: false,
            message: "successfully",
            data: response,
          });
        } else {
          res.status(200).json({
            code: 200,
            error: false,

            message: "successfully",
            data: [],
          });
        }
      })
      .catch((e) => {
        res.status(504).json({
          code: 404,
          error: false,
          data: [],
          message: `${e}`,
        });
      });
  } catch (e) {
    res.status(404).json({
      code: 404,
      error: false,
      data: [],
      message: `${e}`,
    });
  }
};
controller.products = async function (req, res) {
  try {
    purchaseReturnProductSql = `SELECT * FROM purchase_return_product JOIN product ON product.id=purchase_return_product.productId  WHERE  purchase_return_product.purchaseReturnId=${req.params.id}`;
    let response = await db.query(purchaseReturnProductSql);
    if (response.length > 0) {
      res.status(200).json({
        code: 200,
        error: false,
        message: "successfully",
        data: response[0],
      });
    } else {
      res.status(200).json({
        code: 200,
        error: false,
        message: "successfully",
        data: [],
      });
    }
  } catch (e) {
    res.status(404).json({
      code: 404,
      error: false,
      data: [],
      message: `${e}`,
    });
  }
};

module.exports = controller;
