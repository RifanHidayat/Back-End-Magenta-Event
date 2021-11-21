//website
const bank_accounts = require("./website/accounts");
const projects = require("./website/projects");
const budget_project = require("./website/budgets");
const users = require("./website/users");
const transactionTB = require("./website/TransactionTBController");
const quotationPO = require("./website/QuotationPOController");
const outTransactions = require("./website/OutTransactionController");
const suppliers = require("./website/SupplierController");
const products = require("./website/ProductController");
const purchaseOrder = require("./website/PurchaseOrderController");
const purchaseTransactions = require("./website/PurchaseTransactionController");
const purchaseReceipts = require("./website/PurchaseReceiptController");
const purchaseReturns = require("./website/PurchaseReturnController");
const purchaseReturnTransactions = require("./website/PurchaseReturnTransctionController");

//mobile
const transaction_project = require("./mobile/BudgetTransactionController");
const faktur = require("./website/faktur");

const controller = {};
controller.bank_accounts = bank_accounts;
controller.projects = projects;
controller.budget_project = budget_project;
controller.transaction_project = transaction_project;
controller.faktur = faktur;
controller.users = users;
controller.transactionTB = transactionTB;
controller.quotationPO = quotationPO;
controller.outTransactions = outTransactions;
controller.suppliers = suppliers;
controller.products = products;
controller.purchaseOrder = purchaseOrder;
controller.purchaseTransactions = purchaseTransactions;
controller.purchaseReceipts = purchaseReceipts;
controller.purchaseReturns = purchaseReturns;
controller.purchaseReturnTransactions = purchaseReturnTransactions;

module.exports = controller;

// controller.history = async function (req, res) {
//   let sum = 0;
//   try {
//     let id = req.params.id;
//     let purchaseReceiptSql = `SELECT *,purchase_receipt_product.quantity as quantity  FROM purchase_receipt JOIN purchase_receipt_product ON purchase_receipt_product.purchaseReceiptId=purchase_receipt.id where purchase_receipt.purchaseOrderId=${id}`;
//     let purchaseOrderProductSql = `SELECT * , product.code as code,purchase_order_product.quantity as quantity FROM  purchase_order_product JOIN product ON product.id=purchase_order_product.productId JOIN purchase_order ON purchase_order.id=purchase_order_product.purchaseOrderId where purchase_order_product.purchaseOrderId=${id}`;
//     let purchaseOrderProduct = await db.query(purchaseOrderProductSql);
//     let purchaseReceiptProduct = await db.query(purchaseReceiptSql);

//     if (purchaseOrderProduct.length > 0) {
//       const purchaseReceipt = collect(purchaseOrderProduct[0]).each(function (
//         item
//       ) {
//         var purchaseReceipt = collect(purchaseReceiptProduct[0]).where(
//           "productId",
//           "==",
//           item.productId
//         );
//         let sum = purchaseReceipt.reduce(function (accumulator, current) {
//           return accumulator + current.quantity;
//         });
//         if (sum !== null) {
//           item["receipt_quantity"] = sum;
//           item["remaining_quantity"] = item.quantity - sum;

//           item["purchase_receipt"] = purchaseReceipt;
//         } else {
//           item["receipt_quantity"] = 0;
//           item["purchase_receipt"] = purchaseReceipt;
//           item["remaining_quantity"] = item.quantity;
//         }

//         // item["receipt_quantity"] = 1;
//       });

//       res.status(200).json({
//         code: 200,
//         error: false,
//         message: "successfully",
//         data: purchaseReceipt,
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
