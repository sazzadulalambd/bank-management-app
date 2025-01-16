const { expressjwt: expjwt } = require('express-jwt');
const Token  = require('../models/Token'); // Adjust the path as necessary

function authJwt() {
    const API = process.env.API_URL;
    
    return expjwt({
        secret: process.env.ACCESS_TOKEN_SECRET,
        algorithms: ['HS256'],
        isRevoked: async (req, payload) => {
            const authHeader = req.header('Authorization');
            if (!authHeader.startsWith('Bearer ')) {
                return true; // Revoked if no Bearer token present
            }

            const accessToken = authHeader.replace('Bearer ', '').trim();
            const tokenRecord = await Token.findOne({ where: { accessToken } });

            // Check if the user is trying to access an admin route without admin privileges
            const adminRouteRegex = /^\/api\/v1\/admin\//i;
            const isAdminRouteAccessedByNonAdmin =
                !payload.isAdmin && adminRouteRegex.test(req.originalUrl);

            return isAdminRouteAccessedByNonAdmin || !tokenRecord; // Revoked if not found or unauthorized
        },
    }).unless({
        path: [
            `${API}/login`,
            `${API}/login/`,
      
            `${API}/register`,
            `${API}/register/`,
      
            `${API}/forgot-password`,
            `${API}/forgot-password/`,
      
            `${API}/verify-otp`,
            `${API}/verify-otp/`,
      
            `${API}/reset-password`,
            `${API}/reset-password/`,
        ],
    });
}

module.exports = authJwt;
