import crypto from "crypto";

const algorithm = "aes-256-gcm";

const getEncryptionKey = () => {
  const secret =
    process.env.MESSAGE_ENCRYPTION_KEY ||
    process.env.JWT_SECRET ||
    "streamflow-development-key";

  return crypto
    .createHash("sha256")
    .update(secret)
    .digest();
};

export const encryptPayload = (
  payload: unknown
) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    algorithm,
    getEncryptionKey(),
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(
      JSON.stringify(payload),
      "utf8"
    ),
    cipher.final(),
  ]);

  return {
    encryptedPayload:
      encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: cipher
      .getAuthTag()
      .toString("base64"),
  };
};

export const decryptPayload = <T>(
  encryptedPayload: string,
  iv: string,
  authTag: string
): T => {
  const decipher =
    crypto.createDecipheriv(
      algorithm,
      getEncryptionKey(),
      Buffer.from(iv, "base64")
    );

  decipher.setAuthTag(
    Buffer.from(authTag, "base64")
  );

  const decrypted = Buffer.concat([
    decipher.update(
      Buffer.from(
        encryptedPayload,
        "base64"
      )
    ),
    decipher.final(),
  ]);

  return JSON.parse(
    decrypted.toString("utf8")
  ) as T;
};
