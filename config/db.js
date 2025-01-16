const { Sequelize } = require('sequelize');
require('dotenv').config(); // Load environment variables from .env file

// Create a Sequelize instance
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
});

// Test the database connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to the MySQL database.');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1); // Exit if connection fails
    }
};

// Export the sequelize instance and testConnection function
module.exports = { sequelize, testConnection };
