import React from 'react';
import { Card } from '../Card';

export interface ResultCardProps {
  title: string;
  level?: 'low' | 'moderate' | 'high';
  description: string;
  steps?: { title: string; items: string[] }[];
  children?: React.ReactNode;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  title,
  level,
  description,
  steps,
  children,
}) => {
  const levelColors = {
    low: 'bg-green-50 text-green-700 border-green-100',
    moderate: 'bg-amber-50 text-amber-700 border-amber-100',
    high: 'bg-red-50 text-red-700 border-red-100',
  };

  const levelLabels = {
    low: 'Низкий уровень',
    moderate: 'Умеренный уровень',
    high: 'Высокий уровень',
  };

  return (
    <Card className="p-8 max-w-2xl mx-auto border-indigo-50 shadow-sm">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{title}</h2>
        
        {level && (
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-6 border ${levelColors[level]}`}>
            {levelLabels[level]}
          </div>
        )}
        
        <p className="text-slate-600 leading-relaxed italic">
          «{description}»
        </p>
      </div>

      {steps && steps.length > 0 && (
        <div className="space-y-8 mb-8">
          {steps.map((step, idx) => (
            <div key={idx}>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs mr-3 shrink-0">
                  {idx + 1}
                </span>
                {step.title}
              </h3>
              <ul className="space-y-3 pl-9">
                {step.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-slate-600 flex items-start">
                    <span className="text-indigo-400 mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {children}
      
      <div className="mt-8 pt-8 border-t border-slate-100 text-xs text-slate-400 leading-tight">
        Этот инструмент носит информационный характер и не заменяет консультацию специалиста. 
        Если ваше состояние ухудшается, обратитесь за профессиональной помощью.
      </div>
    </Card>
  );
};
