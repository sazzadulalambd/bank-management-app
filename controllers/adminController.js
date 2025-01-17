// controllers/adminController.js

const TransactionLimit = require('../models/TransactionLimit');

exports.setTransactionLimitsAndFees = async (req, res) => {
   const { userType, dailyLimit, feePercentage } = req.body;

   if (!userType || dailyLimit == null || feePercentage == null) {
       return res.status(400).json({ message:'All fields are required.' });
   }

   try {
       const limitSetting = await TransactionLimit.create({
           userType,
           dailyLimit,
           feePercentage
       });

       return res.status(201).json(limitSetting);
   } catch (error) {
       logger.error("Error setting transaction limits and fees:", error);
       return res.status(500).json({ message:'Error setting limits and fees' });
   }
};
