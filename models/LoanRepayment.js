const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LoanRepayment = sequelize.define('LoanRepayment', {
   id:{
      type :DataTypes.INTEGER, 
      primaryKey :true, 
      autoIncrement :true 
   }, 
   loanId:{
      type :DataTypes.INTEGER, 
      allowNull :false, 
      references:{
         model :'Loans', 
         key :'id' 
      } 
   }, 
   amountPaid:{
      type :DataTypes.FLOAT, 
      allowNull :false 
   }, 
   paymentDate:{
      type :DataTypes.DATE, 
      allowNull :false 
   }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    createdAt: 'created_at', // Specify the database column name
    updatedAt: 'updated_at', // Specify the database column name
});

// Export the LoanRepayment model
module.exports = LoanRepayment;
