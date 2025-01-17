const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Transaction = sequelize.define('Transaction', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    accountId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Accounts', key: 'id' } },
    transactionType: { type: DataTypes.ENUM('deposit', 'withdrawal', 'transfer'), allowNull: false },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    fee: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.00 },
    relatedAccountNumber: { type: DataTypes.STRING(255), allowNull: true },
}, {
    timestamps: true, // Enable automatic timestamps
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    hooks: {
        beforeCreate: async (transaction) => {
            if (transaction.amount <= 0) {
                throw new Error('Transaction amount must be greater than zero.');
            }
        },
    },
});

module.exports = Transaction;
