"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptPayload = exports.encryptPayload = void 0;
const crypto_1 = __importDefault(require("crypto"));
const algorithm = "aes-256-gcm";
const getEncryptionKey = () => {
    const secret = process.env.MESSAGE_ENCRYPTION_KEY ||
        process.env.JWT_SECRET ||
        "streamflow-development-key";
    return crypto_1.default
        .createHash("sha256")
        .update(secret)
        .digest();
};
const encryptPayload = (payload) => {
    const iv = crypto_1.default.randomBytes(12);
    const cipher = crypto_1.default.createCipheriv(algorithm, getEncryptionKey(), iv);
    const encrypted = Buffer.concat([
        cipher.update(JSON.stringify(payload), "utf8"),
        cipher.final(),
    ]);
    return {
        encryptedPayload: encrypted.toString("base64"),
        iv: iv.toString("base64"),
        authTag: cipher
            .getAuthTag()
            .toString("base64"),
    };
};
exports.encryptPayload = encryptPayload;
const decryptPayload = (encryptedPayload, iv, authTag) => {
    const decipher = crypto_1.default.createDecipheriv(algorithm, getEncryptionKey(), Buffer.from(iv, "base64"));
    decipher.setAuthTag(Buffer.from(authTag, "base64"));
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedPayload, "base64")),
        decipher.final(),
    ]);
    return JSON.parse(decrypted.toString("utf8"));
};
exports.decryptPayload = decryptPayload;
