import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { IEncryptionService } from '@domain/security/services/IEncryptionService';

const IV_LENGTH_BYTES = 12;
const AUTH_TAG_LENGTH_BYTES = 16;

@Injectable()
export class AesGcmEncryptionService implements IEncryptionService {
  private readonly key: Buffer;
  private readonly keyId: string;

  constructor(private readonly configService: ConfigService) {
    const keyId = this.configService.get<string>('ENCRYPTION_KEY_ID');
    const keyBase64 = this.configService.get<string>('ENCRYPTION_KEY');

    if (!keyId || !keyBase64) {
      throw new Error('ENCRYPTION_KEY_ID and ENCRYPTION_KEY must be set');
    }

    const key = Buffer.from(keyBase64, 'base64');
    if (key.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be a 32-byte key encoded in base64');
    }

    this.keyId = keyId;
    this.key = key;
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(IV_LENGTH_BYTES);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return [
      this.keyId,
      iv.toString('base64'),
      authTag.toString('base64'),
      ciphertext.toString('base64'),
    ].join(':');
  }

  decrypt(ciphertext: string): string {
    const [keyId, ivBase64, authTagBase64, dataBase64] = ciphertext.split(':');

    if (!keyId || !ivBase64 || !authTagBase64 || !dataBase64) {
      throw new Error('Invalid ciphertext format');
    }

    if (keyId !== this.keyId) {
      throw new Error('Encryption key id mismatch');
    }

    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    const data = Buffer.from(dataBase64, 'base64');

    if (iv.length !== IV_LENGTH_BYTES || authTag.length !== AUTH_TAG_LENGTH_BYTES) {
      throw new Error('Invalid ciphertext metadata');
    }

    const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(authTag);

    const plaintext = Buffer.concat([decipher.update(data), decipher.final()]);
    return plaintext.toString('utf8');
  }
}
