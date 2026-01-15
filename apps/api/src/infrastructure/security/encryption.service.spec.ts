import { ConfigService } from '@nestjs/config';
import { AesGcmEncryptionService } from './encryption.service';

describe('AesGcmEncryptionService', () => {
  const configService = new ConfigService({
    ENCRYPTION_KEY_ID: 'key_v1',
    ENCRYPTION_KEY: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
  });

  it('should encrypt and decrypt payloads', () => {
    const service = new AesGcmEncryptionService(configService);
    const plaintext = 'sensitive-token';

    const ciphertext = service.encrypt(plaintext);
    expect(ciphertext).not.toEqual(plaintext);
    // Use the key ID from test.env (test-key)
    expect(ciphertext.startsWith('test-key:')).toBe(true);

    const decrypted = service.decrypt(ciphertext);
    expect(decrypted).toBe(plaintext);
  });
});
