const model = require("../../model/index");
const { Op, where } = require("sequelize");
const db = require("../../database/magenta_eo");
const sequelize = require("sequelize");
const controller = {};

const dateFormat = require("dateformat");
const {
  purchaseReceipt,
  purchaseReturns,
  purchaseReceiptProduct,
} = require("../../model/index");

const collect = require("collect.js");
const { purchaseReceipts } = require("..");
controller.show = async function (req, res) {};

controller.create = async function (req, res) {
  let note = req.body.note;
  let date = req.body.date;
  let returnQuantity = req.body.return_quantity;
  let returnAmount = req.body.return_amount;
  let supplierId = req.body.supplier_id;
  let purchaseOrderId = req.body.purchase_order_id;
  let selectedProducts = req.body.selected_products;
  let purchaseReturnCode;

  let nextday = dateFormat(new Date(date).getTime() + 86400000, "yyyy-mm-dd");
  await model.purchaseReturns
    .count({
      where: {
        date: {
          [Op.between]: [date, nextday],
        },
      },
    })
    .then((response) => {
      var count = Math.floor(100000 + Number(response + 1));

      purchaseReturnCode =
        "PR" +
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

  try {
    model.purchaseReturns
      .create({
        code: purchaseReturnCode,
        date: dateFormat(date, "yyyy-mm-dd"),
        accountId: 0,
        supplierId: supplierId,
        purchaseOrderId: purchaseOrderId,
        quantity: 1,
        amount: returnAmount,
        note: note,
      })
      .then((response) => {
        try {
          selectedProducts.map((item) => {
            model.purchaseReturnProducts
              .create({
                purchaseReturnId: response.id,
                productId: item.productId,
                price: item.price,
                quantity: item.return_quantity,
                amount: item.amount,
                cause: "1",
              })
              .then((response) => {})
              .catch((e) => {
                res.status(404).json({
                  code: 404,
                  error: true,
                  message: `${e}`,
                  data: [],
                });
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
          selectedProducts.map((item) => {
            //save
            model.products
              .update(
                {
                  stock: Number(item.stock) - Number(item.return_quantity),
                },
                {
                  where: {
                    id: item.productId,
                  },
                }
              )
              .then((response) => {})
              .catch((e) => {
                res.status(404).json({
                  code: 404,
                  error: true,
                  message: `${e}`,
                  data: [],
                });
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
      })
      .catch((e) => {
        res.status(404).json({
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

  res.status(200).json({
    code: 200,
    error: false,
    message: "Data has been saveda",
    data: [],
  });
};

controller.update = async function (req, res) {};
controller.destroy = async function (req, res) {
  try {
    let id = req.params.id;
    let purchaseReturnProducts = await model.purchaseReturnProducts.findAll({
      where: { purchaseReturnId: id },
    });
    let products = await model.products.findAll({});

    collect(products).each((product) => {
      collect(purchaseReturnProducts).each((item) => {
        model.products
          .update(
            { stock: Number(product.stock) + Number(item.quantity) },
            {
              where: { id: item.productId },
            }
          )
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
    });
    // purchaseReceiptProduct.map((item) => {
    //   model.products
    //     .update(
    //       {
    //         where: { id: item.productId },
    //       },
    //       {
    //         stock: item,
    //       }
    //     )
    //     .then((response) => {})
    //     .catch((e) => {
    //       return res.status(404).json({
    //         code: 404,
    //         error: true,
    //         message: `1${e}`,
    //         data: [],
    //       });
    //     });
    // });

    // await model.purchaseReturnProducts
    //   .findOne({ where: { purchaseReturnId: id } })
    //   .then((response) => {
    //     let products = await model.products.findAll({
    //       where: { id: 4 },
    //     });
    // return res.status(200).json({
    //   code: 200,
    //   error: false,
    //   message: "Data has been saveda",
    //   data: products,
    // });

    await model.purchaseReturns
      .destroy({
        where: { id: id },
      })
      .then((response) => {
        model.purchaseReturnProducts
          .destroy({
            where: { purchaseReturnId: id },
          })
          .then((response) => {
            return res.status(200).json({
              code: 200,
              error: false,
              message: "Data has been deleted",
              data: [],
            });
          })
          .catch((e) => {
            return res.status(404).json({
              code: 404,
              error: true,
              message: `1${e}`,
              data: [],
            });
          });
      })
      .catch((e) => {
        return res.status(404).json({
          code: 404,
          error: true,
          message: `3s${e}`,
          data: [],
        });
      });
  } catch (e) {
    return res.status(404).json({
      code: 404,
      error: true,
      message: `2${e}`,
      data: [],
    });
  }
};
controller.detail = async function (req, res) {};

// controller.history = async function (req, res) {
//   try {
//     let id = req.params.id;
//     let sql = `SELECT *  FROM purchase_return JOIN purchase_return_product ON purchase_return_product.purchaseReturnId=purchase_return.id where purchase_return.purchaseOrderId=${id}`;
//     let response = await db.query(sql);
//     if (response.length > 0) {
//       const collectt = collect(response[0]).each(function (item) {
//         item["data"] = 1;
//       });

//       res.status(200).json({
//         code: 200,
//         error: false,
//         message: "successfully",
//         data: collectt,
//       });
//     } else {
//       res.status(200).json({
//         code: 200,
//         error: false,
//         message: "successfully",
//         data: [],
//       });
//     }
//   } catch (e) {
//     res.status(404).json({
//       code: 404,
//       error: false,
//       data: [],
//       message: `${e}`,
//     });
//   }
// };

controller.history = async function (req, res) {
  try {
    let id = req.params.id;
    // let sql = `SELECT *  FROM purchase_receipt JOIN purchase_receipt_product ON purchase_receipt_product.purchaseReceiptId=purchase_receipt.id where purchase_receipt.purchaseOrderId=${id}`;

    let purchaseReceiptSql = `SELECT *  FROM purchase_return where purchase_return.purchaseOrderId=${id}`;
    let purchaseReceiptProductSql = `SELECT * ,product.code as code  FROM purchase_return_product JOIN product ON product.id=purchase_return_product.productId`;

    let purchaseReceipt = await db.query(purchaseReceiptSql);
    let responseReceiptProduct = await db.query(purchaseReceiptProductSql);
    if (purchaseReceipt.length > 0) {
      const purchaseReceiptCollect = collect(purchaseReceipt[0]).each(function (
        item
      ) {
        var purchaseReceiptProduct = collect(responseReceiptProduct[0]).where(
          "purchaseReturnId",
          "==",
          item.id
        );
        item["purchase_return_product"] = purchaseReceiptProduct;
      });
      res.status(200).json({
        code: 200,
        error: false,
        message: "successfully",
        data: purchaseReceiptCollect,
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

// controller.products = async function (req, res) {
//   try {
//     purchaseReturnProductSql="SELECT * FROM purchase_return_product JOIN product ON product.id=purchase_return_product.productId WHERE  purchaseReturn"

//   } catch (e) {

//   }
// };

controller.products = async function (req, res) {
  let sum = 0;
  try {
    let id = req.params.id;
    let purchaseReceiptSql = `SELECT *,purchase_receipt_product.quantity as quantity  FROM purchase_receipt JOIN purchase_receipt_product ON purchase_receipt_product.purchaseReceiptId=purchase_receipt.id where purchase_receipt.purchaseOrderId=${id}`;
    let purchaseOrderProductSql = `SELECT * , product.code as code,purchase_order_product.quantity as quantity FROM  purchase_order_product JOIN product ON product.id=purchase_order_product.productId JOIN purchase_order ON purchase_order.id=purchase_order_product.purchaseOrderId where purchase_order_product.purchaseOrderId=${id}`;
    let purchaseReturnproductSql = `SELECT *,purchase_return_product.quantity as quantity  FROM purchase_return JOIN purchase_return_product ON purchase_return_product.purchaseReturnId=purchase_return.id where purchase_return.purchaseOrderId=${id}`;

    let purchaseOrderProduct = await db.query(purchaseOrderProductSql);
    let purchaseReceiptProduct = await db.query(purchaseReceiptSql);
    let purchaseReturnProductt = await db.query(purchaseReturnproductSql);

    if (purchaseOrderProduct.length > 0) {
      const purchaseReturns = collect(purchaseOrderProduct[0]).each(function (
        item
      ) {
        //purchase receipt
        var purchaseReceipt = collect(purchaseReceiptProduct[0]).where(
          "productId",
          "==",
          item.productId
        );
        let sum = purchaseReceipt.reduce(function (accumulator, current) {
          return accumulator + current.quantity;
        });
        if (sum !== null) {
          item["receipt_quantity"] = sum;
        } else {
          item["receipt_quantity"] = 0;
        }

        //purchase return
        var purchaseReturns = collect(purchaseReturnProductt[0]).where(
          "productId",
          "==",
          item.productId
        );
        let purchaseReturnQuantity = purchaseReturns.reduce(function (
          accumulator,
          current
        ) {
          return accumulator + current.quantity;
        });
        if (purchaseReturnQuantity !== null) {
          item["returned_quantity"] = purchaseReturnQuantity;
          item["remaining_quantity"] = sum - purchaseReturnQuantity;
        } else {
          item["returned_quantity"] = 0;

          item["remaining_quantity"] = sum;
        }
        item["purchase_receipt"] = purchaseReceipt;
      });

      const purchaseReturnProduct = purchaseReturns.filter(
        (item, key) => item.receipt_quantity > 0
      );

      purchaseReturnProduct.all();

      res.status(200).json({
        code: 200,
        error: false,
        message: "successfully",
        data: purchaseReturnProduct,
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
