const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TransferRequest = sequelize.define('TransferRequest', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fromAccountId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Accounts', key: 'id' } },
    toAccountId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Accounts', key: 'id' } },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
}, {
    timestamps: true,
    createdAt: 'requestedAt',
});

module.exports = TransferRequest;
