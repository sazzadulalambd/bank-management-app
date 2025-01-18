const SavingsPlan = require('../models/SavingsPlan');
const Account = require('../models/Account');
const { calculateMaturityAmount } = require('../helpers/interestCalculator');

async function creditInterestMonthly() {
    const plans = await SavingsPlan.findAll();

    for (const plan of plans) {
        const monthlyInterest = (plan.amount * plan.interestRate) / 1200;

        const account = await Account.findByPk(plan.userId);

        if (account) {
            account.balance += parseFloat(monthlyInterest);
            await account.save();

            console.log(`Credited $${monthlyInterest.toFixed(2)} to account of user ${account.userId} for plan ${plan.id}`);
        }
    }
}

module.exports = { creditInterestMonthly };
