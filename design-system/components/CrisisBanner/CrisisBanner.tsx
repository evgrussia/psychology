import React from 'react';
import { Button } from '../Button';
import { track } from '../../../apps/web/src/lib/tracking';

export interface CrisisBannerProps {
  title?: string;
  description?: string;
  variant?: 'inline' | 'fixed';
  surface?: 'quiz' | 'question' | 'navigator' | 'thermometer' | 'other';
  triggerType?: 'self_harm' | 'suicidal_ideation' | 'violence' | 'minor_risk' | 'panic_like';
  onBackToResources?: () => void;
}

export const CrisisBanner: React.FC<CrisisBannerProps> = ({
  title = 'Вам нужна поддержка прямо сейчас?',
  description = 'Мы заметили, что ваше состояние может требовать немедленной профессиональной помощи. Пожалуйста, воспользуйтесь контактами ниже — это бесплатно, анонимно и круглосуточно.',
  variant = 'inline',
  surface = 'other',
  triggerType,
  onBackToResources,
}) => {
  React.useEffect(() => {
    track('crisis_banner_shown', { 
      trigger_type: triggerType || 'unknown', 
      surface 
    });
  }, [triggerType, surface]);

  const handleAction = (action: 'call_112' | 'hotline' | 'tell_someone' | 'back_to_resources') => {
    track('crisis_help_click', { action });
    if (action === 'call_112') {
      window.location.href = 'tel:112';
    } else if (action === 'hotline') {
      window.location.href = 'tel:88002000122';
    } else if (action === 'back_to_resources' && onBackToResources) {
      onBackToResources();
    } else if (action === 'tell_someone') {
      // Logic for "tell someone" - maybe redirect to a specific page or show more info
      window.location.href = '/emergency';
    }
  };

  const containerClasses = variant === 'fixed' 
    ? 'fixed bottom-0 left-0 right-0 z-50 bg-red-50 border-t-2 border-red-600 p-6 shadow-2xl animate-in slide-in-from-bottom duration-500'
    : 'bg-red-50 border-2 border-red-200 rounded-2xl p-8 my-8 shadow-sm';

  return (
    <div className={containerClasses} role="alert" aria-live="assertive">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-red-900 font-bold text-2xl mb-2 flex items-center justify-center md:justify-start gap-2">
              <span aria-hidden="true">⚠️</span> {title}
            </h3>
            <p className="text-red-800 text-lg leading-relaxed">{description}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="primary" 
              className="bg-red-600 hover:bg-red-700 text-white border-none h-auto py-4 flex flex-col items-center gap-1"
              onClick={() => handleAction('call_112')}
              aria-label="Позвонить в службу экстренной помощи 112"
            >
              <span className="text-sm opacity-90 uppercase font-semibold">Служба спасения</span>
              <span className="text-xl font-bold">112</span>
            </Button>
            
            <Button 
              variant="primary" 
              className="bg-red-500 hover:bg-red-600 text-white border-none h-auto py-4 flex flex-col items-center gap-1"
              onClick={() => handleAction('hotline')}
              aria-label="Позвонить на телефон доверия 8-800-2000-122"
            >
              <span className="text-sm opacity-90 uppercase font-semibold">Телефон доверия</span>
              <span className="text-base font-bold whitespace-nowrap">8-800-2000-122</span>
            </Button>

            <Button 
              variant="secondary" 
              className="border-red-200 text-red-700 hover:bg-red-100 h-auto py-4"
              onClick={() => handleAction('tell_someone')}
            >
              Другие способы помощи
            </Button>

            <Button 
              variant="secondary" 
              className="border-transparent text-red-600 hover:text-red-800 h-auto py-4 bg-transparent"
              onClick={() => handleAction('back_to_resources')}
            >
              Я в безопасности, вернуться
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
