import { useState } from 'react';
import { motion } from 'motion/react';
import { Compass, Clock, Target, Layers, CheckCircle2 } from 'lucide-react';

interface NavigatorStartPageProps {
  onFindPractices?: () => void;
}

export default function NavigatorStartPage({ onFindPractices }: NavigatorStartPageProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string[]>([]);

  const emotions = [
    { id: 'anxiety', label: 'Тревога', color: 'from-[#A8B5FF] to-[#C8F5E8]' },
    { id: 'sadness', label: 'Печаль', color: 'from-[#C8F5E8] to-[#A8B5FF]' },
    { id: 'anger', label: 'Гнев', color: 'from-[#FFD4B5] to-[#FFC97F]' },
    { id: 'burnout', label: 'Выгорание', color: 'from-[#FFC97F] to-[#FFD4B5]' },
    { id: 'stress', label: 'Стресс', color: 'from-[#FFB5C5] to-[#FFD4B5]' },
    { id: 'emptiness', label: 'Пустота', color: 'from-[#C8F5E8] to-[#7FD99A]' },
    { id: 'overwhelm', label: 'Перегрузка', color: 'from-[#A8B5FF] to-[#FFD4B5]' },
    { id: 'other', label: 'Другое', color: 'from-[#7FD99A] to-[#C8F5E8]' }
  ];

  const timeOptions = [
    { id: '5', label: 'До 5 минут' },
    { id: '5-15', label: '5-15 минут' },
    { id: '15-30', label: '15-30 минут' },
    { id: '30-60', label: '30-60 минут' },
    { id: 'unlimited', label: 'Без ограничений' }
  ];

  const difficultyOptions = [
    { id: 'easy', label: 'Лёгкий', desc: 'Для новичков' },
    { id: 'medium', label: 'Средний', desc: 'Требует практики' },
    { id: 'advanced', label: 'Продвинутый', desc: 'Для опытных' }
  ];

  const formatOptions = [
    { id: 'exercise', label: 'Упражнение', icon: '🏃' },
    { id: 'meditation', label: 'Медитация', icon: '🧘' },
    { id: 'breathing', label: 'Дыхательная практика', icon: '💨' },
    { id: 'writing', label: 'Письменная практика', icon: '✍️' },
    { id: 'movement', label: 'Движение', icon: '🤸' },
    { id: 'other', label: 'Другое', icon: '✨' }
  ];

  const toggleEmotion = (id: string) => {
    setSelectedEmotion(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const toggleFormat = (id: string) => {
    setSelectedFormat(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const hasSelections = selectedEmotion.length > 0 || selectedTime || selectedDifficulty || selectedFormat.length > 0;

  return (
    <>
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#7FD99A]/10 to-white -z-10" />
        
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7FD99A] to-[#C8F5E8] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_-4px_rgba(127,217,154,0.4)]">
              <Compass className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-[32px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-4 leading-tight">
              Навигатор состояния
            </h1>
            
            <p className="text-base sm:text-lg text-[#718096] max-w-2xl mx-auto leading-relaxed">
              Подберите практику, которая поможет вам прямо сейчас, исходя из вашего текущего 
              состояния и возможностей
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Emotional State */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#A8B5FF]/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-[#A8B5FF]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#2D3748]">
                  Эмоциональное состояние
                </h2>
                <p className="text-sm text-[#718096]">
                  Выберите одно или несколько
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {emotions.map((emotion) => (
                <button
                  key={emotion.id}
                  onClick={() => toggleEmotion(emotion.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    selectedEmotion.includes(emotion.id)
                      ? 'border-transparent shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {selectedEmotion.includes(emotion.id) && (
                    <>
                      <div className={`absolute inset-0 bg-gradient-to-br ${emotion.color} opacity-5 rounded-xl`} />
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-br from-[#7FD99A] to-[#C8F5E8] flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    </>
                  )}
                  <span className={`relative text-sm sm:text-base font-medium ${
                    selectedEmotion.includes(emotion.id)
                      ? 'text-[#2D3748]'
                      : 'text-[#718096]'
                  }`}>
                    {emotion.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#FFD4B5]/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#FFD4B5]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#2D3748]">
                  Время выполнения
                </h2>
                <p className="text-sm text-[#718096]">
                  Сколько времени у вас есть?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {timeOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedTime(option.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedTime === option.id
                      ? 'border-[#FFD4B5] bg-[#FFD4B5]/5 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className={`text-sm sm:text-base font-medium ${
                    selectedTime === option.id
                      ? 'text-[#2D3748]'
                      : 'text-[#718096]'
                  }`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Difficulty */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#C8F5E8]/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-[#7FD99A]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#2D3748]">
                  Уровень сложности
                </h2>
                <p className="text-sm text-[#718096]">
                  Опциональный фильтр
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {difficultyOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedDifficulty(option.id)}
                  className={`p-5 rounded-xl border-2 text-left transition-all ${
                    selectedDifficulty === option.id
                      ? 'border-[#7FD99A] bg-[#7FD99A]/5 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className={`text-base sm:text-lg font-semibold mb-1 ${
                    selectedDifficulty === option.id
                      ? 'text-[#2D3748]'
                      : 'text-[#718096]'
                  }`}>
                    {option.label}
                  </p>
                  <p className="text-sm text-[#718096]">
                    {option.desc}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Format */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#A8B5FF]/10 flex items-center justify-center">
                <Compass className="w-5 h-5 text-[#A8B5FF]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#2D3748]">
                  Формат практики
                </h2>
                <p className="text-sm text-[#718096]">
                  Выберите один или несколько
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {formatOptions.map((format) => (
                <button
                  key={format.id}
                  onClick={() => toggleFormat(format.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    selectedFormat.includes(format.id)
                      ? 'border-[#A8B5FF] bg-[#A8B5FF]/5 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {selectedFormat.includes(format.id) && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-br from-[#A8B5FF] to-[#C8F5E8] flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{format.icon}</span>
                    <span className={`text-sm sm:text-base font-medium ${
                      selectedFormat.includes(format.id)
                        ? 'text-[#2D3748]'
                        : 'text-[#718096]'
                    }`}>
                      {format.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA - Fixed on Mobile */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="sticky bottom-0 sm:static bg-white sm:bg-transparent py-4 sm:py-0 -mx-4 px-4 sm:mx-0 sm:px-0 border-t sm:border-0 border-gray-100">
            <button
              onClick={onFindPractices}
              disabled={!hasSelections}
              className={`w-full px-8 py-4 rounded-xl text-base sm:text-lg font-medium transition-all ${
                hasSelections
                  ? 'bg-gradient-to-r from-[#7FD99A] to-[#C8F5E8] text-white shadow-[0_8px_24px_-4px_rgba(127,217,154,0.4)] hover:shadow-[0_12px_32px_-4px_rgba(127,217,154,0.5)] active:scale-[0.98]'
                  : 'bg-gray-100 text-[#718096] cursor-not-allowed'
              }`}
            >
              {hasSelections ? 'Найти практики' : 'Выберите хотя бы один фильтр'}
            </button>
            {hasSelections && (
              <p className="text-xs text-center text-[#718096] mt-3">
                Выбрано: {selectedEmotion.length + (selectedTime ? 1 : 0) + (selectedDifficulty ? 1 : 0) + selectedFormat.length} фильтр(ов)
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
