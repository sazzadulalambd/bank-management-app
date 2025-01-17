// controllers/accountController.js

const Account = require('../models/Account');
const User = require('../models/User');
const logger = require('../helpers/logger');
const jwt = require('jsonwebtoken');

exports.createAccount = async (req, res) => {
    const { userId, accountType, currency } = req.body;

    if (!userId || !accountType || !currency) {
        logger.warn('Account creation attempt with missing fields: %o', req.body);
        return res.status(400).json({ message: 'User ID, account type, and currency are required.' });
    }

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            logger.warn('User not found for account creation: %s', userId);
            return res.status(404).json({ message: 'User not found.' });
        }

        // Generate a random account number for demonstration purposes (in production, use a proper method)
        const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString(); // Example 10-digit number

        const account = await Account.create({
            userId,
            accountNumber, // Pass the generated account number here; it will be encrypted in the model hook.
            accountType,
            currency,
        });

        logger.info('Account created successfully for user ID %s: %o', userId, account);
        return res.status(201).json(account);
    } catch (error) {
        logger.error("Error creating account for user ID %s: %o", userId, error);
        return res.status(500).json({ message: 'Error creating account' });
    }
};

exports.getAllAccounts = async (req, res) => {
    

    try {
        // Extract and verify the access token
        const accessToken = req.header('Authorization').replace('Bearer ', '').trim();
        const tokenData = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const userId = tokenData.id;

        const accounts = await Account.findAll({ where: { userId } });
        logger.info('Retrieved accounts for user ID %s', userId);
        return res.json(accounts);
    } catch (error) {
        logger.error("Error retrieving accounts for user ID %s: %o", userId, error);
        return res.status(500).json({ message: 'Error retrieving accounts' });
    }
};

exports.getAccountDetails = async (req, res) => {
    const { id } = req.params;

    try {
        const account = await Account.findByPk(id);
        if (!account) {
            logger.warn('Account not found for ID %s', id);
            return res.status(404).json({ message: 'Account not found.' });
        }

        logger.info('Retrieved details for account ID %s', id);
        return res.json(account);
    } catch (error) {
        logger.error("Error retrieving details for account ID %s: %o", id, error);
        return res.status(500).json({ message: 'Error retrieving account details' });
    }
};

exports.updateAccount = async (req, res) => {
    const { id } = req.params;
    const { accountType, balance, currency } = req.body;

    try {
        const account = await Account.findByPk(id);
        
         if (!account) {
            logger.warn('Account not found for update with ID %s', id);
            return res.status(404).json({ message: 'Account not found.' });
         }

         if (accountType) account.accountType = accountType;
         if (balance !== undefined) account.balance = balance; // Allow updating balance
         if (currency) account.currency = currency; // Allow updating currency type

         await account.save();

         logger.info('Updated account successfully for ID %s', id);
         return res.json(account);
     } catch (error) {
         logger.error("Error updating account ID %s: %o", id, error);
         return res.status(500).json({ message: 'Error updating account' });
     }
};

exports.deleteAccount = async (req, res) => {
     const { id } = req.params;

     try {
         const result = await Account.destroy({ where: { id } });
         
         if (!result) {
             logger.warn('Account not found for deletion with ID %s', id);
             return res.status(404).json({ message: 'Account not found.' });
         }

         logger.info('Deleted account successfully with ID %s', id);
         return res.json({ message: 'Account deleted successfully.' });
     } catch (error) {
         logger.error("Error deleting account ID %s: %o", id, error);
         return res.status(500).json({ message: 'Error deleting account' });
     }
};
