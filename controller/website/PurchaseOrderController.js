const model = require("../../model/index");
const { Op, where } = require("sequelize");
const db = require("../../database/magenta_eo");
const sequelize = require("sequelize");
const controller = {};

const dateFormat = require("dateformat");
const purchaseTransactions = require("../../model/website/PurchaseTransaction");

const hppAccount = "111";

controller.show = async function (req, res) {
  try {
    await model.purchaseOrder
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
  //  let code = req.body.code;

  let date = req.body.date;
  let supplierId = req.body.supplier_id;
  let accountId = req.body.account_id;
  let shipping_cost = req.body.shipping_cost;
  let discount = req.body.discount;
  let payAmount = req.body.pay_amount;
  let selectedProducts = req.body.selected_products;
  let netTotal = req.body.net_total;
  let total = req.body.total;
  let purchaseOrderCode;
  let purchaseTransactionCode;

  let nextday = dateFormat(new Date(date).getTime() + 86400000, "yyyy-mm-dd");
  await model.purchaseOrder
    .count({
      where: {
        date: {
          [Op.between]: [date, nextday],
        },
      },
    })
    .then((response) => {
      var count = Math.floor(100000 + Number(response + 1));

      purchaseOrderCode =
        "PO-" +
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

  try {
    model.purchaseTransactions
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

  try {
    await model.purchaseOrder
      .create({
        code: purchaseOrderCode,
        date: date,
        supplierId: supplierId,
        accountId: accountId,
        shipping_cost: shipping_cost,
        discount: discount,
        pay_amount: payAmount,
        net_total: netTotal,
        total: total,
      })
      .then((response) => {
        //save products
        try {
          selectedProducts.map((item) => {
            model.purchaseOrderProduct
              .create({
                purchaseOrderId: response.id,
                productId: 0,
                stock: 0,
                price: item.purchase_price,
                quantity: item.quantity,
                discount: item.discount,
                description: item.description,
              })
              .then((response) => {})
              .catch((e) => {
                return res.status(404).json({
                  code: 404,
                  error: true,
                  message: `${e}`,
                  data: [],
                });
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

        try {
          model.purchaseTransactions
            .create({
              code: purchaseTransactionCode,
              accountId: accountId,
              supplierId: supplierId,
              purchaseOrderId: response.id,
              amount: payAmount,
              note: "",
              date: date,
            })
            .then((response) => {
              //account transaction
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
        // res.status(200).json({
        //   code: 200,
        //   error: false,
        //   message: "Data has been saved",
        //   data: response,
        // });
      })
      .catch((e) => {
        return res.status(404).json({
          code: 404,
          error: true,
          message: `1${e}`,
          data: [],
        });
      });
  } catch (e) {
    return res.status(404).json({
      code: 404,
      error: true,
      message: `a${e}`,
      data: [],
    });
  }
};

controller.create = async function (req, res) {
  //  let code = req.body.code;

  let date = req.body.date;
  let id = req.body.id;
  let supplierId = req.body.supplier_id;
  let accountId = req.body.account_id;
  let shipping_cost = req.body.shipping_cost;
  let discount = req.body.discount;
  let payAmount = req.body.pay_amount;
  let selectedProducts = req.body.selected_products;
  let netTotal = req.body.net_total;
  let total = req.body.total;
  let purchaseOrderCode;
  let purchaseTransactionCode;

  let nextday = dateFormat(new Date(date).getTime() + 86400000, "yyyy-mm-dd");
  await model.purchaseOrder
    .count({
      where: {
        date: {
          [Op.between]: [date, nextday],
        },
      },
    })
    .then((response) => {
      var count = Math.floor(100000 + Number(response + 1));

      purchaseOrderCode =
        "PO-" +
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

  try {
    model.purchaseTransactions
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

  try {
    await model.purchaseOrder
      .update(
        {
          where: { id: id },
        },
        {
          // code: purchaseOrderCode,
          date: date,
          supplierId: supplierId,
          accountId: accountId,
          shipping_cost: shipping_cost,
          discount: discount,
          pay_amount: payAmount,
          net_total: netTotal,
          total: total,
        }
      )
      .then((response) => {
        try {
          model.purchaseOrderProduct
            .delete({
              where: { purchaseOrderId: id },
            })
            .then((response) => {})
            .catch((e) => {});
        } catch (e) {
          return res.status(404).json({
            code: 404,
            error: true,
            message: `${e}`,
            data: [],
          });
        }
        //save products
        try {
          selectedProducts.map((item) => {
            model.purchaseOrderProduct
              .create({
                purchaseOrderId: response.id,
                productId: 0,
                stock: 0,
                price: item.purchase_price,
                quantity: item.quantity,
                discount: item.discount,
                description: item.description,
              })
              .then((response) => {})
              .catch((e) => {
                return res.status(404).json({
                  code: 404,
                  error: true,
                  message: `${e}`,
                  data: [],
                });
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

        try {
          model.purchaseTransactions
            .create({
              code: purchaseTransactionCode,
              accountId: accountId,
              supplierId: supplierId,
              purchaseOrderId: response.id,
              amount: payAmount,
              note: "",
              date: date,
            })
            .then((response) => {
              //account transaction
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
        // res.status(200).json({
        //   code: 200,
        //   error: false,
        //   message: "Data has been saved",
        //   data: response,
        // });
      })
      .catch((e) => {
        return res.status(404).json({
          code: 404,
          error: true,
          message: `1${e}`,
          data: [],
        });
      });
  } catch (e) {
    return res.status(404).json({
      code: 404,
      error: true,
      message: `a${e}`,
      data: [],
    });
  }
};
controller.destroy = async function (req, res) {
  try {
    let id = req.params.id;
    await model.purchaseOrder
      .destroy({
        where: { id: id },
      })
      .then((response) => {
        model.purchaseOrderProduct
          .destroy({
            where: { purchaseOrderId: id },
          })
          .then((response) => {
            model.purchaseTransactions
              .destroy({
                where: { purchaseOrderId: id },
              })
              .then((response) => {
                console.log(response);
                return res.status(200).json({
                  code: 200,
                  error: false,
                  message: `Data has been deleted`,
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
    let id = req.params.id;
    await model.purchaseTransactions
      .findAll({
        where: {
          id: id,
        },
      })
      .then((response) => {
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
    let id = req.params.id;
    let sql = `SELECT *, purchase_order_product.discount as discount FROM  purchase_order_product  JOIN purchase_order ON purchase_order.id=purchase_order_product.purchaseOrderId where purchase_order_product.purchaseOrderId=${id}`;
    // let sql = `SELECT *, purchase_order_product.discount as discount FROM  purchase_order_product JOIN product ON product.id=purchase_order_product.productId JOIN purchase_order ON purchase_order.id=purchase_order_product.purchaseOrderId where purchase_order_product.purchaseOrderId=${id}`;
    let response = await db.query(sql);
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
