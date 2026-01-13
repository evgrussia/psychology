export enum ConsentTypeValue {
  PERSONAL_DATA = 'personal_data',
  COMMUNICATIONS = 'communications',
  TELEGRAM = 'telegram',
  REVIEW_PUBLICATION = 'review_publication',
}

export class ConsentType {
  private constructor(public readonly value: ConsentTypeValue) {}

  static readonly PERSONAL_DATA = new ConsentType(ConsentTypeValue.PERSONAL_DATA);
  static readonly COMMUNICATIONS = new ConsentType(ConsentTypeValue.COMMUNICATIONS);
  static readonly TELEGRAM = new ConsentType(ConsentTypeValue.TELEGRAM);
  static readonly REVIEW_PUBLICATION = new ConsentType(ConsentTypeValue.REVIEW_PUBLICATION);

  static fromValue(value: string): ConsentType {
    switch (value) {
      case ConsentTypeValue.PERSONAL_DATA:
        return ConsentType.PERSONAL_DATA;
      case ConsentTypeValue.COMMUNICATIONS:
        return ConsentType.COMMUNICATIONS;
      case ConsentTypeValue.TELEGRAM:
        return ConsentType.TELEGRAM;
      case ConsentTypeValue.REVIEW_PUBLICATION:
        return ConsentType.REVIEW_PUBLICATION;
      default:
        throw new Error(`Unknown consent type: ${value}`);
    }
  }

  equals(other: ConsentType): boolean {
    return this.value === other.value;
  }
}
