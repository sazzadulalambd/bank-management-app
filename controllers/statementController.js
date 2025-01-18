const { generateMonthlyStatement } = require('../helpers/statementGenerator');
const MonthlyStatement = require('../models/MonthlyStatement');

async function createAndFetchStatement(req, res) {
    const { accountId, month } = req.body;

    try {
        // Validate input
        if (!accountId || !month) {
            return res.status(400).json({
                success: false,
                message: "Both 'accountId' and 'month' are required.",
            });
        }

        // Generate the monthly statement
        await generateMonthlyStatement(accountId, month);

        // Fetch the created statement
        const statement = await MonthlyStatement.findOne({
            where: { 
                accountId, 
                statementDate: `${month}-01` 
            },
        });

        if (!statement) {
            return res.status(404).json({
                success: false,
                message: 'Statement not found.',
            });
        }

        res.status(200).json({ success: true, statement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { createAndFetchStatement };
