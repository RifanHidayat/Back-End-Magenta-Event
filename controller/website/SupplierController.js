const model = require("../../model/index");
const { Op, where } = require("sequelize");
const controller = {};
const collect = require("collect.js");
const db = require("../../database/magenta_eo");
const { purchaseOrderProduct } = require("../../model/index");
const dateFormat = require("dateformat");
const hppAccount = "111";
controller.show = async function (req, res) {
  try {
    await model.suppliers
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
  let name = req.body.name;
  let address = req.body.address;
  let phone = req.body.phone;
  let email = req.body.email;

  try {
    await model.suppliers
      .create({
        code: code,
        name: name,
        address: address,
        phone: phone,
        email: email,
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
// controller.detail = async function (req, res) {
//   try {
//     let id = req.params.id;
//     await model.suppliers
//       .findAll({
//         where: {
//           id: id,
//         },
//       })
//       .then((response) => {
//         if (response.length > 0) {
//           res.status(200).json({
//             code: 200,
//             error: false,
//             message: "successfully",
//             data: response[0],
//           });
//         } else {
//           res.status(200).json({
//             code: 200,
//             error: false,

//             message: "successfully",
//             data: [],
//           });
//         }
//       })
//       .catch((e) => {
//         res.status(504).json({
//           code: 404,
//           error: false,
//           data: [],
//           message: `${e}`,
//         });
//       });
//   } catch (e) {
//     res.status(404).json({
//       code: 404,
//       error: false,
//       data: [],
//       message: `${e}`,
//     });
//   }
// };

controller.detail = async function (req, res) {
  try {
    let id = req.params.id;
    let purchaseOrderSql = `SELECT * FROM purchase_order WHERE supplierId=${id}`;
    let purchaseTransaction = `SELECT * FROM purchase_transactions where supplierId=${id}`;
    let supplierSql = `SELECT * FROM supplier where id=${id}`;

    let purchaseOrder = await db.query(purchaseOrderSql);
    let purchaseTransactions = await db.query(purchaseTransaction);
    let supplier = await db.query(supplierSql);

    try {
      let purchaseOrderCollect = collect(purchaseOrder[0]).each(function (
        item
      ) {
        let sum = collect(purchaseTransactions[0])
          .filter((value) => value.purchaseOrderid == item.id)
          .sum("amount");
        item["pay_amount"] = sum;
        item["remaining_amount"] = item.total - sum;
      });

      let supplierCollect = collect(supplier[0]).each(function (item) {
        //item["purchase_transactions"] = purchaseOrderCollect;
        let remaining_amount =
          collect(purchaseOrderCollect).sum("remaining_amount");
        let pay_amount = collect(purchaseOrderCollect).sum("pay_amount");
        item["hutang"] = remaining_amount;

        const finished_amount_filltered = collect(purchaseOrderCollect).filter(
          (value, key) => value.remaining_amount == 0
        );
        const unfinished_amount_filltered = collect(
          purchaseOrderCollect
        ).filter((value, key) => value.remaining_amount > 0);
        const finished_amount = finished_amount_filltered.count();
        const unfinished_amount = unfinished_amount_filltered.count();

        item["finished_payment"] = finished_amount;
        item["unfinished_payment"] = unfinished_amount;
      });

      res.status(200).json({
        code: 200,
        error: false,
        message: "successfully",
        data: supplierCollect,
      });
    } catch (e) {
      res.status(404).json({
        code: 404,
        error: false,
        data: [],
        message: `${e}`,
      });
    }
  } catch (e) {
    res.status(504).json({
      code: 404,
      error: false,
      data: [],
      message: `${e}`,
    });
  }
};

controller.payment = async function (req, res) {
  try {
    let id = req.params.id;
    let purchaseOrderSql = `SELECT * FROM purchase_order WHERE supplierId=${id}`;
    let purchaseTransaction = `SELECT * FROM purchase_transactions where supplierId=${id}`;
    let supplierSql = `SELECT * FROM supplier where id=${id}`;

    let purchaseOrder = await db.query(purchaseOrderSql);
    let purchaseTransactions = await db.query(purchaseTransaction);
    let supplier = await db.query(supplierSql);

    try {
      let purchaseOrderCollect = collect(purchaseOrder[0])
        .each(function (item) {
          let sum = collect(purchaseTransactions[0])
            .filter((value) => value.purchaseOrderid == item.id)
            .sum("amount");

          item["pay_amount"] = sum;
          item["remaining_amount"] = item.total - sum;
        })
        .filter((item) => item.remaining_amount > 0)
        .sortBy("date");

      res.status(200).json({
        code: 200,
        error: false,
        message: "successfully",
        data: purchaseOrderCollect,
      });
    } catch (e) {
      res.status(404).json({
        code: 404,
        error: false,
        data: [],
        message: `${e}`,
      });
    }
  } catch (e) {
    res.status(504).json({
      code: 404,
      error: false,
      data: [],
      message: `${e}`,
    });
  }
};

controller.pay = async function (req, res) {
  try {
    let date = req.body.date;
    let payAmount = req.body.pay_amount;
    let amount = req.body.pay_amount;
    console.log(payAmount);
    let note = req.body.note;
    let centralPurchases = req.body.selected_purchases;

    let accountId = req.body.account_id;
    console.log("account di", accountId);

    let nextday = dateFormat(new Date(date).getTime() + 86400000, "yyyy-mm-dd");
    var purchaseTransactionCode;
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

    await centralPurchases.map((item, index) => {
      try {
        if (payAmount > 0) {
          if (payAmount > item.remaining_amount) {
            model.purchaseTransactions
              .create({
                code: index >= 1 ? "" : purchaseTransactionCode,
                group: purchaseTransactionCode,
                accountId: accountId,
                supplierId: item.supplierId,
                purchaseOrderId: item.id,
                amount: item.remaining_amount,
                note: note,
                date: date,
              })
              .then((response) => {
                // payAmount = payAmount - item.remaining_amount;
                if (index == 0) {
                  console.log("amount", amount);
                  model.accountTransactions
                    .create({
                      number: purchaseTransactionCode,
                      date: date,
                      description: `Pembayaran Pembelian dengan No .${purchaseTransactionCode}`,
                      amount: amount,
                      is_group: 0,
                      accountId: accountId,
                      coa_id: hppAccount,
                      type: "out",
                      table_id: response.id,
                      table_name: "purchase_Transactions",
                    })
                    .then((response) => {})
                    .catch((error) => {
                      return res.status(504).json({
                        code: 404,
                        error: false,
                        data: [],
                        message: `${e}`,
                      });
                    });
                }

                console.log(payAmount);
              })
              .catch((e) => {
                console.log(`error ${e}`);
                return res.status(504).json({
                  code: 404,
                  error: false,
                  data: [],
                  message: `${e}`,
                });
              });
            payAmount = payAmount - item.remaining_amount;
          } else {
            model.purchaseTransactions
              .create({
                code: index >= 1 ? "" : purchaseTransactionCode,
                group: purchaseTransactionCode,
                accountId: accountId,
                supplierId: item.supplierId,
                purchaseOrderId: item.id,
                amount: payAmount,
                note: note,
                date: date,
              })
              .then((response) => {
                if (index == 0) {
                  console.log("amount", amount);
                  model.accountTransactions
                    .create({
                      number: purchaseTransactionCode,
                      date: date,
                      description: `Pembayaran Pembelian dengan No .${purchaseTransactionCode}`,
                      amount: amount,
                      is_group: 0,
                      accountId: accountId,
                      coa_id: hppAccount,
                      type: "out",
                      table_id: response.id,
                      table_name: "purchase_Transactions",
                    })
                    .then((response) => {})
                    .catch((error) => {
                      return res.status(504).json({
                        code: 404,
                        error: false,
                        data: [],
                        message: `${e}`,
                      });
                    });
                }
              })
              .catch((e) => {
                console.log(`error ${e}`);
                return res.status(504).json({
                  code: 404,
                  error: false,
                  data: [],
                  message: `${e}`,
                });
              });
            payAmount = 0;
          }
        } else {
          console.log("tes");
        }
      } catch (e) {
        return res.status(504).json({
          code: 404,
          error: false,
          data: [],
          message: `${e}`,
        });
      }
    });
  } catch (e) {
    return res.status(504).json({
      code: 404,
      error: false,
      data: [],
      message: `${e}`,
    });
  }

  res.status(200).json({
    code: 200,
    error: false,
    message: "successfully",
    data: [],
  });
};

module.exports = controller;
