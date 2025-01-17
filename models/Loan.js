const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Loan = sequelize.define('Loan', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    accountId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Accounts', key: 'id' } },
    loanType: { type: DataTypes.ENUM('personal', 'business', 'mortgage'), allowNull: false },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    interestRate: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    repaymentSchedule: { type: DataTypes.JSON },
    status: { type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'), defaultValue: 'pending' },
    penalty: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.00 },
}, {
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
});

module.exports = Loan;
