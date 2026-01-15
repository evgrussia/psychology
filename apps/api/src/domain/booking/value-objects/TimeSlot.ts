export class TimeSlot {
  constructor(
    readonly startAtUtc: Date,
    readonly endAtUtc: Date,
  ) {
    if (endAtUtc <= startAtUtc) {
      throw new Error('TimeSlot end must be after start');
    }
  }

  overlaps(other: TimeSlot): boolean {
    return this.startAtUtc < other.endAtUtc && this.endAtUtc > other.startAtUtc;
  }
}
