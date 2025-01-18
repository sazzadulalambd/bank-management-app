const { generateDetailedReport } = require('../helpers/reportGenerator');
const Report = require('../models/Report');

async function createAndFetchReport(req, res) {
    const { accountId, reportType, startDate, endDate } = req.body;

    try {
        // Validate input
        if (!accountId || !reportType || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "All fields ('accountId', 'reportType', 'startDate', 'endDate') are required.",
            });
        }

        // Generate the report
        await generateDetailedReport(accountId, reportType, startDate, endDate);

        // Fetch the generated report
        const report = await Report.findOne({
            where: {
                accountId,
                reportType,
                reportDate: new Date().toISOString().split('T')[0], // Match today's date
            },
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report generation failed or report not found.',
            });
        }

        res.status(200).json({ success: true, report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { createAndFetchReport };
