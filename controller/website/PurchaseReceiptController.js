const model = require("../../model/index");
const { Op, where } = require("sequelize");
const db = require("../../database/magenta_eo");
const sequelize = require("sequelize");
const controller = {};

const dateFormat = require("dateformat");
const { purchaseReceipt } = require("../../model/index");

const collect = require("collect.js");
//const purchaseReceiptProduct = require("../../model/website/PurchaseReceiptProduct");
controller.show = async function (req, res) {};

controller.create = async function (req, res) {
  let date = req.body.date;
  let purchaseOrderId = req.body.purchase_order_id;
  let quantityReceipt = "1";
  let supplierId = req.body.supplier_id;
  let note = req.body.note;
  let selectedProducts = req.body.selected_products;
  let purchaseReceiptCode;
  let nextday = dateFormat(new Date(date).getTime() + 86400000, "yyyy-mm-dd");

  //products

  $prodcuts = await model.products.findAll({});

  await model.purchaseReceipt
    .count({
      where: {
        date: {
          [Op.between]: [date, nextday],
        },
      },
    })
    .then((response) => {
      var count = Math.floor(100000 + Number(response + 1));

      purchaseReceiptCode =
        "PRP" +
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
    await model.purchaseReceipt
      .create({
        code: purchaseReceiptCode,
        date: date,
        supplierId: supplierId,
        purchaseOrderId: purchaseOrderId,
        quantity: quantityReceipt,
        note: note,
      })
      .then((response) => {
        try {
          selectedProducts.map((item) => {
            //save
            model.purchaseReceiptProduct
              .create({
                purchaseReceiptId: response.id,
                productId: item.productId,
                quantity: item.receipt_quantity,
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
                  stock: Number(item.stock) + Number(item.receipt_quantity),
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
  res.status(200).json({
    code: 200,
    error: false,
    message: "Data has been saved",
    data: [],
  });
};

controller.update = async function (req, res) {};
controller.destroy = async function (req, res) {
  try {
    let id = req.params.id;
    await model.purchaseReceipt
      .destroy({
        where: { id: id },
      })
      .then((response) => {
        res.status(200).json({
          code: 200,
          error: false,
          message: "Data has been deleted",
          data: [],
        });
        model.purchaseReceiptProduct
          .destroy({
            where: { purchaseReeiptId: id },
          })
          .then((response) => {
            res.status(200).json({
              code: 200,
              error: false,
              message: "Data has been deleted",
              data: [],
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
      })
      .catch((e) => {
        res.status(404).json({
          code: 404,
          error: true,
          message: `1${e}`,
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
controller.detail = async function (req, res) {};

// controller.products = async function (req, res) {
//   try {
//     let id = req.params.id;
//     let sql = `SELECT * , product.code as code,purchase_order_product.quantity as quantity FROM  purchase_order_product JOIN product ON product.id=purchase_order_product.productId JOIN purchase_order ON purchase_order.id=purchase_order_product.purchaseOrderId where purchase_order_product.purchaseOrderId=${id}`;
//     let response = await db.query(sql);
//     if (response.length > 0) {
//       res.status(200).json({
//         code: 200,
//         error: false,
//         message: "successfully",
//         data: response[0],
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

    let purchaseReceiptSql = `SELECT *  FROM purchase_receipt where purchase_receipt.purchaseOrderId=${id}`;
    let purchaseReceiptProductSql = `SELECT * ,product.code as code  FROM purchase_receipt_product JOIN product ON product.id=purchase_receipt_product.productId`;

    let purchaseReceipt = await db.query(purchaseReceiptSql);
    let responseReceiptProduct = await db.query(purchaseReceiptProductSql);
    if (purchaseReceipt.length > 0) {
      const purchaseReceiptCollect = collect(purchaseReceipt[0]).each(function (
        item
      ) {
        var purchaseReceiptProduct = collect(responseReceiptProduct[0]).where(
          "purchaseReceiptId",
          "==",
          item.id
        );
        item["purchase_receipt_product"] = purchaseReceiptProduct;
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

controller.products = async function (req, res) {
  let sum = 0;
  try {
    let id = req.params.id;
    let purchaseReceiptSql = `SELECT *,purchase_receipt_product.quantity as quantity  FROM purchase_receipt JOIN purchase_receipt_product ON purchase_receipt_product.purchaseReceiptId=purchase_receipt.id where purchase_receipt.purchaseOrderId=${id}`;
    let purchaseOrderProductSql = `SELECT * , product.code as code,purchase_order_product.quantity as quantity FROM  purchase_order_product JOIN product ON product.id=purchase_order_product.productId JOIN purchase_order ON purchase_order.id=purchase_order_product.purchaseOrderId where purchase_order_product.purchaseOrderId=${id}`;
    let purchaseOrderProduct = await db.query(purchaseOrderProductSql);
    let purchaseReceiptProduct = await db.query(purchaseReceiptSql);

    if (purchaseOrderProduct.length > 0) {
      const purchaseReceipt = collect(purchaseOrderProduct[0]).each(function (
        item
      ) {
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
          item["remaining_quantity"] = item.quantity - sum;

          item["purchase_receipt"] = purchaseReceipt;
        } else {
          item["receipt_quantity"] = 0;
          item["purchase_receipt"] = purchaseReceipt;
          item["remaining_quantity"] = item.quantity;
        }

        // item["receipt_quantity"] = 1;
      });

      const purchaseReturnProduct = purchaseReceipt.filter(
        (item, key) => item.remaining_quantity > 0
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
