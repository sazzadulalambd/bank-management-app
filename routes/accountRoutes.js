// routes/accountRoutes.js

const express = require('express');
const router = express.Router();
const roleMiddleware = require('../middlewares/roleMiddleware');
const accountController = require('../controllers/accountController');

// Create a new account
router.post('/', roleMiddleware.checkRole('staff', 'admin'), accountController.createAccount);

// Retrieve all accounts for a user
router.get('/', accountController.getAllAccounts);

// Retrieve details of a specific account
router.get('/:id', accountController.getAccountDetails);

// Update an existing account 
router.put('/:id', roleMiddleware.checkRole('staff', 'admin'), accountController.updateAccount);

// Delete an account 
router.delete('/:id', roleMiddleware.checkRole('staff', 'admin'), accountController.deleteAccount);

module.exports = router;
