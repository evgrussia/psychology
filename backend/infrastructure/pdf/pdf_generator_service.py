"""
PDF Generator Service интерфейс и реализация.
"""
from typing import List, Dict, Any
from io import BytesIO
import logging
from application.interfaces.pdf_generator import IPdfGeneratorService

logger = logging.getLogger(__name__)


class ReportLabPdfGeneratorService(IPdfGeneratorService):
    """Реализация IPdfGeneratorService через ReportLab."""
    
    async def generate_diary_pdf(
        self,
        entries: List[Dict[str, Any]],
        user_name: str = "Пользователь"
    ) -> BytesIO:
        """Генерирует PDF из записей дневника."""
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import cm
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
            from reportlab.lib.enums import TA_LEFT, TA_CENTER
            from datetime import datetime
            import json
            
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4)
            story = []
            
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=18,
                textColor='#2c3e50',
                spaceAfter=30,
                alignment=TA_CENTER
            )
            heading_style = ParagraphStyle(
                'CustomHeading',
                parent=styles['Heading2'],
                fontSize=14,
                textColor='#34495e',
                spaceAfter=12,
                spaceBefore=12
            )
            normal_style = styles['Normal']
            
            # Заголовок
            story.append(Paragraph(f"Дневник: {user_name}", title_style))
            story.append(Spacer(1, 0.5*cm))
            
            # Записи
            for entry in entries:
                # Дата записи
                try:
                    entry_date = datetime.fromisoformat(entry['created_at'].replace('Z', '+00:00'))
                    date_str = entry_date.strftime('%d.%m.%Y %H:%M')
                except:
                    date_str = entry.get('created_at', 'Неизвестная дата')
                
                story.append(Paragraph(f"<b>{date_str}</b> - {entry.get('type', 'Запись')}", heading_style))
                
                # Содержимое
                content = entry.get('content', {})
                if isinstance(content, dict):
                    # Форматируем содержимое
                    content_text = self._format_content(content)
                    story.append(Paragraph(content_text, normal_style))
                elif isinstance(content, str):
                    story.append(Paragraph(content, normal_style))
                else:
                    story.append(Paragraph(str(content), normal_style))
                
                story.append(Spacer(1, 0.3*cm))
                story.append(PageBreak())
            
            # Генерация PDF
            doc.build(story)
            buffer.seek(0)
            
            return buffer
        except ImportError:
            logger.error("ReportLab not installed. Install with: pip install reportlab")
            raise RuntimeError("PDF generation requires reportlab library")
        except Exception as e:
            logger.error(f"Failed to generate PDF: {e}")
            raise RuntimeError(f"Failed to generate PDF: {e}") from e
    
    def _format_content(self, content: Dict[str, Any]) -> str:
        """Форматирует содержимое записи для отображения в PDF."""
        formatted_parts = []
        
        for key, value in content.items():
            if isinstance(value, (dict, list)):
                value_str = json.dumps(value, ensure_ascii=False, indent=2)
            else:
                value_str = str(value)
            
            formatted_parts.append(f"<b>{key}:</b> {value_str}")
        
        return "<br/>".join(formatted_parts)
