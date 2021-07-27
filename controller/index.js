
//website
const bank_accounts=require('./website/accounts')
const projects=require('./website/projects')
const budget_project=require('./website/budgets')

//mobile
const transaction_project=require('./mobile/BudgetTransactionController')


const controller ={}
controller.bank_accounts=bank_accounts
controller.projects=projects
controller.budget_project=budget_project
controller.transaction_project=transaction_project


module.exports=controller