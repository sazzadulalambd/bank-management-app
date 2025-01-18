// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { createAndFetchReport } = require('../controllers/reportController');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.post('/generate', roleMiddleware.checkRole('customer', 'staff', 'admin'), createAndFetchReport);

module.exports = router;
