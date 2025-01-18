const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const MonthlyStatement = require('../models/MonthlyStatement');
const { Op } = require('sequelize');

async function generateMonthlyStatement(accountId, month) {
    // Validate and parse the input month
    const startDate = new Date(`${month}-01`);
    if (isNaN(startDate)) {
        throw new Error("Invalid 'month' format. Use 'YYYY-MM'.");
    }

    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    // Check if the account exists
    const account = await Account.findByPk(accountId);
    if (!account) {
        throw new Error('Account not found.');
    }

    // Retrieve all transactions for the account within the given month
    const transactions = await Transaction.findAll({
        where: {
            accountId,
            createdAt: {
                [Op.between]: [startDate, endDate],
            },
        },
    });

    // Generate the statement content
    const statementContent = `
        Monthly Statement for Account ID: ${account.id}
        Account Type: ${account.accountType}
        Statement Date: ${startDate.toISOString().slice(0, 7)}

        Transactions:
        ${transactions
            .map(
                (t) =>
                    `${new Date(t.createdAt).toISOString().slice(0, 10)} - ${t.transactionType} - $${t.amount}`
            )
            .join('\n')}

        Total Balance: $${account.balance}
    `;

    // Save the statement to the database
    await MonthlyStatement.create({
        accountId: account.id,
        statementDate: startDate,
        statementContent,
    });
}

module.exports = { generateMonthlyStatement };
