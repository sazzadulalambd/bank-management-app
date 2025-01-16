const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    role: {
        type: DataTypes.ENUM('customer', 'staff', 'admin'),
        allowNull: false,
    },
    resetPasswordOtp: {
        type: DataTypes.INTEGER, // OTP is typically a number
        allowNull: true,
    },
    resetPasswordOtpExpires: {
        type: DataTypes.DATE, // Expiration time for the OTP
        allowNull: true,
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// Export the User model
module.exports = User;