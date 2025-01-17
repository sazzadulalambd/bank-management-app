// routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const roleMiddleware = require('../middlewares/roleMiddleware'); // Import role middleware
const adminController = require('../controllers/adminController');


// Set transaction limits and fees
router.post('/set-limits', roleMiddleware.checkRole('admin'), adminController.setTransactionLimitsAndFees);

module.exports = router;
