
//website
const bank_accounts=require('./website/accounts')
const projects=require('./website/projects')
const budget_project=require('./website/budgets')
const users=require('./website/users')

//mobile
const transaction_project=require('./mobile/BudgetTransactionController')

const faktur=require('./website/faktur')


const controller ={}


controller.bank_accounts=bank_accounts
controller.projects=projects
controller.budget_project=budget_project
controller.transaction_project=transaction_project
controller.faktur=faktur;
controller.users=users;

module.exports=controller