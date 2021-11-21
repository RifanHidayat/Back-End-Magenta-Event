//website
const bank_accounts = require("./website/accounts");
const projects = require("./website/projects");
const budget_project = require("./website/budgets");
const accounts = require("./website/accounts");
const faktur = require("./website/faktur");
const users = require("./website/users");
const transactionTB = require("./website/TransactionTB");
const quotationPO = require("./website/QuotationPO");
const outTransactions = require("./website/OutTransactions");
const picTB = require("./website/PicTB");
const picCEvent = require("./website/PicTB");
const projectTransactions = require("./website/ProjectTransaction");
const accountTransactions = require("./website/AccountTransaction");
const suppliers = require("./website/Supplier");
const products = require("./website/Product");
const purchaseOrder = require("./website/PurchaseOrder");
const purchaseOrderProduct = require("./website/PurchaseOrderProduct");
const purchaseOrderPurchaseTransaction = require("./website/PurchaseTransaction");
const purchaseTransactions = require("./website/PurchaseTransaction");
const purchaseReceipt = require("./website/PurchaseReceipt");
const purchaseReceiptProduct = require("./website/PurchaseReceiptProduct");
const purchaseReturns = require("./website/PurchaseReturn");
const purchaseReturnProducts = require("./website/PurchaseReturnProduct");
const purchaseReturnTransactions = require("./website/PurchaseReturnTransaction");

//mobile
const transaction_project = require("./mobile/BudgetTransactionModel");
const transaction_project_lr = require("./mobile/TransactionProject");
const pictb = require("./website/PicTB");
const picEvent = require("./website/PicEvent");

const model = {};

model.projects = projects;
model.bank_accounts = bank_accounts;
model.budget_project = budget_project;
model.transaction_project = transaction_project;
model.accounts = accounts;
model.transaction_project_lr = transaction_project_lr;
model.transactionTB = transactionTB;
model.quotationPO = quotationPO;
model.PicTB = pictb;
model.picCEvent = picEvent;
model.outTransactions = outTransactions;
model.projectTransactions = projectTransactions;
model.users = users;
model.faktur = faktur;
model.accountTransactions = accountTransactions;
model.suppliers = suppliers;
model.products = products;
model.purchaseOrder = purchaseOrder;
model.purchaseOrderProduct = purchaseOrderProduct;
model.purchaseOrderPurchaseTransaction = purchaseOrderPurchaseTransaction;
model.purchaseTransactions = purchaseTransactions;
model.purchaseReceipt = purchaseReceipt;
model.purchaseReceiptProduct = purchaseReceiptProduct;
model.purchaseReturns = purchaseReturns;
model.purchaseReturnProducts = purchaseReturnProducts;
model.purchaseReturnTransactions = purchaseReturnTransactions;

module.exports = model;
