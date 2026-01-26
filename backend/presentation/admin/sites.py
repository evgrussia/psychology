"""
Django Admin site configuration.
"""
from django.contrib.admin import AdminSite


class PsychologyAdminSite(AdminSite):
    site_header = "Эмоциональный баланс - Админ-панель"
    site_title = "Эмоциональный баланс"
    index_title = "Администрирование"


admin_site = PsychologyAdminSite(name='psychology_admin')
