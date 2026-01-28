"""
Unit тесты для PostgresLeadRepository.
"""
import pytest
from domain.analytics.aggregates.lead import Lead, LeadId
from domain.analytics.value_objects.lead_status import LeadStatus
from domain.analytics.value_objects.lead_source import LeadSource
from domain.analytics.value_objects.lead_identity import LeadIdentity
from infrastructure.persistence.repositories.crm.lead_repository import PostgresLeadRepository
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.mark.django_db
class TestPostgresLeadRepository:
    """Unit тесты для PostgresLeadRepository."""
    
    @pytest.fixture
    def event_bus(self):
        return InMemoryEventBus()
    
    @pytest.fixture
    def repository(self, event_bus):
        return PostgresLeadRepository(event_bus)
    
    @pytest.mark.asyncio
    async def test_save_and_find_by_id(self, repository):
        """Тест сохранения и поиска по ID."""
        identity = LeadIdentity(anonymous_id='test-anonymous-id')
        lead = Lead.create(
            identity=identity,
            source=LeadSource('web')
        )
        
        await repository.save(lead)
        
        found = await repository.find_by_id(lead.id)
        
        assert found is not None
        assert found.id.value == lead.id.value
        assert found.status.value == LeadStatus.NEW.value
        assert found.source.value == 'web'
    
    @pytest.mark.asyncio
    async def test_find_by_id_not_found(self, repository):
        """Тест поиска по несуществующему ID."""
        non_existent_id = LeadId.generate()
        
        found = await repository.find_by_id(non_existent_id)
        
        assert found is None
    
    @pytest.mark.asyncio
    async def test_find_by_status(self, repository):
        """Тест поиска по статусу."""
        # Создать несколько лидов с разными статусами
        identity1 = LeadIdentity(anonymous_id='anon1')
        lead1 = Lead.create(
            identity=identity1,
            source=LeadSource('web')
        )
        # lead1 имеет статус NEW по умолчанию
        
        identity2 = LeadIdentity(anonymous_id='anon2')
        lead2 = Lead.create(
            identity=identity2,
            source=LeadSource('telegram')
        )
        lead2.update_status(LeadStatus.QUALIFIED)
        
        identity3 = LeadIdentity(anonymous_id='anon3')
        lead3 = Lead.create(
            identity=identity3,
            source=LeadSource('web')
        )
        # lead3 имеет статус NEW по умолчанию
        
        await repository.save(lead1)
        await repository.save(lead2)
        await repository.save(lead3)
        
        # Найти все NEW лиды
        new_leads = await repository.find_by_status(LeadStatus.NEW)
        
        assert len(new_leads) >= 2
        new_lead_ids = [lead.id.value for lead in new_leads]
        assert lead1.id.value in new_lead_ids
        assert lead3.id.value in new_lead_ids
        assert lead2.id.value not in new_lead_ids
