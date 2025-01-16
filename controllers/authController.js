const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Token = require('../models/Token');
const mailSender = require('../helpers/email_sender');
const logger = require('../helpers/logger'); // Ensure you have a logger set up

exports.register = async (req, res) => {
    const { username, password, email, role } = req.body;

    // Validate request body
    if (!username || !password || !email || !role) {
        logger.warn('Registration attempt with missing fields: %o', req.body);
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Check if the username already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            logger.warn('Username already exists: %s', username);
            return res.status(409).json({ message: 'Username already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user
        const user = await User.create({ 
            username, 
            password_hash: hashedPassword, 
            email, 
            role 
        });

        // Send welcome email (optional)
        await mailSender.sendMail(
            user.email,
            'Welcome to Bank Management App',
            'Thank you for registering!'
        );

        logger.info('User registered successfully: %o', user);
        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
        logger.error("Error registering user: %o", error);
        res.status(500).json({ message: 'Error registering user' });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username } });

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            logger.warn('Invalid login attempt for username: %s', username);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate tokens
        const accessToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '24h' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '60d' }
        );

        // Store refresh token in database
        await Token.upsert({
            userId: user.id,
            refreshToken,
            accessToken,
        });

        // Exclude sensitive information
        const { password_hash, ...userWithoutPassword } = user.dataValues;

        logger.info('User logged in successfully: %o', userWithoutPassword);
        return res.json({ ...userWithoutPassword, accessToken, refreshToken });
    } catch (error) {
        logger.error("Error logging in: %o", error);
        return res.status(500).json({ message: 'Error logging in' });
    }
};

// Verify JWT token
exports.verifyToken = async function (req, res) {
    try {
        let accessToken = req.headers.authorization;
        if (!accessToken) return res.status(401).json({ message: 'No authorization token was found' });
        
        accessToken = accessToken.replace('Bearer ', '').trim();

        // Find token record in the database
        const tokenRecord = await Token.findOne({ where: { accessToken } });
        if (!tokenRecord) return res.status(401).json({ message: 'Invalid token' });

        // Verify the refresh token
        const tokenData = jwt.verify(tokenRecord.refreshToken, process.env.REFRESH_TOKEN_SECRET);
        
        // Find user by ID from token data
        const user = await User.findByPk(tokenData.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        logger.info('Token verified successfully for user ID: %d', user.id);
        
        return res.json({ valid: true });
    } catch (error) {
        logger.error("Error verifying token: %o", error);
        
        return res.status(500).json({ type: error.name, message: error.message });
    }
};

// Handle forgot password
exports.forgotPassword = async function (req, res) {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            logger.warn('Forgot password attempt for non-existent email: %s', email);
            return res.status(404).json({ message: 'User with that email does NOT exist!' });
        }

        const otp = Math.floor(1000 + Math.random() * 9000);

        // Set OTP and expiration
        user.resetPasswordOtp = otp;
        user.resetPasswordOtpExpires = Date.now() + 600000; // 10 minutes

        await user.save();

         // Send OTP via email
         await mailSender.sendMail(
             email,
             'Password Reset OTP',
             `Your OTP for password reset is: ${otp}`
         );

         logger.info('OTP sent to email for password reset for user ID: %d', user.id);

         return res.json({ message: 'OTP sent to your email.' });
     } catch (error) {
         logger.error("Error sending OTP for password reset: %o", error);
         return res.status(500).json({ type: error.name, message: error.message });
     }
};

// Verify the OTP for password reset
exports.verifyPasswordResetOTP = async function (req, res) {
    try {
         const { email, otp } = req.body;

         const user = await User.findOne({ where: { email } });
         if (!user) {
             return res.status(404).json({ message: 'User not found!' });
         }

         if (
             user.resetPasswordOtp !== +otp ||
             Date.now() > user.resetPasswordOtpExpires
         ) {
             return res.status(401).json({ message: 'Invalid or expired OTP' });
         }

         // Mark OTP as confirmed
         user.resetPasswordOtp = null; // or set to a different value to indicate it's used
         user.resetPasswordOtpExpires = null;

         await user.save();
         
         logger.info('OTP confirmed successfully for user ID: %d', user.id);

         return res.json({ message: 'OTP confirmed successfully.' });
     } catch (error) {
         logger.error("Error verifying OTP for password reset: %o", error);
         return res.status(500).json({ type: error.name, message: error.message });
     }
};

// Reset the user's password
exports.resetPassword = async function (req, res) {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
         const errorMessages = errors.array().map((error) => ({
             field: error.path,
             message: error.msg,
         }));
         
         return res.status(400).json({ errors: errorMessages });
     }

     try {
         const { email, newPassword } = req.body;

         const user = await User.findOne({ where: { email } });
         if (!user) {
             return res.status(404).json({ message: 'User not found!' });
         }

         if (user.resetPasswordOtp !== null) {
             return res.status(401).json({ message: 'Confirm OTP before resetting password.' });
         }

         // Hash the new password
         user.password_hash = bcrypt.hashSync(newPassword, 10);
         
         // Clear the OTP fields
         user.resetPasswordOtp = null;
         
         await user.save();

         logger.info('Password reset successfully for user ID: %d', user.id);

         return res.json({ message: 'Password reset successfully' });
     } catch (error) {
         logger.error("Error resetting password for user ID (%s): %o", req.body.email || "unknown", error);
         
         return res.status(500).json({ type: error.name, message: error.message });
     }
};

// Logout the user by removing the token
exports.logout = async function (req, res) {
     try {
       const accessToken = req.headers.authorization.replace('Bearer ', '').trim();
       const tokenRecord = await Token.findOne({ where: { accessToken } });

       if (!tokenRecord) {
           return res.status(404).json({ message: 'Token not found!' });
       }

       await tokenRecord.destroy(); // Delete the token from the database

       logger.info('User logged out successfully. Token removed for access token ID (%s)', accessToken);

       return res.json({ message: 'Logged out successfully' });
   } catch (error) {
       logger.error("Error logging out the user with token (%s): %o", req.headers.authorization.replace('Bearer ', ''), error);
       
       return res.status(500).json({ type: error.name, message: error.message });
   }
};
