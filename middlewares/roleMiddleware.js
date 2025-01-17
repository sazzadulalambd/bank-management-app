// middlewares/roleMiddleware.js

const logger= require('../helpers/logger');
const jwt = require('jsonwebtoken');

exports.checkRole= (...allowedRoles) => {
     return (req,res,next) => {
                // Extract and verify the access token
                const accessToken = req.header('Authorization').replace('Bearer ', '').trim();
                const tokenData = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
                const userRole= tokenData.role;

          if (!allowedRoles.includes(userRole)) {
              logger.warn('Unauthorized access attempt by user with role:', userRole );
              return res.status(403).json({message:'Forbidden : You do not have permission to perform this action.'});
          }
          next();
      };
};
