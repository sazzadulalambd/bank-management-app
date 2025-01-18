const SavingsPlan = require('../models/SavingsPlan');
const Account = require('../models/Account');
const { calculateMaturityAmount } = require('../helpers/interestCalculator');

async function createSavingsPlan(req, res) {
    const { userId, planType, amount, interestRate, durationInMonths } = req.body;

    try {
        const maturityAmount = calculateMaturityAmount(amount, interestRate, durationInMonths);

        const savingsPlan = await SavingsPlan.create({
            userId,
            planType,
            amount,
            interestRate,
            durationInMonths,
        });

        res.status(201).json({ success: true, savingsPlan, maturityAmount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function getSavingsPlans(req, res) {
    const { userId } = req.params;

    try {
        const plans = await SavingsPlan.findAll({ where: { userId } });

        if (!plans.length) {
            return res.status(404).json({ success: false, message: 'No savings plans found.' });
        }

        res.status(200).json({ success: true, plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function calculateSavingsPlanMaturity(req, res) {
    const { planId } = req.params;

    try {
        const savingsPlan = await SavingsPlan.findByPk(planId);

        if (!savingsPlan) {
            return res.status(404).json({ success: false, message: 'Savings plan not found.' });
        }

        const maturityAmount = calculateMaturityAmount(
            savingsPlan.amount,
            savingsPlan.interestRate,
            savingsPlan.durationInMonths
        );

        res.status(200).json({ success: true, maturityAmount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { createSavingsPlan, getSavingsPlans, calculateSavingsPlanMaturity };
