// routes/transactionRoutes.js

const express= require ('express');
const router= express.Router();
const transactionController= require ('../controllers/transactionController');
const roleMiddleware = require('../middlewares/roleMiddleware'); // Import role middleware

// Deposit money into an account 
router.post('/deposit', roleMiddleware.checkRole('customer', 'staff', 'admin'), transactionController.deposit);

// Withdraw money from an account 
router.post('/withdraw', roleMiddleware.checkRole('customer', 'staff', 'admin'), transactionController.withdrawal);

// Transfer money between accounts
router.post('/transfer', roleMiddleware.checkRole('customer', 'staff', 'admin'), transactionController.transferFunds);

// Request an external fund transfer 
router.post('/request-external-transfer', roleMiddleware.checkRole('customer'), transactionController.requestExternalTransfer);

// Approve or reject an external fund transfer request 
router.post('/approve-reject-transfer/:id', roleMiddleware.checkRole('staff', 'admin'), transactionController.approveRejectTransferRequest);

// Retrieve transaction history for an account 
router.get('/history/:id', roleMiddleware.checkRole('customer', 'staff', 'admin'), transactionController.getTransactionHistory);

module.exports= router;
