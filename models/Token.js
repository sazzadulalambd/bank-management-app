const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/db');

const Token = sequelize.define('Token', {
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
    refreshToken: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    accessToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Token;
