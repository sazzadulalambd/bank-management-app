const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MonthlyStatement = sequelize.define('MonthlyStatement', {
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
    statementDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    statementContent: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    timestamps: false,
});

module.exports = MonthlyStatement;
