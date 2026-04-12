const crypto = require('crypto');
const os = require('os');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const SCRYPT_KEY_LEN = 32;

function getMasterKey() {
    const hwFingerprint = [
        os.hostname(),
        os.cpus()[0]?.model || 'generic-cpu',
        os.platform(),
        os.arch(),
        'jpe-studio-industrial-shield'
    ].join(':');

    const salt = crypto.createHash('sha256').update('jpe-studio-industrial-salt-v1').digest();
    return crypto.scryptSync(hwFingerprint, salt, SCRYPT_KEY_LEN);
}

function encrypt(plaintext) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getMasterKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    let ct = cipher.update(plaintext, 'utf8', 'hex');
    ct += cipher.final('hex');
    const at = cipher.getAuthTag().toString('hex');
    return JSON.stringify({ iv: iv.toString('hex'), at: at, ct: ct });
}

function decrypt(payload) {
    const { iv, at, ct } = JSON.parse(payload);
    const key = getMasterKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'), { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(Buffer.from(at, 'hex'));
    let dt = decipher.update(ct, 'hex', 'utf8');
    dt += decipher.final('utf8');
    return dt;
}

const original = "Sensitive AI Key 12345";
const encrypted = encrypt(original);
const decrypted = decrypt(encrypted);

console.log("Original: " + original);
console.log("Encrypted: " + encrypted);
console.log("Decrypted: " + decrypted);
console.log("Integrity Match: " + (original === decrypted));
