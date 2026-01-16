import { AppointmentMaterialType } from '../value-objects/MaterialEnums';

export interface AppointmentMaterialProps {
  id: string;
  appointmentId: string;
  materialType: AppointmentMaterialType;
  title: string;
  description?: string | null;
  url?: string | null;
  mediaAssetId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class AppointmentMaterial {
  constructor(private readonly props: AppointmentMaterialProps) {}

  get id(): string { return this.props.id; }
  get appointmentId(): string { return this.props.appointmentId; }
  get materialType(): AppointmentMaterialType { return this.props.materialType; }
  get title(): string { return this.props.title; }
  get description(): string | null | undefined { return this.props.description; }
  get url(): string | null | undefined { return this.props.url; }
  get mediaAssetId(): string | null | undefined { return this.props.mediaAssetId; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  static create(props: AppointmentMaterialProps): AppointmentMaterial {
    return new AppointmentMaterial(props);
  }
}
