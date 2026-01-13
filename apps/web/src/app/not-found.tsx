import React from 'react';
import { Button } from '../../../design-system/components';
import { spacing, typography, colors } from '../../../design-system/tokens';

export default function NotFound() {
  return (
    <main style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: spacing.space[6],
      textAlign: 'center',
    }}>
      <div style={{ 
        fontSize: '120px', 
        fontWeight: 800, 
        color: colors.brand.primary.light,
        lineHeight: 1,
        marginBottom: spacing.space[4]
      }}>
        404
      </div>
      
      <h1 style={{ ...typography.h1, marginBottom: spacing.space[4] }}>
        Страница не найдена
      </h1>
      
      <p style={{ 
        ...typography.body, 
        maxWidth: '500px', 
        marginBottom: spacing.space[8],
        color: colors.text.secondary
      }}>
        Похоже, эта страница куда-то ушла. Но не волнуйтесь, мы поможем вам найти дорогу.
      </p>

      <div style={{ 
        backgroundColor: colors.bg.secondary,
        padding: spacing.space[8],
        borderRadius: '24px',
        width: '100%',
        maxWidth: '600px',
        marginBottom: spacing.space[8]
      }}>
        <h2 style={{ ...typography.h2, marginBottom: spacing.space[6] }}>С чего начать?</h2>
        <p style={{ ...typography.body, marginBottom: spacing.space[6], color: colors.text.secondary }}>
          Вы можете начать с руководства, изучить материалы блога или узнать больше об услугах.
        </p>
        <nav style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: spacing.space[4] 
        }} aria-label="Навигация по основным разделам">
          <a href="/start" style={{ 
            padding: spacing.space[4], 
            backgroundColor: 'white', 
            borderRadius: '12px',
            textDecoration: 'none',
            color: colors.text.primary,
            fontWeight: 500,
            border: `1px solid ${colors.border.primary}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: spacing.space[2],
            transition: 'box-shadow 0.2s ease'
          }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
            <span style={{ fontSize: '24px' }}>📖</span>
            <span>Руководство</span>
          </a>
          <a href="/blog" style={{ 
            padding: spacing.space[4], 
            backgroundColor: 'white', 
            borderRadius: '12px',
            textDecoration: 'none',
            color: colors.text.primary,
            fontWeight: 500,
            border: `1px solid ${colors.border.primary}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: spacing.space[2],
            transition: 'box-shadow 0.2s ease'
          }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
            <span style={{ fontSize: '24px' }}>📝</span>
            <span>Читать блог</span>
          </a>
          <a href="/services" style={{ 
            padding: spacing.space[4], 
            backgroundColor: 'white', 
            borderRadius: '12px',
            textDecoration: 'none',
            color: colors.text.primary,
            fontWeight: 500,
            border: `1px solid ${colors.border.primary}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: spacing.space[2],
            transition: 'box-shadow 0.2s ease'
          }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
            <span style={{ fontSize: '24px' }}>🤝</span>
            <span>Мои услуги</span>
          </a>
          <a href="/about" style={{ 
            padding: spacing.space[4], 
            backgroundColor: 'white', 
            borderRadius: '12px',
            textDecoration: 'none',
            color: colors.text.primary,
            fontWeight: 500,
            border: `1px solid ${colors.border.primary}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: spacing.space[2],
            transition: 'box-shadow 0.2s ease'
          }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
            <span style={{ fontSize: '24px' }}>👩‍💼</span>
            <span>О психологе</span>
          </a>
        </nav>
      </div>

      <Button variant="primary" size="lg" onClick={() => window.location.href = '/'}>
        На главную
      </Button>
    </main>
  );
}
