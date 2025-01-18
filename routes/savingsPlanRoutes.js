const express = require('express');
const router = express.Router();
const savingsPlanController = require('../controllers/savingsPlanController');

// Create a new savings plan
router.post('/', savingsPlanController.createSavingsPlan);

// Get all savings plans for a user
router.get('/:userId', savingsPlanController.getSavingsPlans);

// Calculate maturity amount for a specific plan
router.get('/maturity/:planId', savingsPlanController.calculateSavingsPlanMaturity);

module.exports = router;
