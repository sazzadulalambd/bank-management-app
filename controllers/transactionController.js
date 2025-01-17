// controllers/transactionController.js

const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const TransferRequest = require('../models/TransferRequest');
const TransactionLimit = require('../models/TransactionLimit');
const logger = require('../helpers/logger');
const jwt = require('jsonwebtoken');

// Function to check daily transaction limit
async function checkDailyLimit(userId, amount) {
    const user = await User.findByPk(userId);
    const limitSetting = await TransactionLimit.findOne({ where: { userType: user.role } });

    if (!limitSetting) {
        return { allowed: true }; // No limit set
    }

    // Check if the amount exceeds the daily limit
    if (amount > limitSetting.dailyLimit) {
        return { allowed: false, message: `Transaction exceeds daily limit of ${limitSetting.dailyLimit}` };
    }

    return { allowed: true };
}

// Deposit money into an account
exports.deposit = async (req, res) => {
    const { accountId, amount } = req.body;

    if (!accountId || amount <= 0) {
        return res.status(400).json({ message: 'Invalid account ID or amount.' });
    }

    try {
        const account = await Account.findByPk(accountId);
        if (!account) {
            return res.status(404).json({ message: 'Account not found.' });
        }

        // Check daily limit
        const limitCheck = await checkDailyLimit(req.user.id, amount);
        if (!limitCheck.allowed) {
            return res.status(400).json({ message: limitCheck.message });
        }

        // Update balance and create transaction record
        account.balance += amount;

        await Transaction.create({
            accountId,
            amount,
            transactionType: 'deposit',
            fee: 0.00 // Assuming no fee for deposits
        });

        await account.save(); // Save updated balance 

        logger.info('Deposit successful for account ID %s: Amount %d', accountId, amount);
        return res.status(201).json(account); // Return updated account info
    } catch (error) {
        logger.error("Error processing deposit for account ID %s: %o", accountId, error);
        return res.status(500).json({ message: 'Error processing deposit' });
    }
};

// Withdraw money from an account
exports.withdrawal = async (req, res) => {
    const { accountId, amount } = req.body;

    if (!accountId || amount <= 0) {
        return res.status(400).json({ message: 'Invalid account ID or amount.' });
    }

    try {
        const account = await Account.findByPk(accountId);
        if (!account) {
            return res.status(404).json({ message: 'Account not found.' });
        }

        if (account.balance < amount) {
            return res.status(400).json({ message: 'Insufficient funds.' });
        }

        // Check daily limit
        const limitCheck = await checkDailyLimit(req.user.id, amount);
        if (!limitCheck.allowed) {
            return res.status(400).json({ message: limitCheck.message });
        }

        // Update balance and create transaction record
        account.balance -= amount;

        await Transaction.create({
            accountId,
            amount,
            transactionType: 'withdrawal',
            fee: 0.00 // Assuming no fee for withdrawals
        });

        await account.save(); // Save updated balance 

        logger.info('Withdrawal successful for account ID %s: Amount %d', accountId, amount);
        return res.status(200).json(account); // Return updated account info
    } catch (error) {
        logger.error("Error processing withdrawal for account ID %s: %o", accountId, error);
        return res.status(500).json({ message: 'Error processing withdrawal' });
    }
};

// Transfer funds between accounts
exports.transferFunds = async (req, res) => {
   const { fromAccountId, toAccountId, amount } = req.body;

   if (!fromAccountId || !toAccountId || amount <= 0) {
       return res.status(400).json({ message: 'Invalid accounts or amount.' });
   }

   try {
       const fromAccount = await Account.findByPk(fromAccountId);
       const toAccount = await Account.findByPk(toAccountId);

       if (!fromAccount || !toAccount) {
           return res.status(404).json({ message: 'One or both accounts not found.' });
       }

       if (fromAccount.balance < amount) {
           return res.status(400).json({ message: 'Insufficient funds in the source account.' });
       }

       // Check daily limit for the transfer amount
       const limitCheck = await checkDailyLimit(req.user.id, amount);
       if (!limitCheck.allowed) {
           return res.status(400).json({ message: limitCheck.message });
       }

       // Update balances
       fromAccount.balance -= amount;
       toAccount.balance += amount;

       // Create transaction records
       await Transaction.create({
           accountId: fromAccountId,
           amount,
           transactionType: 'transfer',
           fee: 0.00 // Adjust fee as necessary
       });

       await Transaction.create({
           accountId: toAccountId,
           amount,
           transactionType: 'transfer',
           fee: 0.00
       });

       await fromAccount.save();
       await toAccount.save();

       logger.info('Transfer successful from account ID %s to ID %s: Amount %d', fromAccountId, toAccountId, amount);
       
       return res.status(200).json({ fromAccount, toAccount }); // Return updated accounts info
   } catch (error) {
       logger.error("Error processing transfer from account ID %s to ID %s: %o", fromAccountId, toAccountId, error);
       
      return res.status(500).json({ message: 'Error processing transfer' });
   }
};

// Get transaction history for an account
exports.getTransactionHistory = async (req, res) => {
   const { id } = req.params;

   try {
       const transactions = await Transaction.findAll({ where: { accountId: id } });

       if (!transactions.length) {
           logger.warn('No transactions found for account ID %s', id);
           return res.status(404).json({ message: 'No transactions found for this account.' });
       }

       logger.info('Retrieved transaction history for account ID %s', id);
       return res.json(transactions);
   } catch (error) {
       logger.error("Error retrieving transactions for account ID %s: %o", id, error);
       return res.status(500).json({ message: 'Error retrieving transactions' });
   }
};



// Request an external fund transfer
exports.requestExternalTransfer = async (req, res) => {
    const { fromAccountId, toAccountId, amount } = req.body;

    if (!fromAccountId || !toAccountId || amount <= 0) {
        return res.status(400).json({ message: 'Invalid accounts or amount.' });
    }

    try {
        const fromAccount = await Account.findByPk(fromAccountId);

        if (!fromAccount) {
            return res.status(404).json({ message: 'Source account not found.' });
        }

        if (fromAccount.balance < amount) {
            return res.status(400).json({ message: 'Insufficient funds in the source account.' });
        }

        // Check daily limit for the transfer amount
        const limitCheck = await checkDailyLimit(req.user.id, amount);
        if (!limitCheck.allowed) {
            return res.status(400).json({ message: limitCheck.message });
        }

        // Create a transfer request
        const transferRequest = await TransferRequest.create({
            fromAccountId,
            toAccountId,
            amount,
            status: 'pending'
        });

        logger.info('External transfer request created successfully from account ID %s to %s for amount %d', fromAccountId, toAccountId, amount);
        
        return res.status(201).json(transferRequest);
    } catch (error) {
        logger.error("Error requesting external transfer from account ID %s to %s: %o", fromAccountId, toAccountId, error);
        
       return res.status(500).json({ message: 'Error requesting external transfer' });
   }
};

// Approve or reject an external fund transfer request
exports.approveRejectTransferRequest = async (req, res) => {
   const { id } = req.params;
   const { action } = req.body; // action should be either "approve" or "reject"

   if (!['approve', 'reject'].includes(action)) {
       return res.status(400).json({ message: 'Invalid action. Must be "approve" or "reject".' });
   }

   try {
       const transferRequest = await TransferRequest.findByPk(id);

       if (!transferRequest) {
           return res.status(404).json({ message: 'Transfer request not found.' });
       }

       if (action === 'approve') {
           // Process the transfer
           const fromAccount = await Account.findByPk(transferRequest.fromAccountId);
           const toAccount = await Account.findOne({ where: { accountNumber: transferRequest.toAccountId } }); // Assume this is how you find the external account

           if (!toAccount) {
               return res.status(404).json({ message: 'Destination account not found.' });
           }

           if (fromAccount.balance < transferRequest.amount) {
               return res.status(400).json({ message: 'Insufficient funds in the source account.' });
           }

           // Check daily limit for the transfer amount
           const limitCheck = await checkDailyLimit(req.user.id, transferRequest.amount);
           if (!limitCheck.allowed) {
               return res.status(400).json({ message: limitCheck.message });
           }

           // Update balances
           fromAccount.balance -= transferRequest.amount;
           toAccount.balance += transferRequest.amount; // Update as needed for external accounts

           await fromAccount.save();
           await toAccount.save();

           // Create a transaction record
           await Transaction.create({
               accountId: fromAccount.id,
               amount: transferRequest.amount,
               transactionType: 'transfer',
               fee: 0.00 // Adjust fee as necessary
           });

           // Update transfer request status
           transferRequest.status = 'approved';
       } else if (action === 'reject') {
           transferRequest.status = 'rejected';
       }

       await transferRequest.save();

       logger.info('Transfer request ID %s has been %s', id, action);
       return res.json(transferRequest);
   } catch (error) {
       logger.error("Error approving/rejecting transfer request ID %s : %o", id , error);
       return res.status(500).json({ message:'Error processing transfer request' });
   }
};