const jwt = require('jsonwebtoken');
const { Token } = require('../models/Token'); // Adjust the path as necessary
const { User } = require('../models/User'); // Adjust the path as necessary

async function errorHandler(error, req, res, next) {
    console.log('ERROR OCCURRED:', error);

    if (error.name === 'UnauthorizedError') {
        if (!error.message.includes('jwt expired')) {
            return res.status(error.status).json({ type: error.name, message: error.message });
        }

        try {
            const tokenHeader = req.header('Authorization');
            const accessToken = tokenHeader?.split(' ')[1];

            const tokenRecord = await Token.findOne({ where: { accessToken } });

            if (!tokenRecord) {
                return res.status(401).json({ type: 'Unauthorized', message: 'Token does not exist.' });
            }

            const userData = jwt.verify(tokenRecord.refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const user = await User.findByPk(userData.id);

            if (!user) {
                return res.status(404).json({ message: 'Invalid user!' });
            }

            const newAccessToken = jwt.sign(
                { id: user.id, role: user.role },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '24h' }
            );

            req.headers['authorization'] = `Bearer ${newAccessToken}`;
            await Token.update({ accessToken: newAccessToken }, { where: { id: tokenRecord.id } });

            res.set('Authorization', `Bearer ${newAccessToken}`);
            return next();
        } catch (refreshError) {
            return res.status(401).json({ type: 'Unauthorized', message: refreshError.message });
        }
    }
    
    return res.status(404).json({ type: error.name, message: error.message });
}

module.exports = errorHandler;
