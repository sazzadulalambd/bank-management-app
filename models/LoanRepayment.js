const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LoanRepayment = sequelize.define('LoanRepayment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    loanId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Loans', key: 'id' } },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    paymentDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    method: { type: DataTypes.ENUM('bankTransfer', 'cash', 'check'), allowNull: false },
}, {
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
});

module.exports = LoanRepayment;
