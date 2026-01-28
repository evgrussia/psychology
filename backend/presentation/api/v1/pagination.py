"""
Custom pagination для API.
"""
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsSetPagination(PageNumberPagination):
    """
    Стандартная пагинация для списков.
    """
    page_size = 20
    page_size_query_param = 'per_page'
    max_page_size = 100
    
    def get_paginated_response(self, data):
        return Response({
            'data': data,
            'pagination': {
                'page': self.page.number,
                'per_page': self.page.paginator.per_page,
                'total': self.page.paginator.count,
                'total_pages': self.page.paginator.num_pages,
                'has_next': self.page.has_next(),
                'has_previous': self.page.has_previous(),
            }
        })


class LargeResultsSetPagination(PageNumberPagination):
    """
    Пагинация для больших списков (админка).
    """
    page_size = 50
    page_size_query_param = 'per_page'
    max_page_size = 200
    
    def get_paginated_response(self, data):
        return Response({
            'data': data,
            'pagination': {
                'page': self.page.number,
                'per_page': self.page.paginator.per_page,
                'total': self.page.paginator.count,
                'total_pages': self.page.paginator.num_pages,
                'has_next': self.page.has_next(),
                'has_previous': self.page.has_previous(),
            }
        })
