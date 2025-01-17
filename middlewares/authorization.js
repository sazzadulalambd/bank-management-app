const jwt = require('jsonwebtoken');
const { Token } = require('../models/Token'); // Adjust the path as necessary
const { User } = require('../models/User'); // Adjust the path as necessary

async function authorizePostRequests(req, res, next) {
    if (req.method !== 'POST') return next();

    const API = process.env.API_URL;
    const publicEndpoints = [
        `${API}/login`,
        `${API}/register`,
        `${API}/forgot-password`,
        `${API}/verify-otp`,
        `${API}/reset-password`,
    ];

    const isPublicEndpoint = publicEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint));

    if (isPublicEndpoint) return next();

    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ message: 'Authorization token is required.' });

    const accessToken = authHeader.replace('Bearer ', '').trim();
    let tokenData;

    try {
        tokenData = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    if (req.body.user && tokenData.id !== req.body.user) {
        return res.status(401).json({ message: "User conflict! The user making the request doesn't match the user in the request." });
    }
    return next();
}

module.exports = authorizePostRequests;
