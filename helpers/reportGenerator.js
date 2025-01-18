const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Report = require('../models/Report');
const { Op } = require('sequelize');

async function generateDetailedReport(accountId, reportType, startDate, endDate) {
    const account = await Account.findByPk(accountId);

    if (!account) {
        throw new Error('Account not found.');
    }

    let reportContent;

    if (reportType === 'Transaction History') {
        // Fetch transactions within the date range
        const transactions = await Transaction.findAll({
            where: {
                accountId,
                createdAt: {
                    [Op.between]: [new Date(startDate), new Date(endDate)],
                },
            },
        });

        // Generate report content
        reportContent = `
            Transaction History for Account ID: ${account.id}
            Date Range: ${startDate} to ${endDate}

            Transactions:
            ${transactions
                .map(
                    (t) =>
                        `${new Date(t.createdAt).toISOString().slice(0, 10)} - ${t.transactionType} - $${t.amount}`
                )
                .join('\n')}
        `;
    } else if (reportType === 'Account Summary') {
        // Generate account summary report
        reportContent = `
            Account Summary for Account ID: ${account.id}
            Account Type: ${account.accountType}
            Balance: $${account.balance}
        `;
    } else {
        throw new Error('Unsupported report type.');
    }

    // Save the generated report in the database
    await Report.create({
        accountId: account.id,
        reportType,
        reportDate: new Date().toISOString().split('T')[0], // Save only the date part
        reportContent,
    });
}

module.exports = { generateDetailedReport };
