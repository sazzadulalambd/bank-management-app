// routes/statementRoutes.js
const express = require('express');
const router = express.Router();
const { createAndFetchStatement } = require('../controllers/statementController');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.post('/generate', roleMiddleware.checkRole('customer', 'staff', 'admin'), createAndFetchStatement);

module.exports = router;
