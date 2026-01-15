import { ServiceFormat, ServiceStatus } from '../value-objects/ServiceEnums';

export interface ServiceProps {
  id: string;
  slug: string;
  title: string;
  descriptionMarkdown: string;
  format: ServiceFormat;
  offlineAddress?: string | null;
  durationMinutes: number;
  priceAmount: number;
  depositAmount?: number | null;
  cancelFreeHours?: number | null;
  cancelPartialHours?: number | null;
  rescheduleMinHours?: number | null;
  rescheduleMaxCount?: number | null;
  status: ServiceStatus;
  topicCode?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Service {
  private constructor(private readonly props: ServiceProps) {}

  static create(props: ServiceProps): Service {
    Service.validate(props);
    return new Service(props);
  }

  static reconstitute(props: ServiceProps): Service {
    return new Service(props);
  }

  private static validate(props: ServiceProps): void {
    if (!props.slug || props.slug.trim().length === 0) {
      throw new Error('Service slug is required');
    }
    if (!props.title || props.title.trim().length === 0) {
      throw new Error('Service title is required');
    }
    if (!props.descriptionMarkdown || props.descriptionMarkdown.trim().length === 0) {
      throw new Error('Service description is required');
    }
    if (props.durationMinutes <= 0) {
      throw new Error('Service duration must be greater than 0');
    }
    if (props.priceAmount < 0) {
      throw new Error('Service price cannot be negative');
    }
    if (props.depositAmount !== null && props.depositAmount !== undefined && props.depositAmount < 0) {
      throw new Error('Service deposit cannot be negative');
    }
    if (
      props.depositAmount !== null &&
      props.depositAmount !== undefined &&
      props.depositAmount > props.priceAmount
    ) {
      throw new Error('Service deposit cannot exceed price');
    }
    if (props.cancelFreeHours !== null && props.cancelFreeHours !== undefined && props.cancelFreeHours < 0) {
      throw new Error('Cancel free hours cannot be negative');
    }
    if (props.cancelPartialHours !== null && props.cancelPartialHours !== undefined && props.cancelPartialHours < 0) {
      throw new Error('Cancel partial hours cannot be negative');
    }
    if (
      props.cancelFreeHours !== null &&
      props.cancelFreeHours !== undefined &&
      props.cancelPartialHours !== null &&
      props.cancelPartialHours !== undefined &&
      props.cancelFreeHours < props.cancelPartialHours
    ) {
      throw new Error('Cancel free hours must be greater than or equal to partial hours');
    }
    if (props.rescheduleMinHours !== null && props.rescheduleMinHours !== undefined && props.rescheduleMinHours < 0) {
      throw new Error('Reschedule minimum hours cannot be negative');
    }
    if (props.rescheduleMaxCount !== null && props.rescheduleMaxCount !== undefined && props.rescheduleMaxCount < 0) {
      throw new Error('Reschedule max count cannot be negative');
    }
    if (props.format === ServiceFormat.offline && !props.offlineAddress) {
      throw new Error('Offline services require an address');
    }
  }

  get id(): string { return this.props.id; }
  get slug(): string { return this.props.slug; }
  get title(): string { return this.props.title; }
  get descriptionMarkdown(): string { return this.props.descriptionMarkdown; }
  get format(): ServiceFormat { return this.props.format; }
  get offlineAddress(): string | null | undefined { return this.props.offlineAddress; }
  get durationMinutes(): number { return this.props.durationMinutes; }
  get priceAmount(): number { return this.props.priceAmount; }
  get depositAmount(): number | null | undefined { return this.props.depositAmount; }
  get cancelFreeHours(): number | null | undefined { return this.props.cancelFreeHours; }
  get cancelPartialHours(): number | null | undefined { return this.props.cancelPartialHours; }
  get rescheduleMinHours(): number | null | undefined { return this.props.rescheduleMinHours; }
  get rescheduleMaxCount(): number | null | undefined { return this.props.rescheduleMaxCount; }
  get status(): ServiceStatus { return this.props.status; }
  get topicCode(): string | null | undefined { return this.props.topicCode; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  toObject(): ServiceProps {
    return { ...this.props };
  }
}
