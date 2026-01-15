import { Service } from '@domain/booking/entities/Service';
import { ServiceFormat, ServiceStatus } from '@domain/booking/value-objects/ServiceEnums';

export class ServiceMapper {
  static toDomain(record: any): Service {
    return Service.reconstitute({
      id: record.id,
      slug: record.slug,
      title: record.title,
      descriptionMarkdown: record.description_markdown,
      format: record.format as ServiceFormat,
      offlineAddress: record.offline_address,
      durationMinutes: record.duration_minutes,
      priceAmount: record.price_amount,
      depositAmount: record.deposit_amount,
      cancelFreeHours: record.cancel_free_hours,
      cancelPartialHours: record.cancel_partial_hours,
      rescheduleMinHours: record.reschedule_min_hours,
      rescheduleMaxCount: record.reschedule_max_count,
      status: record.status as ServiceStatus,
      topicCode: record.topic_code,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    });
  }

  static toPrisma(service: Service): any {
    const obj = service.toObject();
    return {
      id: obj.id,
      slug: obj.slug,
      title: obj.title,
      description_markdown: obj.descriptionMarkdown,
      format: obj.format,
      offline_address: obj.offlineAddress,
      duration_minutes: obj.durationMinutes,
      price_amount: obj.priceAmount,
      deposit_amount: obj.depositAmount,
      cancel_free_hours: obj.cancelFreeHours,
      cancel_partial_hours: obj.cancelPartialHours,
      reschedule_min_hours: obj.rescheduleMinHours,
      reschedule_max_count: obj.rescheduleMaxCount,
      status: obj.status,
      topic_code: obj.topicCode,
      created_at: obj.createdAt,
      updated_at: obj.updatedAt,
    };
  }
}
