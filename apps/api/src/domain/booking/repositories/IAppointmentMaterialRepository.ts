import { AppointmentMaterial } from '../entities/AppointmentMaterial';

export interface IAppointmentMaterialRepository {
  findByClientUserId(clientUserId: string): Promise<AppointmentMaterial[]>;
}
