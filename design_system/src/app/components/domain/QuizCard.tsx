import { CheckCircle2, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { useState } from 'react';

interface QuizCardProps {
  variant?: 'single-choice' | 'multi-choice' | 'scale';
}

export function QuizCard({ variant = 'single-choice' }: QuizCardProps) {
  const [selectedSingle, setSelectedSingle] = useState('');
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);
  const [scaleValue, setScaleValue] = useState([5]);

  if (variant === 'single-choice') {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Как часто вы чувствуете тревогу?</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Выберите один вариант, который лучше всего описывает ваше состояние
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={selectedSingle} onValueChange={setSelectedSingle}>
            <div className="space-y-3">
              {[
                { value: 'never', label: 'Никогда или почти никогда' },
                { value: 'sometimes', label: 'Иногда' },
                { value: 'often', label: 'Часто' },
                { value: 'always', label: 'Постоянно' },
              ].map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedSingle(option.value)}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                  {selectedSingle === option.value && (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </RadioGroup>
          <Button className="w-full mt-6" disabled={!selectedSingle}>
            Продолжить
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'multi-choice') {
    const toggleOption = (value: string) => {
      setSelectedMulti(prev => 
        prev.includes(value) 
          ? prev.filter(v => v !== value)
          : [...prev, value]
      );
    };

    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Что помогает вам справляться со стрессом?</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Выберите все подходящие варианты
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              { value: 'meditation', label: 'Медитация и дыхательные практики' },
              { value: 'sport', label: 'Физическая активность' },
              { value: 'nature', label: 'Прогулки на природе' },
              { value: 'communication', label: 'Общение с близкими' },
              { value: 'hobby', label: 'Хобби и творчество' },
            ].map((option) => {
              const isChecked = selectedMulti.includes(option.value);
              return (
                <div
                  key={option.value}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                    isChecked 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/30'
                  }`}
                  onClick={() => toggleOption(option.value)}
                >
                  <Checkbox 
                    id={option.value}
                    checked={isChecked}
                    onCheckedChange={() => toggleOption(option.value)}
                  />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                  {isChecked && <CheckCircle2 className="w-5 h-5 text-primary" />}
                </div>
              );
            })}
          </div>
          <Button className="w-full mt-6" disabled={selectedMulti.length === 0}>
            Продолжить
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Scale variant
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Оцените уровень вашего стресса</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Переместите ползунок от 0 (нет стресса) до 10 (очень высокий стресс)
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="pt-4">
          <div className="flex justify-between mb-4">
            <span className="text-xs text-muted-foreground">Нет стресса</span>
            <span className="text-2xl font-bold text-primary">{scaleValue[0]}</span>
            <span className="text-xs text-muted-foreground">Очень высокий</span>
          </div>
          <Slider
            value={scaleValue}
            onValueChange={setScaleValue}
            min={0}
            max={10}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between mt-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <span 
                key={num} 
                className={`text-xs ${scaleValue[0] === num ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
              >
                {num}
              </span>
            ))}
          </div>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {scaleValue[0] <= 3 && 'Низкий уровень стресса. Продолжайте заботиться о себе!'}
            {scaleValue[0] > 3 && scaleValue[0] <= 7 && 'Умеренный уровень стресса. Попробуйте техники релаксации.'}
            {scaleValue[0] > 7 && 'Высокий уровень стресса. Рекомендуем обратиться к специалисту.'}
          </p>
        </div>
        <Button className="w-full">
          Продолжить
        </Button>
      </CardContent>
    </Card>
  );
}
