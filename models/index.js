// models/index.js
const User = require('./User');
const Token = require('./Token');
const Account = require('./Account');
const Transaction = require('./Transaction');
const Loan = require('./Loan');
const LoanRepayment = require('./LoanRepayment');

// Define associations
User.hasMany(Account); // One user can have many accounts
Account.belongsTo(User); // Each account belongs to one user

Account.hasMany(Transaction); // One account can have many transactions
Transaction.belongsTo(Account); // Each transaction belongs to one account

User.hasMany(Loan); // One user can apply for many loans
Loan.belongsTo(User); // Each loan belongs to one user

Loan.hasMany(LoanRepayment); // One loan can have many repayments
LoanRepayment.belongsTo(Loan); // Each repayment belongs to one loan

User.hasMany(Token); // One user can have many tokens
Token.belongsTo(User); // Each token belongs to one user

// Export all models
module.exports = { User, Account, Transaction, Loan, LoanRepayment,Token };
