const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    accountId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Accounts',
            key: 'id',
        },
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    transactionType: {
        type: DataTypes.ENUM('deposit', 'withdrawal', 'transfer'),
        allowNull: false
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    createdAt: 'created_at', // Specify the database column name
    updatedAt: 'updated_at', // Specify the database column name
});

// Export the Transaction model
module.exports = Transaction;
