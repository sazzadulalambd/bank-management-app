const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    phoneNumber: { type: DataTypes.STRING(15), allowNull: false },
    resetPasswordOtp: { type: DataTypes.INTEGER, defaultValue: null },
    resetPasswordOtpExpires: { type: DataTypes.DATE, defaultValue: null },
    role: { type: DataTypes.ENUM('customer', 'staff', 'admin'), allowNull: false },
}, {
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
});

module.exports = User;
