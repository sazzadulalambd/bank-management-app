const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const Account = sequelize.define('Account', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } },
    accountType: { type: DataTypes.ENUM('checking', 'savings', 'loan'), allowNull: false },
    accountNumber: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    balance: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.00 },
    currency: { type: DataTypes.STRING(3), defaultValue: 'BDT' },
}, {
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    // hooks: {
    //     beforeCreate: async (account) => {
    //         const encryptedAccountNumber = await bcrypt.hash(account.account_number, 10);
    //         account.account_number = encryptedAccountNumber;
    //     },
    // },
});

module.exports = Account;
