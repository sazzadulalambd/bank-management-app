const schedule = require('node-schedule');
const { creditInterestMonthly } = require('../services/interestScheduler');

// Schedule interest crediting for the 1st of every month at midnight
schedule.scheduleJob('0 0 1 * *', async () => {
    console.log('Running monthly interest crediting...');
    await creditInterestMonthly();
});
