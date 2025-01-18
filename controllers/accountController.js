// controllers/accountController.js

const Account = require('../models/Account');
const User = require('../models/User');
const logger = require('../helpers/logger');
const jwt = require('jsonwebtoken');
const { encrypt, decrypt } = require('../helpers/encryptionHelper');


/**
 * Create a new account for a user.
 */
exports.createAccount = async (req, res) => {
    const { userId, accountType, currency } = req.body;

    if (!userId || !accountType || !currency) {
        logger.warn('Missing required fields for account creation: %o', req.body);
        return res.status(400).json({ message: 'User ID, account type, and currency are required.' });
    }

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            logger.warn('User not found: %s', userId);
            return res.status(404).json({ message: 'User not found.' });
        }

        // Generate and encrypt the account number
        const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        const encryptedAccountNumber = encrypt(accountNumber);

        // Create the account
        const account = await Account.create({
            userId,
            accountNumber: encryptedAccountNumber,
            accountType,
            currency,
        });

        logger.info('Account created successfully for user ID %s: %o', userId, account);

        // Send response with decrypted account number
        return res.status(201).json({
            message: 'Account created successfully.',
            account: {
                ...account.toJSON(),
                accountNumber: accountNumber, // Send plaintext account number
            },
        });
    } catch (error) {
        logger.error('Error creating account: %o', error);
        const message = error.name === 'SequelizeUniqueConstraintError'
            ? 'Account number must be unique.'
            : 'Error creating account.';
        return res.status(500).json({ message });
    }
};

/**
 * Retrieve all accounts for the authenticated user.
 */
exports.getAllAccounts = async (req, res) => {
    try {
        const accessToken = req.header('Authorization').replace('Bearer ', '').trim();
        const tokenData = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        const accounts = await Account.findAll({ where: { userId: tokenData.id } });

        if (!accounts || accounts.length === 0) {
            logger.warn('No accounts found for user ID: %s', tokenData.id);
            return res.status(404).json({ message: 'No accounts found.' });
        }

        // Decrypt account numbers, skipping corrupted records
        const decryptedAccounts = accounts.map((account) => {
            try {
                return {
                    ...account.toJSON(),
                    accountNumber: decrypt(account.accountNumber),
                };
            } catch (error) {
                logger.error('Failed to decrypt account number for account ID %s: %o', account.id, error);
                return null; // Skip corrupted records
            }
        }).filter(Boolean); // Remove null entries

        logger.info('Accounts retrieved successfully for user ID %s', tokenData.id);
        return res.status(200).json(decryptedAccounts);
    } catch (error) {
        logger.error('Error retrieving accounts: %o', error);
        return res.status(500).json({ message: 'Error retrieving accounts', error: error.message });
    }
};

/**
 * Retrieve account details by account ID.
 */
exports.getAccountDetails = async (req, res) => {
    const { id } = req.params;

    try {
        const account = await Account.findByPk(id);

        if (!account) {
            logger.warn('Account not found with ID: %s', id);
            return res.status(404).json({ message: 'Account not found.' });
        }

        // Decrypt the account number
        let decryptedAccountNumber;
        try {
            decryptedAccountNumber = decrypt(account.accountNumber);
        } catch (error) {
            logger.error('Failed to decrypt account number for account ID %s: %o', id, error);
            return res.status(500).json({ message: 'Error decrypting account number.' });
        }

        const decryptedAccount = {
            ...account.toJSON(),
            accountNumber: decryptedAccountNumber,
        };

        logger.info('Account details retrieved successfully for account ID %s', id);
        return res.status(200).json(decryptedAccount);
    } catch (error) {
        logger.error('Error retrieving account details: %o', error);
        return res.status(500).json({ message: 'Error retrieving account details', error: error.message });
    }
};


exports.updateAccount = async (req, res) => {
    const { id } = req.params;
    const { accountType, balance, currency } = req.body;

    try {
         const account = await Account.findByPk(id);

         if (!account) {
             logger.warn('Account not found for update with ID %s', id);
             return res.status(404).json({ message:'Account not found.' });
         }

         if (accountType) account.accountType = accountType;
         if (balance !== undefined) account.balance = balance; // Allow updating balance
         if (currency) account.currency = currency; // Allow updating currency type

         await account.save();

         logger.info('Updated account successfully for ID %s', id);
         return res.json(account);
     } catch (error) {
         logger.error("Error updating account ID %s : %o", id , error );
         return res.status(500).json({ message:'Error updating account' });
     }
};

exports.deleteAccount = async (req, res) => {
     const { id } = req.params;

     try{
          const result= await Account.destroy({ where:{ id } });

          if (!result){
               logger.warn('Account not found for deletion with ID %s', id);
               return res.status(404).json({ message:'Account not found.' });
          }

          logger.info('Deleted account successfully with ID %s', id);
          return res.json({ message:'Account deleted successfully.' });
     } catch(error){
          logger.error("Error deleting account ID %s : %o", id , error );
          return res.status(500).json({ message:'Error deleting account' });
     }
};
