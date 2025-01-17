// controllers/transactionController.js

const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const TransferRequest = require('../models/TransferRequest'); 
const User = require('../models/User'); // Import User model
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

    console.log('Request Body:', req.body);

    if (!accountId || amount <= 0) {
        return res.status(400).json({ message: 'Invalid account ID or amount.' });
    }

    try {
        const account = await Account.findByPk(accountId);
        if (!account) {
            return res.status(404).json({ message: 'Account not found.' });
        }

        console.log('Current Account Balance:', account.balance); // Log current balance

        const accessToken = req.header('Authorization').replace('Bearer ', '').trim();
        const tokenData = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        // Check daily limit
        const limitCheck = await checkDailyLimit(tokenData.id, amount);
        if (!limitCheck.allowed) {
            return res.status(400).json({ message: limitCheck.message });
        }

        // Update balance
        account.balance = parseFloat(account.balance) + parseFloat(amount); // Ensure both values are numbers
        console.log('Updated Account Balance:', account.balance); // Log updated balance

        // Create transaction record
        const transactionRecord = await Transaction.create({
            accountId,
            amount,
            transactionType: 'deposit',
            fee: 0.00 // Assuming no fee for deposits
        });

        await account.save(); // Save updated balance 

        logger.info('Deposit successful for account ID %s: Amount %d', accountId, amount);
        
        return res.status(201).json({
            account: {
                ...account.toJSON(),
                balance: account.balance.toFixed(2) // Format to two decimal places
            },
            transactionRecord
        }); 
    } catch (error) {
        logger.error("Error processing deposit for account ID %s: %o", accountId, error);
        return res.status(500).json({ message: 'Error processing deposit', error: error.message });
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


        const accessToken = req.header('Authorization').replace('Bearer ', '').trim();
        const tokenData = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        // Check daily limit
        const limitCheck = await checkDailyLimit(tokenData.id, amount);
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

// Transfer money between accounts
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

        // Ensure balance is treated as a number
        const fromBalance = parseFloat(fromAccount.balance);
        const toBalance = parseFloat(toAccount.balance);

        if (fromBalance < amount) {
            return res.status(400).json({ message: 'Insufficient funds in the source account.' });
        }

        // Update balances
        fromAccount.balance = fromBalance - amount;
        toAccount.balance = toBalance + amount;

        // Create transaction records
        await Transaction.create({
            accountId: fromAccount.id,
            amount,
            transactionType: 'transfer',
            fee: 0.00 // Adjust fee as necessary
        });

        await Transaction.create({
            accountId: toAccount.id,
            amount,
            transactionType: 'transfer',
            fee: 0.00 // Adjust fee as necessary
        });

        await fromAccount.save();
        await toAccount.save();

        logger.info('Transfer successful from account ID %s to ID %s: Amount %d', fromAccountId, toAccountId, amount);

        // Format balances before sending response
        return res.status(200).json({
            fromAccount: {
                ...fromAccount.toJSON(),
                balance: fromAccount.balance.toFixed(2) // Format balance
            },
            toAccount: {
                ...toAccount.toJSON(),
                balance: toAccount.balance.toFixed(2) // Format balance
            }
        });
    } catch (error) {
        logger.error("Error processing transfer from account ID %s to ID %s: %o", fromAccountId, toAccountId, error);
        return res.status(500).json({ message: 'Error processing transfer', error: error.message });
    }
};

// Get transaction history for an account
exports.getTransactionHistory = async (req, res) => {
    const { id } = req.params; // Account ID
    logger.info('Fetching transaction history for account ID:', id);

    try {
        // Fetch transactions
        const transactions = await Transaction.findAll({
            where: { accountId: id }
        });

        // Log the number of transactions retrieved
        if (!transactions || transactions.length === 0) {
            logger.warn('No transactions found for account ID %s', id);
            return res.status(404).json({ message: 'No transactions found for this account.' });
        }

        logger.info('Retrieved %d transaction(s) for account ID %s', transactions.length, id);
        return res.status(200).json(transactions);
    } catch (error) {
        logger.error('Error retrieving transactions for account ID %s: %o', id, error);
        return res.status(500).json({ message: 'Error retrieving transactions', error: error.message });
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

        const accessToken = req.header('Authorization').replace('Bearer ', '').trim();
        const tokenData = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        // Check daily limit
        const limitCheck = await checkDailyLimit(tokenData.id, amount);
        if (!limitCheck.allowed) {
            return res.status(400).json({ message: limitCheck.message });
        }

        // Create a transfer request
        const transferRequest = await TransferRequest.create({
            fromAccountId,
            toAccountId,
            amount,
            status: 'pending',
            createdAt: new Date() // Add requestedAt if it's a required field
        });

        logger.info('External transfer request created successfully from account ID %s to %s for amount %d', fromAccountId, toAccountId, amount);
        
        return res.status(201).json(transferRequest);
    } catch (error) {
        logger.error("Error requesting external transfer from account ID %s to %s: %o", fromAccountId, toAccountId, error);
        
       return res.status(500).json({ message: 'Error requesting external transfer', error: error.message });
   }
};

// Approve or reject an external fund transfer request
exports.approveRejectTransferRequest = async (req, res) => {
    const { id } = req.params; // Transfer request ID
    const { action } = req.body; // Action: approve or reject

    // Validate the action
    if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ message: 'Invalid action. Must be "approve" or "reject".' });
    }

    try {
        // Step 1: Retrieve the transfer request
        const transferRequest = await TransferRequest.findByPk(id);
        if (!transferRequest) {
            return res.status(404).json({ message: 'Transfer request not found.' });
        }

        // Step 2: Validate the transfer amount
        const transferAmount = parseFloat(transferRequest.amount);


        if (isNaN(transferAmount) || transferAmount <= 0) {
            logger.error(
                `Invalid transfer amount: ${transferRequest.amount} for request ID: ${id}`
            );
            return res.status(400).json({ message: 'Transaction amount must be greater than zero.' });
        }

        // Step 3: Retrieve accounts involved in the transfer
        const fromAccount = await Account.findByPk(transferRequest.fromAccountId);
        const toAccount = await Account.findByPk(transferRequest.toAccountId);

        // Validate accounts
        if (!fromAccount) {
            return res.status(404).json({ message: 'Source account not found.' });
        }
        if (!toAccount) {
            return res.status(404).json({ message: 'Destination account not found.' });
        }


        if (action === 'approve') {
            const fromBalance = parseFloat(fromAccount.balance);

            // Ensure sufficient funds in the source account
            if (fromBalance < transferAmount) {
                logger.error(
                    `Insufficient funds: Source Account ID ${fromAccount.id}, Balance: ${fromBalance}, Transfer Amount: ${transferAmount}`
                );
                return res
                    .status(400)
                    .json({ message: 'Insufficient funds in the source account.' });
            }

            
            const accessToken = req.header('Authorization').replace('Bearer ', '').trim();
            const tokenData = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    
            const limitCheck = await checkDailyLimit(tokenData.id, transferAmount);
            if (!limitCheck.allowed) {
                return res.status(400).json({ message: limitCheck.message });
            }

            // Step 5: Update balances
            fromAccount.balance = fromBalance - transferAmount;
            toAccount.balance = parseFloat(toAccount.balance) + transferAmount;

            // Create transaction records for both accounts
            await Transaction.create({
                accountId: fromAccount.id,
                amount: transferAmount, // Debit
                transactionType: 'transfer',
                fee: 0.0,
            });

            await Transaction.create({
                accountId: toAccount.id,
                amount: transferAmount, // Credit
                transactionType: 'transfer',
                fee: 0.0,
            });

            // Save updated account balances
            await fromAccount.save();
            await toAccount.save();

            // Step 6: Approve the transfer request
            transferRequest.status = 'approved';
        } else if (action === 'reject') {
            // Reject the transfer request
            transferRequest.status = 'rejected';
        }

        // Save transfer request status
        await transferRequest.save();

        logger.info(`Transfer request ID ${id} has been ${action}d successfully.`);
        return res.json({
            message: `Transfer request ${action}d successfully.`,
            transferRequest,
        });
    } catch (error) {
        // Log the error with detailed information
        logger.error('Error approving/rejecting transfer request ID %s: %o', id, error);

        return res.status(500).json({
            message: 'Error processing transfer request',
            error: error.message,
        });
    }
};


