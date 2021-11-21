const model = require("../../model/index");
const { Op, where } = require("sequelize");
const { purchaseTransactions, purchaseOrder } = require("../../model/index");
const controller = {};
const dateFormat = require("dateformat");
const hppAccount = "111";
const db = require("../../database/magenta_eo");
const { collect } = require("collect.js");
controller.show = async function (req, res) {
  try {
    let purchaseTransactions = await db.query(
      "SELECT * FROM purchase_transactions"
    );

    let purchaseTransactionCollect = collect(purchaseTransactions[0]).groupBy(
      "group"
    );

    // const grouped = collection.groupBy("manufacturer");

    // grouped.all();
    if (purchaseTransactions[0].length > 0) {
      res.status(200).json({
        code: 200,
        error: false,
        message: "successfully",
        data: purchaseTransactions[0],
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

controller.create = async function (req, res) {
  let code = req.body.code;
  let accountId = req.body.account_id;
  let supplierId = req.body.supplier_id;
  let purchaseOrderId = req.body.purchase_order_id;
  let payAmount = req.body.pay_amount;
  let date = req.body.date;
  let note = req.body.note;
  let nextday = dateFormat(new Date(date).getTime() + 86400000, "yyyy-mm-dd");
  try {
    await model.purchaseTransactions
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
          "PT-" +
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
    await model.purchaseTransactions
      .create({
        code: purchaseTransactionCode,
        accountId: accountId,
        supplierId: supplierId,
        purchaseOrderId: purchaseOrderId,
        amount: payAmount,
        note: note,
        date: date,
      })
      .then((response) => {
        // res.status(200).json({
        //   code: 200,
        //   error: false,
        //   message: "Data has been saved",
        //   data: response,
        // });
        if (payAmount > 0) {
          try {
            model.accountTransactions
              .create({
                number: purchaseTransactionCode,
                date: date,
                description: `Pembayaran Pembelian dengan No .${purchaseTransactionCode}`,
                amount: payAmount,
                is_group: 0,
                accountId: accountId,
                coa_id: hppAccount,
                type: "out",
                table_id: response.id,
                table_name: "purchase_Transactions",
              })
              .then((transactions) => {
                try {
                  model.accountTransactions
                    .create({
                      number: purchaseTransactionCode,
                      date: date,
                      description: `Pembayaran Pembelian dengan No .${purchaseTransactionCode}`,
                      amount: payAmount,
                      is_group: 0,
                      accountId: hppAccount,
                      coa_id: accountId,
                      type: "in",
                      table_id: response.id,
                      table_name: "purchase_Transactions",
                    })
                    .then((response) => {
                      return res.status(200).json({
                        code: 200,
                        error: false,
                        message: "Data has been saved",
                        data: response,
                      });
                    })
                    .catch((e) => {
                      return res.status(404).json({
                        code: 404,
                        error: true,
                        message: `${e}`,
                        data: [],
                      });
                    });
                } catch (e) {
                  return res.status(404).json({
                    code: 404,
                    error: true,
                    message: `${e}`,
                    data: [],
                  });
                }
              })
              .catch((e) => {
                return res.status(404).json({
                  code: 404,
                  error: true,
                  message: `${e}`,
                  data: [],
                });
              });
          } catch (e) {
            return res.status(404).json({
              code: 404,
              error: true,
              message: `${e}`,
              data: [],
            });
          }
        }
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
    await model.purchaseTransactions
      .destroy({
        where: { id: id },
      })
      .then((response) => {
        model.transactionAccounts
          .destroy({
            where: { table_id: id, table_name: "purchase_transactions" },
          })
          .then((response) => {
            return res.status(200).json({
              code: 200,
              error: false,
              message: "Data has been deleted",
              data: response,
            });
          })
          .catch((e) => {
            return res.status(404).json({
              code: 404,
              error: true,
              message: `${e}`,
              data: [],
            });
          });
      })
      .catch((error) => {
        return res.status(404).json({
          code: 404,
          error: true,
          message: `${e}`,
          data: [],
        });
      });
  } catch (e) {
    return res.status(404).json({
      code: 404,
      error: true,
      message: `${e}`,
      data: [],
    });
  }
};
controller.detail = async function (req, res) {
  try {
    let purchaseOrderId = req.params.id;
    await model.purchaseTransactions
      .findAll(
        {
          where: {
            purchaseOrderid: purchaseOrderId,
          },
        },
        { model: model.accounts }
      )
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

module.exports = controller;
