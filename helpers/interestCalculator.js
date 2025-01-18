function calculateMaturityAmount(amount, rate, durationInMonths, compoundingFrequency = 1) {
    const years = durationInMonths / 12;
    const maturityAmount = amount * Math.pow(1 + rate / (compoundingFrequency * 100), compoundingFrequency * years);
    return maturityAmount.toFixed(2);
}

module.exports = { calculateMaturityAmount };
