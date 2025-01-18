// helpers/checkDailyLimit.js

const User = require('../models/User'); // Import User model
const TransactionLimit = require('../models/TransactionLimit');
/**
 * Checks if a transaction exceeds the user's daily limit.
 * @param {number} userId - The ID of the user making the transaction.
 * @param {number} amount - The transaction amount.
 * @returns {Promise<{allowed: boolean, message?: string}>}
 */
async function checkDailyLimit(userId, amount) {
    // Fetch the user and their role
    const user = await User.findByPk(userId);

    if (!user) {
        return { allowed: false, message: 'User not found' };
    }

    // Fetch the transaction limit settings for the user's role
    const limitSetting = await TransactionLimit.findOne({ where: { userType: user.role } });

    if (!limitSetting) {
        return { allowed: true }; // No limit set for this role
    }

    // Check if the transaction amount exceeds the daily limit
    if (amount > limitSetting.dailyLimit) {
        return { allowed: false, message: `Transaction exceeds daily limit of ${limitSetting.dailyLimit}` };
    }

    return { allowed: true };
}

module.exports = checkDailyLimit;
