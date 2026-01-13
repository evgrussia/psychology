import React from 'react';
import { Button } from '../Button';

export interface CrisisBannerProps {
  title?: string;
  description?: string;
  onEmergencyClick?: () => void;
  variant?: 'inline' | 'fixed';
  surface?: string;
}

export const CrisisBanner: React.FC<CrisisBannerProps> = ({
  title = 'Вам нужна поддержка прямо сейчас?',
  description = 'Если вы чувствуете, что не справляетесь, или находитесь в кризисном состоянии, пожалуйста, обратитесь за бесплатной экстренной помощью.',
  onEmergencyClick,
  variant = 'inline',
  surface,
}) => {
  const containerClasses = variant === 'fixed' 
    ? 'fixed bottom-0 left-0 right-0 z-50 bg-red-50 border-t border-red-200 p-4 shadow-lg'
    : 'bg-red-50 border border-red-200 rounded-xl p-6 my-6';

  return (
    <div className={containerClasses}>
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-red-900 font-bold text-lg mb-1">{title}</h3>
          <p className="text-red-800 text-sm">{description}</p>
        </div>
        <div className="flex shrink-0 gap-3">
          <Button 
            variant="primary" 
            className="bg-red-600 hover:bg-red-700 text-white border-none"
            onClick={onEmergencyClick}
          >
            Экстренная помощь
          </Button>
        </div>
      </div>
    </div>
  );
};
