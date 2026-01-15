export class BookingConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BookingConflictError';
  }
}

export class BookingTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BookingTimeoutError';
  }
}

export class IdempotencyKeyConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IdempotencyKeyConflictError';
  }
}
