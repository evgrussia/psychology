"""
Django ORM реализация IServiceRepository.
"""
from typing import List, Optional
from domain.booking.aggregates.service import Service, ServiceId
from domain.booking.repositories import IServiceRepository
from infrastructure.persistence.django_models.booking import ServiceModel
from infrastructure.persistence.mappers.booking_mapper import ServiceMapper
from infrastructure.exceptions import InfrastructureError


class PostgresServiceRepository(IServiceRepository):
    """Реализация IServiceRepository для PostgreSQL через Django ORM."""
    
    async def find_by_id(self, id: ServiceId) -> Optional[Service]:
        """Найти Service по ID."""
        try:
            record = await ServiceModel.objects.aget(id=id.value)
            return ServiceMapper.to_domain(record)
        except ServiceModel.DoesNotExist:
            return None
        except Exception as e:
            raise InfrastructureError(f"Failed to find service: {e}") from e
    
    async def find_by_slug(self, slug: str) -> Optional[Service]:
        """Найти Service по slug."""
        try:
            record = await ServiceModel.objects.aget(slug=slug)
            return ServiceMapper.to_domain(record)
        except ServiceModel.DoesNotExist:
            return None
        except Exception as e:
            raise InfrastructureError(f"Failed to find service by slug: {e}") from e
    
    async def find_all(self) -> List[Service]:
        """Найти все Service."""
        try:
            records = ServiceModel.objects.filter(status='published')
            
            services = []
            async for record in records:
                services.append(ServiceMapper.to_domain(record))
            
            return services
        except Exception as e:
            raise InfrastructureError(f"Failed to find all services: {e}") from e
