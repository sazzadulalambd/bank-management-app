const Loan = require('../models/Loan');
const LoanRepayment = require('../models/LoanRepayment');
const Account = require('../models/Account');
const calculateRepaymentSchedule = require('../helpers/calculateRepaymentSchedule');

// Apply for a loan
exports.applyForLoan = async (req, res) => {
    const { accountId, loanType, amount, interestRate, repaymentSchedule } = req.body;

    if (!accountId || !loanType || !amount || !interestRate || !repaymentSchedule) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const loan = await Loan.create({ accountId, loanType, amount, interestRate, repaymentSchedule });
        res.status(201).json({ message: 'Loan application submitted successfully', loan });
    } catch (error) {
        res.status(500).json({ message: 'Error applying for loan', error: error.message });
    }
};

// Approve or reject a loan
exports.approveOrRejectLoan = async (req, res) => {
    const { id } = req.params;
    const { action } = req.body;

    if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ message: 'Invalid action. Must be "approve" or "reject".' });
    }

    try {
        const loan = await Loan.findByPk(id);
        if (!loan) return res.status(404).json({ message: 'Loan not found.' });

        loan.status = action === 'approve' ? 'approved' : 'rejected';
        await loan.save();

        res.status(200).json({ message: `Loan ${action}d successfully.`, loan });
    } catch (error) {
        res.status(500).json({ message: 'Error processing loan approval/rejection', error: error.message });
    }
};

// Calculate penalties
exports.calculatePenalties = async (req, res) => {
    const { id } = req.params;

    try {
        const loan = await Loan.findByPk(id);
        if (!loan) return res.status(404).json({ message: 'Loan not found.' });

        // Example penalty calculation logic
        const overdueDays = Math.max(0, (new Date() - new Date(loan.repaymentSchedule.dueDate)) / (1000 * 60 * 60 * 24));
        loan.penalty = overdueDays * 50; 
        await loan.save();

        res.status(200).json({ message: 'Penalty calculated successfully.', penalty: loan.penalty });
    } catch (error) {
        res.status(500).json({ message: 'Error calculating penalties', error: error.message });
    }
};


// Generate repayment schedule for a loan
exports.generateRepaymentSchedule = async (req, res) => {
    const { id } = req.params; // Loan ID

    try {
        const loan = await Loan.findByPk(id);
        if (!loan) return res.status(404).json({ message: 'Loan not found.' });

        if (loan.status !== 'approved') {
            return res.status(400).json({ message: 'Repayment schedule can only be generated for approved loans.' });
        }

        const { amount, interestRate, repaymentSchedule } = loan;
        // if (repaymentSchedule) {
        //     return res.status(400).json({ message: 'Repayment schedule already exists.' });
        // }

        const duration = req.body.duration || 12; // Default to 12 months if not provided
        const { emi, schedule } = calculateRepaymentSchedule(amount, interestRate, duration);

        // Store the repayment schedule in the loan record
        loan.repaymentSchedule = JSON.stringify(schedule);
        await loan.save();

        res.status(200).json({
            message: 'Repayment schedule generated successfully.',
            emi,
            schedule
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating repayment schedule.', error: error.message });
    }
};


// API to display an existing repayment schedule
exports.getRepaymentSchedule = async (req, res) => {
    const { id } = req.params; // Loan ID

    try {
        const loan = await Loan.findByPk(id);
        if (!loan) return res.status(404).json({ message: 'Loan not found.' });

        if (!loan.repaymentSchedule) {
            return res.status(404).json({ message: 'No repayment schedule found for this loan.' });
        }

        const schedule = JSON.parse(loan.repaymentSchedule);
        res.status(200).json({
            message: 'Repayment schedule retrieved successfully.',
            schedule
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving repayment schedule.', error: error.message });
    }
};