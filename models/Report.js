// models/Report.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Report = sequelize.define(
    'Report',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        accountId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Accounts',
                key: 'id',
            },
        },
        reportType: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'e.g., Account Summary, Loan Balance, Transaction History',
        },
        reportDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        reportContent: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        timestamps: false,
    }
);

module.exports = Report;
