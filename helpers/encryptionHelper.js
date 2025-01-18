const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Ensure it's 32 bytes
const IV_LENGTH = 16; // AES block size

/**
 * Encrypt a value using AES-256-CBC
 * @param {string} value - The plaintext value to encrypt
 * @returns {string} - The encrypted value in the format `iv:encrypted`
 */
function encrypt(value) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    const encrypted = cipher.update(value, 'utf8', 'hex') + cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt a value using AES-256-CBC
 * @param {string} encryptedValue - The encrypted value in the format `iv:encrypted`
 * @returns {string} - The decrypted plaintext value
 */
function decrypt(encryptedValue) {
    try {
        // Split the encrypted value into IV and ciphertext
        const [iv, encrypted] = encryptedValue.split(':');
        if (!iv || !encrypted) {
            throw new Error('Invalid encrypted value format.');
        }

        // Initialize the decipher
        const decipher = crypto.createDecipheriv(
            'aes-256-cbc',
            Buffer.from(ENCRYPTION_KEY),
            Buffer.from(iv, 'hex')
        );

        // Decrypt and return the plaintext
        const decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
        return decrypted;
    } catch (error) {
        throw new Error(`Decryption failed: ${error.message}`);
    }
}


module.exports = { encrypt, decrypt };
