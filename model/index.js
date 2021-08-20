//website
const bank_accounts = require('./website/accounts')
const projects = require('./website/projects')
const budget_project = require('./website/budgets')
const accounts = require('./mobile/AccountModel')
const faktur = require('./website/faktur')
const users=require('./website/users')

//mobile
const transaction_project = require('./mobile/BudgetTransactionModel')
const transaction_project_lr = require('./mobile/TransactionProject')

const model={}

model.projects=projects
model.bank_accounts=bank_accounts
model.budget_project=budget_project
model.transaction_project=transaction_project
model.accounts=accounts;
model.transaction_project_lr=transaction_project_lr

model.users=users;

model.faktur=faktur;

module.exports=model
