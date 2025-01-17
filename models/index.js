const { sequelize } = require('../config/db');
const User = require('./User');
const Account = require('./Account');
const Transaction = require('./Transaction');
const Loan = require('./Loan');
const LoanRepayment = require('./LoanRepayment');
const TransferRequest = require('./TransferRequest');
const SavingsPlan = require('./SavingsPlan');
const InterestLog = require('./InterestLog');
const MonthlyStatement = require('./MonthlyStatement');
const Token = require('./Token');

// Define associations
User.hasMany(Account, { foreignKey: 'userId', onDelete: 'CASCADE' });
Account.belongsTo(User, { foreignKey: 'userId' });

Account.hasMany(Transaction, { foreignKey: 'accountId', onDelete: 'CASCADE' });
Transaction.belongsTo(Account, { foreignKey: 'accountId' });

Account.hasMany(Loan, { foreignKey: 'accountId', onDelete: 'CASCADE' });
Loan.belongsTo(Account, { foreignKey: 'accountId' });

Loan.hasMany(LoanRepayment, { foreignKey: 'loanId', onDelete: 'CASCADE' });
LoanRepayment.belongsTo(Loan, { foreignKey: 'loanId' });

Account.hasMany(TransferRequest, { foreignKey: 'fromAccountId', onDelete: 'CASCADE' });
Account.hasMany(TransferRequest, { foreignKey: 'toAccountId', onDelete: 'CASCADE' });
TransferRequest.belongsTo(Account, { foreignKey: 'fromAccountId' });
TransferRequest.belongsTo(Account, { foreignKey: 'toAccountId' });

User.hasMany(SavingsPlan, { foreignKey: 'userId', onDelete: 'CASCADE' });
SavingsPlan.belongsTo(User, { foreignKey: 'userId' });

Account.hasMany(InterestLog, { foreignKey: 'accountId', onDelete: 'CASCADE' });
InterestLog.belongsTo(Account, { foreignKey: 'accountId' });

Account.hasMany(MonthlyStatement, { foreignKey: 'accountId', onDelete: 'CASCADE' });
MonthlyStatement.belongsTo(Account, { foreignKey: 'accountId' });

User.hasMany(Token, { foreignKey: 'userId', onDelete: 'CASCADE' });
Token.belongsTo(User, { foreignKey: 'userId' });

// Sync all models
(async () => {
    await sequelize.sync({ alter: true });
    console.log('Database synced!');
})();

module.exports = { User, Account, Transaction, Loan, LoanRepayment, TransferRequest, SavingsPlan, InterestLog, MonthlyStatement, Token };
