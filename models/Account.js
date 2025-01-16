const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Account = sequelize.define('Account', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    accountType: {
        type: DataTypes.ENUM('checking', 'savings', 'loan'),
        allowNull: false,
    },
    balance: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    createdAt: 'created_at', // Specify the database column name
    updatedAt: 'updated_at', // Specify the database column name
});

// Export the Account model
module.exports = Account;
