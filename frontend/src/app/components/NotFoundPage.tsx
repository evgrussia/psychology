import { motion } from 'motion/react';
import { Heart, Home, Search, HelpCircle, Book, MessageCircle, ArrowRight, Compass } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (page: string) => void;
}

export default function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  const popularLinks = [
    {
      icon: Home,
      title: 'Главная страница',
      description: 'Вернуться на главную',
      action: 'home',
      gradient: 'from-[#A8B5FF] to-[#C8F5E8]'
    },
    {
      icon: MessageCircle,
      title: 'Консультации',
      description: 'Записаться к психологу',
      action: 'consultations',
      gradient: 'from-[#FFD4B5] to-[#FFC97F]'
    },
    {
      icon: Book,
      title: 'Ресурсы',
      description: 'Полезные материалы',
      action: 'resources',
      gradient: 'from-[#C8F5E8] to-[#7FD99A]'
    },
    {
      icon: HelpCircle,
      title: 'Помощь',
      description: 'FAQ и поддержка',
      action: 'help',
      gradient: 'from-[#FFC97F] to-[#FFD4B5]'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-b from-white via-[#A8B5FF]/5 to-white">
      <div className="max-w-4xl mx-auto w-full text-center">
        {/* Animated Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-12"
        >
          <div className="relative inline-block">
            {/* Background Circles */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 -m-8 rounded-full bg-gradient-to-br from-[#A8B5FF]/20 to-[#C8F5E8]/20 blur-2xl"
            />
            
            {/* Main Icon */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-[#A8B5FF]/10 to-[#C8F5E8]/10 rounded-full" />
              <div className="absolute inset-4 bg-gradient-to-br from-[#A8B5FF] to-[#C8F5E8] rounded-full flex items-center justify-center shadow-[0_8px_24px_-4px_rgba(168,181,255,0.4)]">
                <Compass className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{
                y: [-10, 10, -10],
                rotate: [0, 5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-[#FFD4B5]/20 to-[#FFC97F]/20 rounded-full flex items-center justify-center"
            >
              <Heart className="w-6 h-6 text-[#FFD4B5]" fill="currentColor" />
            </motion.div>

            <motion.div
              animate={{
                y: [10, -10, 10],
                rotate: [0, -5, 0]
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute -bottom-4 -left-4 w-14 h-14 bg-gradient-to-br from-[#C8F5E8]/20 to-[#7FD99A]/20 rounded-full flex items-center justify-center"
            >
              <Search className="w-5 h-5 text-[#7FD99A]" />
            </motion.div>
          </div>
        </motion.div>

        {/* 404 Number - Subtle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <p className="text-6xl sm:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#A8B5FF] via-[#FFD4B5] to-[#C8F5E8]">
            404
          </p>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4 sm:mb-6"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2D3748] mb-3">
            Эта страница потерялась
          </h1>
          <p className="text-base sm:text-lg text-[#718096] max-w-2xl mx-auto leading-relaxed">
            Не переживайте, такое случается. Давайте вместе найдём то, что вы ищете 🌟
          </p>
        </motion.div>

        {/* Main CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12 sm:mb-16"
        >
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white font-medium text-base sm:text-lg shadow-[0_8px_24px_-4px_rgba(168,181,255,0.4)] hover:shadow-[0_12px_32px_-4px_rgba(168,181,255,0.5)] active:scale-[0.98] transition-all"
          >
            <Home className="w-5 h-5" />
            Вернуться на главную
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Popular Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-6">
            Может быть, вы искали что-то из этого?
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {popularLinks.map((link, index) => (
              <motion.button
                key={link.action}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                onClick={() => onNavigate(link.action)}
                className="group relative overflow-hidden bg-white border-2 border-gray-200 rounded-2xl p-6 text-left hover:border-transparent hover:shadow-[0_8px_24px_-4px_rgba(168,181,255,0.2)] transition-all"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${link.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                <div className="relative flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.gradient} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                    <link.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-1 group-hover:text-[#A8B5FF] transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-sm text-[#718096]">
                      {link.description}
                    </p>
                  </div>

                  <ArrowRight className="w-5 h-5 text-[#718096] group-hover:text-[#A8B5FF] group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="max-w-xl mx-auto mb-12"
        >
          <div className="bg-gradient-to-r from-[#A8B5FF]/5 to-[#C8F5E8]/5 rounded-2xl p-6 sm:p-8 border border-[#A8B5FF]/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A8B5FF]/10 to-[#C8F5E8]/10 flex items-center justify-center">
                <Search className="w-5 h-5 text-[#A8B5FF]" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-[#2D3748]">
                Или воспользуйтесь поиском
              </h3>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Что вы ищете?"
                className="w-full px-5 py-3.5 pr-12 rounded-xl border-2 border-gray-200 focus:border-[#A8B5FF] focus:outline-none text-[#2D3748] placeholder:text-[#718096] transition-colors"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-gradient-to-br from-[#A8B5FF] to-[#C8F5E8] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
                <Search className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Additional Help */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <p className="text-sm text-[#718096] mb-3">
            Всё ещё не можете найти нужную информацию?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a
              href="mailto:support@emotional-balance.ru"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-medium text-[#2D3748] hover:border-[#A8B5FF] hover:text-[#A8B5FF] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Написать в поддержку
            </a>
            <button
              onClick={() => onNavigate('help')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-medium text-[#2D3748] hover:border-[#A8B5FF] hover:text-[#A8B5FF] transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              Посмотреть FAQ
            </button>
          </div>
        </motion.div>

        {/* Encouraging Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12 sm:mt-16 bg-gradient-to-r from-[#FFD4B5]/5 to-[#FFC97F]/5 rounded-2xl p-6 sm:p-8 border border-[#FFD4B5]/10"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD4B5] to-[#FFC97F] flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                Мы здесь, чтобы помочь
              </h3>
              <p className="text-sm sm:text-base text-[#718096] leading-relaxed">
                Если вы чувствуете растерянность или нуждаетесь в поддержке, наши психологи 
                всегда готовы вас выслушать. Запишитесь на консультацию, и мы поможем вам 
                разобраться в сложной ситуации.
              </p>
              <button
                onClick={() => onNavigate('consultations')}
                className="mt-4 inline-flex items-center gap-2 text-sm sm:text-base font-medium text-[#FFD4B5] hover:text-[#FFC97F] transition-colors"
              >
                Записаться на консультацию
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
