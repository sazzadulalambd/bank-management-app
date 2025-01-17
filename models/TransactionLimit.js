// models/TransactionLimit.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TransactionLimit = sequelize.define('TransactionLimit', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userType: {
        type: DataTypes.ENUM('customer', 'staff', 'admin'),
        allowNull: false,
    },
    dailyLimit: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    feePercentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
    },
}, {
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
});

module.exports = TransactionLimit;
