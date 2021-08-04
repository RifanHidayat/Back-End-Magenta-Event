//website
const bank_accounts = require('./website/accounts')
const projects = require('./website/projects')
const budget_project = require('./website/budgets')
const accounts = require('./mobile/AccountModel')
const faktur = require('./website/faktur')

//mobile
const transaction_project = require('./mobile/BudgetTransactionModel')

const model={}

model.projects=projects
model.bank_accounts=bank_accounts
model.budget_project=budget_project
model.transaction_project=transaction_project
model.accounts=accounts;

model.faktur=faktur;

module.exports=model
