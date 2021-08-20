"use strict";
const { Router } = require("express");
const express = require("express");
const controller = require("./controller/index");
const router = express.Router();

//show quotation
module.exports = function (app) {
  //website

  var json = require("./controller");
  app.route("/").get(json.index);

  //get data quotation
  app.route("/api/quotations").get(json.getAllDataQuotations);

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
  app.route("/api/accounts/detail-account/:id").get(json.getDetailAccount);
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
  app.route("/api/pictb/:id/transactions/out").get(json.getAllOutTransaction);
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
};
