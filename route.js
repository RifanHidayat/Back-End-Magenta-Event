"use strict";
const { Router } = require("express");
const express = require("express");
const controller = require("./controller/index");
const purchaseOrder = require("./model/website/PurchaseOrder");
const purchaseReturn = require("./model/website/PurchaseReturn");
//const purchaseTransactions = require("./model/website/PurchaseTransaction");
const router = express.Router();
require("express-group-routes");

//grouping
const suppliers = "/api/supplier";
const products = "/api/product";
const purchases = "/api/purchase-order";
const purchaseTransactions = "/api/purchase-transaction";
const purchaseReceipts = "/api/purchase-receipt";
const purchaseReturns = "/api/purchase-return";
const purchaseReturnTransactions = "/api/purchase-return-transaction";

//show quotation
module.exports = function (app) {
  //website

  var json = require("./controller");
  app.route("/").get(json.index);

  //get data quotation
  app.route("/api/quotations").get(json.getAllDataQuotations);
  app.route("/api/quotations/checked").get(json.checkQuotations);
  app.route("/api/quotations/checked/all").get(json.checkQuotationsAll);

  app.route("/api/projects/project-number").get(json.getPojectNumber);
  app.route("/api/projects").get(json.getAllDataProjects);
  app.route("/api/projects/mobile").get(controller.projects.getProjects);

  app
    .route("/api/projects/:status/employees/:employee_id")
    .get(json.getAllDataProjectsByEmployees);

  app.route("/api/projects/:id/budgets").get(json.getBudgetsProject);

  app.route("/api/projects/:id/budgets/:type").get(json.getBudgetsProjectType);
  app.route("/api/projects/:id/budgets/:type").get(json.getBudgetsProjectType);

  app.route("/api/projects/create-project").post(json.createDataProjects);
  app.route("/api/projects/delete-project/:id").delete(json.deleteProject);
  app.route("/api/projects/detail-project/:id").get(json.getDetailProject);
  app.route("/api/projects/edit-project/:id").patch(json.editDataProjects);
  app.route("/api/project/:id/close").patch(controller.projects.closeProjects);
  app
    .route("/api/mobile/projects/detail-project/:id")
    .get(json.getDetailProjectMobile);

  app.route("/api/projects/:id/save-members").patch(json.saveMembers);
  //transaction project
  app
    .route("/api/projects/transaction-project")
    .post(json.createTransactionHangerBudget);

  //create transactioms
  app
    .route("/api/projects/create-transaction")
    .post(json.createTransactionProject);
  app
    .route("/api/projects/:id/transactions")
    .get(json.getAllTransactionsProject);
  app.route("/api/projects/count-status").get(json.getCountStatusProject);
  app
    .route("/api/projects/create-out-transaction")
    .post(json.createTransactionOutProject);

  //create task
  app.route("/api/projects/create-tasks").post(json.createTaskProject);
  app.route("/api/projects/delete-tasks").post(json.deleteTask);
  //detail task
  app.route("/api/projects/detail-tasks/:id").get(json.getTaskProject);
  app.route("/api/projects/:id/tasks").get(json.getTaskProject);
  app.route("/api/projects/task/:id").patch(json.editTaskProject);

  //approve
  app.route("/api/projects/approval/:id").patch(json.approvalProject);
  app.route("/api/projects/rejection/:id").patch(json.rejectionProject);
  app
    .route("/api/projects/detail-transactions/:id")
    .get(json.getDetailTransactionsProject);

  //show account
  app.route("/api/accounts").get(json.getAllAccount);
  //show detail account
  // app.route("/api/accounts/detail-account/:id").get(json.getDetailAccount);
  app
    .route("/api/accounts/detail-account/:id")
    .get(controller.bank_accounts.getDetailAccount);
  //create account
  app.route("/api/accounts/create-account").post(json.createAccount);
  //create account
  app.route("/api/accounts/edit-account/:id").patch(json.editAccount);
  //create account
  app.route("/api/accounts/delete-account/:id").delete(json.deleteAccount);
  app
    .route("/api/accounts/transaction-account")
    .post(json.createTransactionAccount);

  //budgets
  app.route("/api/budgets/create-budget").post(json.createBudget);
  app.route("/api/budgets/detail-budget/:id").get(json.getDetailBudgets);

  //pic
  app.route("/api/pic").get(json.getAllPIC);
  app.route("/api/pic/create-pictb").post(json.CreatePIC);
  app.route("/api/pic/pic-tb").get(json.getAllPICTB);
  app.route("/api/pic/delete-pictb/:id").delete(json.deletePICTB);
  app.route("/api/pic/detail-pictb/:id").get(json.getDetailPICTB);
  app.route("/api/pic/edit-pictb/:id").patch(json.EditPIC);
  app.route("/api/pic/create-transaction-pictb").post(json.createTransactionTB);
  app.route("/api/pict/add-saldo-pictb").post(json.addSaldoPICTB);
  app.route("/api/pict/add-saldo-pictb/:id").get(json.getAddSaldoPicTB);
  app.route("/api/pict/add-saldo-pictb/:id").delete(json.deleteAddSaldoPicTB);

  app.route("/api/faktur").get(json.getAllFaktur);

  // in transactions
  app.route("/api/transactions/in").post(json.createInTransation);
  app.route("/api/pictb/:id/transactions/in").get(json.getAllInTransaction);
  app
    .route("/api/transactions/in/:id/:faktur_id/:payment")
    .delete(json.deleteInTransaction);
  app.route("/api/transactions/in/:id").patch(json.editInTransation);

  //out transactions
  app.route("/api/transactions/out").post(json.createOutTransaction);
  // app.route("/api/pictb/:id/transactions/out").get(json.getAllOutTransaction);
  app
    .route("/api/transactions/out/:id/:project_id/:pictb_id")
    .delete(json.deleteOutTransactions);
  app
    .route("/api/transactions/out/:id/:project_id/:pictb_id")
    .patch(json.editOutTransaction);

  //cost project
  app.route("/api/projects/:project_id/cost").get(json.getAllCostProject);
  app.route("/api/projects/cost/:id").delete(json.deleteCostProject);
  app.route("/api/projects/cost/:id").patch(json.editTransactionOutProject);

  //int out
  app.route("/api/inout/inout-number").get(json.getInOutTransactions);
  app.route("/api/inout").post(json.createInOutTransaction);
  app.route("/api/inout").get(json.getAllInOutTransaction);
  app.route("/api/inout/:id").delete(json.deleteInOutTransaction);
  app.route("/api/inout/:id").patch(json.editInOutTransaction);

  const multer = require("multer");
  const storage = multer.memoryStorage({
    destination: function (req, file, callback) {
      callback(null, "");
    },
  });

  const upload = multer({ storage }).single("image");
  //mobile
  //   router.post(
  //     "/api/mobile/project/transactions",
  //     upload,
  //     controller.transaction_project.create
  //   );
  app.post(
    "/api/mobile/project/transactions",
    upload,
    controller.transaction_project.create
  );
  // app
  //   .route("/api/mobile/project/transactions", upload)
  //   .post(controller.transaction_project.create);
  app
    .route("/api/mobile/project/transactions/:id/:project_number")
    .delete(controller.transaction_project.delete);
  app
    .route("/api/mobile/project/transactions/:id")
    .patch(controller.transaction_project.update);
  app
    .route("/api/project/transactions/approval/:id")
    .patch(controller.transaction_project.approval);
  app
    .route("/api/project/transactions/rejection/:id")
    .patch(controller.transaction_project.rejection);

  app.route("/api/faktur/:id/payment").get(json.getAllFakturPayment);

  app.route("/api/faktur/:id/payment-qo").get(json.getAllFakturPaymentQO);

  app.route("/api/faktur/payment").post(json.creteTransactionFaktur);
  app.route("/api/faktur/payment-qo").post(json.creteTransactionFakturQO);

  app.route("/api/faktur/payment-number").get(json.getPaymentNumber);

  app.route("/api/faktur/transactions").get(json.getTransactionsfaktur);

  app
    .route("/api/faktur/transactions/:id")
    .get(json.getTransactionsfakturDetail);

  app.route("/api/login").post(controller.users.login);

  app
    .route("/api/faktur/:faktur_number/payment/invoice")
    .get(json.detailPaymentInvoice);
  app.route("/api/accounts/transaction/remaining").post(json.piutang);
  app.route("/api/company").patch(json.updateCompany);
  app.route("/api/employess/:id/attendance").get(json.attendacenEmployess);

  //transaction tb
  app.route("/api/add-tb-transactions").post(controller.transactionTB.create);
  app.route("/api/add-tb-transactions").get(controller.transactionTB.show);
  app
    .route("/api/add-tb-transactions/:pictb_id")
    .get(controller.transactionTB.manage);
  app
    .route("/api/add-tb-transactions/:id")
    .delete(controller.transactionTB.destroy);
  app
    .route("/add-tb-transactions/balance")
    .get(controller.transactionTB.balance);
  app
    .route("/api/pictb/:pictb_id/tb-transactions/quotation-po/:quotation_po_id")
    .get(controller.transactionTB.transactions);

  //quotation po
  app.route("/api/quotation-po").get(controller.quotationPO.show);

  app
    .route("/api/pictb/:pictb_id/quotation-po/balance/:quotation_po_id")
    .get(controller.quotationPO.balance);

  app.route("/api/quotation-po/:id").get(controller.quotationPO.transactions);
  app.route("/api/quotation-po/detail/:id").get(controller.quotationPO.detail);

  //out transactions
  app
    .route("/api/outTransactions/:pictb_id")
    .get(controller.outTransactions.manage);

  app
    .route("/api/pictb/:pictb_id/transactions/out")
    .get(controller.outTransactions.manage);

  //suppliers
  app.route(`${suppliers}`).get(controller.suppliers.show);
  app.route(`${suppliers}`).post(controller.suppliers.create);
  app.route(`${suppliers}/:id`).patch(controller.suppliers.update);
  app.route(`${suppliers}/:id`).delete(controller.suppliers.destroy);
  app.route(`${suppliers}/:id`).get(controller.suppliers.detail);
  app.route(`${suppliers}/pay/:id`).get(controller.suppliers.payment);
  app.route(`${suppliers}/pay`).post(controller.suppliers.pay);

  //Product
  app.route(`${products}`).get(controller.products.show);
  app.route(`${products}`).post(controller.products.create);
  app.route(`${products}/:id`).patch(controller.products.update);
  app.route(`${products}/:id`).delete(controller.products.destroy);
  app.route(`${products}/:id`).get(controller.products.detail);

  //Purchase order
  app.route(`${purchases}`).get(controller.purchaseOrder.show);
  app.route(`${purchases}`).post(controller.purchaseOrder.create);
  //app.route(`${purchases}`).post(controller.products.create);
  app.route(`${purchases}/:id`).patch(controller.products.update);
  app.route(`${purchases}/:id`).delete(controller.purchaseOrder.destroy);
  app.route(`${purchases}/:id`).get(controller.products.detail);
  app.route(`${purchases}/:id/product`).get(controller.purchaseOrder.products);

  //purchhase Transactions
  app
    .route(`${purchaseTransactions}`)
    .get(controller.purchaseTransactions.show);
  app
    .route(`${purchaseTransactions}`)
    .post(controller.purchaseTransactions.create);
  app
    .route(`${purchaseTransactions}/:id`)
    .patch(controller.purchaseTransactions.update);
  app
    .route(`${purchaseTransactions}/:id`)
    .delete(controller.purchaseOrder.destroy);
  app
    .route(`${purchaseTransactions}/:id`)
    .get(controller.purchaseTransactions.detail);

  //purchase receipt
  app.route(`${purchaseReceipts}`).get(controller.purchaseReceipts.show);
  app.route(`${purchaseReceipts}`).post(controller.purchaseReceipts.create);
  app
    .route(`${purchaseReceipts}/:id`)
    .patch(controller.purchaseReceipts.update);
  app
    .route(`${purchaseReceipts}/:id`)
    .delete(controller.purchaseReceipts.destroy);
  app.route(`${purchaseReceipts}/:id`).get(controller.purchaseReceipts.detail);
  app
    .route(`${purchaseReceipts}/:id/product`)
    .get(controller.purchaseReceipts.products);
  app
    .route(`${purchaseReceipts}/:id/history`)
    .get(controller.purchaseReceipts.history);

  //purchase return
  app.route(`${purchaseReturn}`).get(controller.purchaseReturns.show);
  app.route(`${purchaseReturns}`).post(controller.purchaseReturns.create);
  app.route(`${purchaseReturns}/:id`).patch(controller.purchaseReturns.update);
  app
    .route(`${purchaseReturns}/:id`)
    .delete(controller.purchaseReturns.destroy);
  app.route(`${purchaseReturn}/:id`).get(controller.purchaseReturns.detail);
  app
    .route(`${purchaseReturns}/:id/product`)
    .get(controller.purchaseReturns.products);
  app
    .route(`${purchaseReturns}/:id/history`)
    .get(controller.purchaseReturns.history);

  //Purchase return transaction
  app
    .route(`${purchaseReturnTransactions}`)
    .get(controller.purchaseReturnTransactions.show);
  app
    .route(`${purchaseReturnTransactions}`)
    .post(controller.purchaseReturnTransactions.create);
  app.route(`${purchaseReturnTransactions}`).post(controller.products.create);
  app
    .route(`${purchaseReturnTransactions}/:id`)
    .patch(controller.products.update);
  app
    .route(`${purchaseReturnTransactions}/:id`)
    .delete(controller.purchaseOrder.destroy);
  app
    .route(`${purchaseReturnTransactions}/:id`)
    .get(controller.purchaseReturnTransactions.detail);
  app
    .route(`${purchaseReturnTransactions}/:id/product`)
    .get(controller.purchaseReturnTransactions.products);
};
