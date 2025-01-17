const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SavingsPlan = sequelize.define('SavingsPlan', {
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
    planType: {
        type: DataTypes.ENUM('fixed', 'recurring'),
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    interestRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
    },
    durationInMonths: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: true,
    createdAt: 'createdAt',
});

module.exports = SavingsPlan;
