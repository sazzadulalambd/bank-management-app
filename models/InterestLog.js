const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const InterestLog = sequelize.define('InterestLog', {
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
    interestAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
}, {
    timestamps: true,
    createdAt: 'creditedAt',
    updatedAt: false,
});

module.exports = InterestLog;
