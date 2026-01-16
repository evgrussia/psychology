import { AppointmentMaterialType as PrismaMaterialType, AppointmentMaterial as PrismaAppointmentMaterial, MediaAsset as PrismaMediaAsset } from '@prisma/client';
import { AppointmentMaterial } from '@domain/booking/entities/AppointmentMaterial';
import { AppointmentMaterialType } from '@domain/booking/value-objects/MaterialEnums';

type AppointmentMaterialRecord = PrismaAppointmentMaterial & {
  media_asset?: PrismaMediaAsset | null;
};

export class AppointmentMaterialMapper {
  static toDomain(record: AppointmentMaterialRecord): AppointmentMaterial {
    return AppointmentMaterial.create({
      id: record.id,
      appointmentId: record.appointment_id,
      materialType: this.mapTypeToDomain(record.material_type),
      title: record.title,
      description: record.description,
      url: record.media_asset?.public_url ?? record.link_url,
      mediaAssetId: record.media_asset_id,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    });
  }

  private static mapTypeToDomain(type: PrismaMaterialType): AppointmentMaterialType {
    switch (type) {
      case PrismaMaterialType.file:
        return AppointmentMaterialType.file;
      case PrismaMaterialType.link:
        return AppointmentMaterialType.link;
      default:
        throw new Error(`Unknown AppointmentMaterialType: ${type}`);
    }
  }
}
