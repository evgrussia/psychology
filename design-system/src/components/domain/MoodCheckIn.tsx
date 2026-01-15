import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Smile, Meh, Frown, Angry, Heart, CheckCircle2 } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import type { ReactElement } from 'react';

const moods = [
  { value: 'great', label: 'Отлично', icon: Smile, color: 'text-success' },
  { value: 'good', label: 'Хорошо', icon: Heart, color: 'text-primary' },
  { value: 'okay', label: 'Нормально', icon: Meh, color: 'text-warning' },
  { value: 'bad', label: 'Плохо', icon: Frown, color: 'text-danger' },
  { value: 'terrible', label: 'Очень плохо', icon: Angry, color: 'text-destructive' },
];

export function MoodCheckIn(): ReactElement {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (saved) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h3 className="text-2xl font-semibold text-foreground mb-2">
            Спасибо за запись!
          </h3>
          <p className="text-muted-foreground mb-6">
            Ваше настроение сохранено. Продолжайте отслеживать эмоции каждый день.
          </p>
          <Button variant="outline" onClick={() => setSaved(false)}>
            Добавить ещё запись
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Как вы себя чувствуете сегодня?</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Отслеживание настроения помогает лучше понимать свои эмоции
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood Selector */}
        <div className="grid grid-cols-5 gap-3">
          {moods.map((mood) => {
            const Icon = mood.icon;
            const isSelected = selectedMood === mood.value;
            return (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  isSelected 
                    ? 'border-primary bg-primary/5 scale-105' 
                    : 'border-border hover:border-primary/30 hover:bg-muted/50'
                }`}
                aria-label={mood.label}
              >
                <Icon className={`w-8 h-8 ${isSelected ? mood.color : 'text-muted-foreground'}`} />
                <span className={`text-xs text-center ${isSelected ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                  {mood.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Optional Note */}
        {selectedMood && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <label htmlFor="mood-note" className="text-sm font-medium text-foreground">
              Заметка (необязательно)
            </label>
            <Textarea
              id="mood-note"
              placeholder="Что повлияло на ваше настроение сегодня?..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        )}

        {/* Save Button */}
        <Button 
          className="w-full" 
          disabled={!selectedMood}
          onClick={handleSave}
        >
          Сохранить
        </Button>

        {/* Daily Streak */}
        <div className="p-4 bg-muted/50 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            🔥 Вы отслеживаете настроение <strong className="text-foreground">7 дней</strong> подряд!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
