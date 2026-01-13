import { AuditLogSanitizer } from './audit-log-sanitizer';

describe('AuditLogSanitizer', () => {
  describe('sanitizeValue', () => {
    it('should remove P2 fields (sensitive content)', () => {
      const value = {
        id: '123',
        title: 'Test',
        body_text: 'Sensitive content here',
        question_text: 'Another sensitive field',
        description: 'Some description',
      };

      const sanitized = AuditLogSanitizer.sanitizeValue(value);

      expect(sanitized).not.toHaveProperty('body_text');
      expect(sanitized).not.toHaveProperty('question_text');
      expect(sanitized).not.toHaveProperty('description');
      expect(sanitized).toHaveProperty('id', '123');
      expect(sanitized).toHaveProperty('title', 'Test');
    });

    it('should remove P1 fields (PII)', () => {
      const value = {
        id: '123',
        email: 'user@example.com',
        phone: '+1234567890',
        first_name: 'John',
        last_name: 'Doe',
        address: '123 Main St',
      };

      const sanitized = AuditLogSanitizer.sanitizeValue(value);

      expect(sanitized).not.toHaveProperty('email');
      expect(sanitized).not.toHaveProperty('phone');
      expect(sanitized).not.toHaveProperty('first_name');
      expect(sanitized).not.toHaveProperty('last_name');
      expect(sanitized).not.toHaveProperty('address');
      expect(sanitized).toHaveProperty('id', '123');
    });

    it('should keep P0 fields (safe data)', () => {
      const value = {
        id: '123',
        slug: 'test-slug',
        status: 'published',
        price: 1000,
        count: 5,
        created_at: '2026-01-01T00:00:00Z',
      };

      const sanitized = AuditLogSanitizer.sanitizeValue(value);

      expect(sanitized).toEqual(value);
    });

    it('should sanitize nested objects', () => {
      const value = {
        id: '123',
        metadata: {
          email: 'user@example.com',
          body_text: 'Sensitive',
          status: 'active',
        },
      };

      const sanitized = AuditLogSanitizer.sanitizeValue(value);

      expect(sanitized).toHaveProperty('id', '123');
      expect(sanitized).toHaveProperty('metadata');
      expect(sanitized.metadata).not.toHaveProperty('email');
      expect(sanitized.metadata).not.toHaveProperty('body_text');
      expect(sanitized.metadata).toHaveProperty('status', 'active');
    });

    it('should sanitize arrays of objects', () => {
      const value = {
        id: '123',
        items: [
          { id: '1', text: 'Sensitive', status: 'active' },
          { id: '2', email: 'user@example.com', count: 5 },
        ],
      };

      const sanitized = AuditLogSanitizer.sanitizeValue(value);

      expect(sanitized).toHaveProperty('id', '123');
      expect(sanitized).toHaveProperty('items');
      expect(sanitized.items).toHaveLength(2);
      expect(sanitized.items[0]).not.toHaveProperty('text');
      expect(sanitized.items[0]).toHaveProperty('id', '1');
      expect(sanitized.items[0]).toHaveProperty('status', 'active');
      expect(sanitized.items[1]).not.toHaveProperty('email');
      expect(sanitized.items[1]).toHaveProperty('id', '2');
      expect(sanitized.items[1]).toHaveProperty('count', 5);
    });

    it('should return null for null input', () => {
      const sanitized = AuditLogSanitizer.sanitizeValue(null);
      expect(sanitized).toBeNull();
    });

    it('should return null if all fields are removed', () => {
      const value = {
        body_text: 'Only sensitive content',
        email: 'user@example.com',
      };

      const sanitized = AuditLogSanitizer.sanitizeValue(value);
      expect(sanitized).toBeNull();
    });

    it('should handle price changes (keep amounts, remove sensitive)', () => {
      const oldValue = {
        id: 'service-1',
        slug: 'primary-consultation',
        price_amount: 5000,
        deposit_amount: 2000,
        description: 'Service description',
      };

      const newValue = {
        id: 'service-1',
        slug: 'primary-consultation',
        price_amount: 6000,
        deposit_amount: 2500,
        description: 'Updated description',
      };

      const sanitizedOld = AuditLogSanitizer.sanitizeValue(oldValue);
      const sanitizedNew = AuditLogSanitizer.sanitizeValue(newValue);

      expect(sanitizedOld).toHaveProperty('id', 'service-1');
      expect(sanitizedOld).toHaveProperty('slug', 'primary-consultation');
      expect(sanitizedOld).toHaveProperty('price_amount', 5000);
      expect(sanitizedOld).toHaveProperty('deposit_amount', 2000);
      expect(sanitizedOld).not.toHaveProperty('description');

      expect(sanitizedNew).toHaveProperty('id', 'service-1');
      expect(sanitizedNew).toHaveProperty('slug', 'primary-consultation');
      expect(sanitizedNew).toHaveProperty('price_amount', 6000);
      expect(sanitizedNew).toHaveProperty('deposit_amount', 2500);
      expect(sanitizedNew).not.toHaveProperty('description');
    });
  });
});
