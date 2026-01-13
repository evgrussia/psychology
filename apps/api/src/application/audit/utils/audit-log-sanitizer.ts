/**
 * Sanitizes audit log values to remove P2 (sensitive) data and minimize P1 (PII) data.
 * 
 * P0 (safe): technical and aggregated data (IDs, slugs, categories, statuses)
 * P1 (PII): email, phone, names - should be removed or replaced with references
 * P2 (sensitive): diary entries, intake forms, question texts, UGC - must be removed
 * 
 * Rules:
 * - Remove any fields that might contain free text (P2)
 * - Replace email/phone with references (user_id) where possible
 * - Keep only structural changes (price amounts, status changes, IDs)
 */
export class AuditLogSanitizer {
  /**
   * Sanitizes old/new values for audit log entry
   * Removes P2 data and minimizes P1 data
   */
  static sanitizeValue(value: Record<string, any> | null): Record<string, any> | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const sanitized: Record<string, any> = {};

    for (const [key, val] of Object.entries(value)) {
      // Skip P2 fields (sensitive content)
      if (this.isP2Field(key)) {
        continue;
      }

      // Handle P1 fields (PII) - replace with reference or remove
      if (this.isP1Field(key)) {
        // For email/phone, we might want to keep a reference that it was changed
        // but not the actual value. For now, we'll remove them.
        continue;
      }

      // Handle nested objects
      if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        const sanitizedNested = this.sanitizeValue(val);
        if (sanitizedNested && Object.keys(sanitizedNested).length > 0) {
          sanitized[key] = sanitizedNested;
        }
      } else if (Array.isArray(val)) {
        // For arrays, sanitize each item if it's an object
        const sanitizedArray = val.map((item) => {
          if (item && typeof item === 'object' && !(item instanceof Date)) {
            return this.sanitizeValue(item);
          }
          return item;
        }).filter((item) => item !== null && item !== undefined);
        if (sanitizedArray.length > 0) {
          sanitized[key] = sanitizedArray;
        }
      } else {
        // Keep P0 fields (IDs, slugs, statuses, numbers, dates)
        sanitized[key] = val;
      }
    }

    return Object.keys(sanitized).length > 0 ? sanitized : null;
  }

  /**
   * Checks if a field name indicates P2 (sensitive) data
   */
  private static isP2Field(key: string): boolean {
    const p2Patterns = [
      /text/i,
      /content/i,
      /body/i,
      /message/i,
      /question/i,
      /answer/i,
      /diary/i,
      /entry/i,
      /note/i,
      /description/i,
      /payload/i,
      /encrypted/i,
      /response/i,
      /comment/i,
      /review/i,
    ];

    return p2Patterns.some((pattern) => pattern.test(key));
  }

  /**
   * Checks if a field name indicates P1 (PII) data
   */
  private static isP1Field(key: string): boolean {
    const p1Patterns = [
      /email/i,
      /phone/i,
      /telephone/i,
      /name/i,
      /firstname/i,
      /lastname/i,
      /surname/i,
      /address/i,
    ];

    return p1Patterns.some((pattern) => pattern.test(key));
  }
}
