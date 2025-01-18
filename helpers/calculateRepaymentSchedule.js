/**
 * Calculate EMI and generate a repayment schedule.
 * 
 * @param {number} amount - Principal loan amount.
 * @param {number} interestRate - Annual interest rate in percentage.
 * @param {number} duration - Loan term in months.
 * @returns {Object} - Object containing EMI and repayment schedule.
 */
function calculateRepaymentSchedule(amount, interestRate, duration) {
    const monthlyRate = interestRate / 12 / 100; // Convert annual rate to monthly
    const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, duration)) / 
                (Math.pow(1 + monthlyRate, duration) - 1);

    let schedule = [];
    let remainingBalance = amount;

    for (let month = 1; month <= duration; month++) {
        const interestForMonth = remainingBalance * monthlyRate;
        const principalForMonth = emi - interestForMonth;

        schedule.push({
            month,
            emi: emi.toFixed(2),
            principal: principalForMonth.toFixed(2),
            interest: interestForMonth.toFixed(2),
            remainingBalance: Math.max(0, (remainingBalance - principalForMonth).toFixed(2))
        });

        remainingBalance -= principalForMonth;
    }

    return { emi: emi.toFixed(2), schedule };
}

module.exports = calculateRepaymentSchedule;
