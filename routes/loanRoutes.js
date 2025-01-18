const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Apply for a loan
router.post('/', roleMiddleware.checkRole('customer'), loanController.applyForLoan);

// Approve or reject a loan application
router.post('/:id/approval', roleMiddleware.checkRole('admin', 'staff'), loanController.approveOrRejectLoan);

// Calculate penalties for overdue loans
router.get('/:id/calculate-penalty', roleMiddleware.checkRole('admin', 'staff'), loanController.calculatePenalties);

// Generate repayment schedule for a loan
router.post('/:id/generate-repayment-schedule', roleMiddleware.checkRole('admin', 'staff'), loanController.generateRepaymentSchedule);

// Get repayment schedule for a loan
router.get('/:id/repayment-schedule', roleMiddleware.checkRole('customer', 'admin', 'staff'), loanController.getRepaymentSchedule);

module.exports = router;