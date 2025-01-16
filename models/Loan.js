const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Loan = sequelize.define('Loan', {
   id:{
      type :DataTypes.INTEGER, 
      primaryKey :true, 
      autoIncrement :true 
   }, 
   userId:{
      type :DataTypes.INTEGER, 
      allowNull :false, 
      references:{
         model :'Users', 
         key :'id' 
      } 
   }, 
   amount:{
      type :DataTypes.FLOAT, 
      allowNull :false 
   }, 
   interestRate:{
      type :DataTypes.FLOAT, 
      allowNull :false 
   }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    createdAt: 'created_at', // Specify the database column name
    updatedAt: 'updated_at', // Specify the database column name
});

// Export the Loan model
module.exports = Loan;
