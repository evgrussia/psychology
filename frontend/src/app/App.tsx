import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Menu, X, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import HomePage from '@/app/components/HomePage';
import AboutPage from '@/app/components/AboutPage';
import HowItWorksPage from '@/app/components/HowItWorksPage';
import PrivacyPolicyPage from '@/app/components/PrivacyPolicyPage';
import ConsentPage from '@/app/components/ConsentPage';
import TermsPage from '@/app/components/TermsPage';
import DisclaimerPage from '@/app/components/DisclaimerPage';
import NotFoundPage from '@/app/components/NotFoundPage';
import CookiesPolicyPage from '@/app/components/CookiesPolicyPage';
import TopicsHubPage from '@/app/components/TopicsHubPage';
import TopicDetailPage from '@/app/components/TopicDetailPage';
import BlogListPage from '@/app/components/BlogListPage';
import BlogArticlePage from '@/app/components/BlogArticlePage';
import ResourcesListPage from '@/app/components/ResourcesListPage';
import EmergencyHelpPage from '@/app/components/EmergencyHelpPage';
import BookingServicePage from '@/app/components/BookingServicePage';
import BookingSlotPage from '@/app/components/BookingSlotPage';
import BookingFormPage from '@/app/components/BookingFormPage';
import CabinetDashboard from '@/app/components/CabinetDashboard';
import CabinetAppointments from '@/app/components/CabinetAppointments';
import CabinetDiary from '@/app/components/CabinetDiary';
import CabinetMaterials from '@/app/components/CabinetMaterials';
import LoginPage from '@/app/components/LoginPage';
import RegisterPage from '@/app/components/RegisterPage';
import QuizStartPage from '@/app/components/QuizStartPage';
import QuizProgressPage from '@/app/components/QuizProgressPage';
import QuizResultPage from '@/app/components/QuizResultPage';
import QuizCrisisPage from '@/app/components/QuizCrisisPage';
import NavigatorStartPage from '@/app/components/NavigatorStartPage';

import type { Service, Slot } from '@/api/types/booking';

type Page = 'home' | 'about' | 'how-it-works' | 'privacy-policy' | 'consent' | 'terms' | 'disclaimer' | '404' | 'consultations' | 'resources' | 'help' | 'cookies' | 'topics' | 'topic-detail' | 'blog' | 'blog-article' | 'resources-list' | 'emergency' | 'booking' | 'booking-slot' | 'booking-form' | 'cabinet' | 'cabinet-appointments' | 'cabinet-diary' | 'cabinet-materials' | 'login' | 'register' | 'quiz-start' | 'quiz-progress' | 'quiz-result' | 'quiz-crisis' | 'navigator';

const CABINET_PAGES: Page[] = ['cabinet', 'cabinet-appointments', 'cabinet-diary', 'cabinet-materials'];

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedTopicSlug, setSelectedTopicSlug] = useState<string | null>(null);
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedBookingFormat, setSelectedBookingFormat] = useState<'online' | 'offline'>('online');

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && CABINET_PAGES.includes(currentPage)) {
      setCurrentPage('login');
    }
  }, [isAuthenticated, isLoading, currentPage]);

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile-First Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-100">
        <div className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo - Clickable */}
            <button
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A8B5FF] via-[#FFD4B5] to-[#C8F5E8] flex items-center justify-center shadow-[0_4px_12px_-2px_rgba(168,181,255,0.4)]">
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="text-base sm:text-lg font-semibold text-[#2D3748]">
                Эмоциональный баланс
              </span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => navigateTo('home')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  currentPage === 'home'
                    ? 'bg-[#A8B5FF]/10 text-[#A8B5FF]'
                    : 'text-[#2D3748] hover:bg-[#A8B5FF]/5'
                }`}
              >
                Главная
              </button>
              <button
                onClick={() => navigateTo('how-it-works')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  currentPage === 'how-it-works'
                    ? 'bg-[#A8B5FF]/10 text-[#A8B5FF]'
                    : 'text-[#2D3748] hover:bg-[#A8B5FF]/5'
                }`}
              >
                Как это работает
              </button>
              <button
                onClick={() => navigateTo('topics')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  currentPage === 'topics'
                    ? 'bg-[#A8B5FF]/10 text-[#A8B5FF]'
                    : 'text-[#2D3748] hover:bg-[#A8B5FF]/5'
                }`}
              >
                Инструменты
              </button>
              <button
                onClick={() => navigateTo('booking')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  currentPage === 'booking'
                    ? 'bg-[#A8B5FF]/10 text-[#A8B5FF]'
                    : 'text-[#2D3748] hover:bg-[#A8B5FF]/5'
                }`}
              >
                Консультации
              </button>
              <button
                onClick={() => navigateTo('resources-list')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  currentPage === 'resources-list'
                    ? 'bg-[#A8B5FF]/10 text-[#A8B5FF]'
                    : 'text-[#2D3748] hover:bg-[#A8B5FF]/5'
                }`}
              >
                Ресурсы
              </button>
              <button
                onClick={() => navigateTo('about')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  currentPage === 'about'
                    ? 'bg-[#A8B5FF]/10 text-[#A8B5FF]'
                    : 'text-[#2D3748] hover:bg-[#A8B5FF]/5'
                }`}
              >
                О проекте
              </button>
              <button
                onClick={() => navigateTo('booking')}
                className="ml-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white text-sm font-medium shadow-[0_4px_12px_-2px_rgba(168,181,255,0.4)] hover:shadow-[0_6px_16px_-2px_rgba(168,181,255,0.5)] transition-all"
              >
                Записаться
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              {menuOpen ? <X className="w-6 h-6 text-[#2D3748]" /> : <Menu className="w-6 h-6 text-[#2D3748]" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-gray-100"
            >
              <nav className="px-4 py-4 space-y-1">
                <button
                  onClick={() => navigateTo('home')}
                  className={`w-full text-left block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    currentPage === 'home'
                      ? 'bg-[#A8B5FF]/10 text-[#A8B5FF]'
                      : 'text-[#2D3748] hover:bg-[#A8B5FF]/5 active:bg-[#A8B5FF]/10'
                  }`}
                >
                  Главная
                </button>
                <button
                  onClick={() => navigateTo('how-it-works')}
                  className={`w-full text-left block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    currentPage === 'how-it-works'
                      ? 'bg-[#A8B5FF]/10 text-[#A8B5FF]'
                      : 'text-[#2D3748] hover:bg-[#A8B5FF]/5 active:bg-[#A8B5FF]/10'
                  }`}
                >
                  Как это работает
                </button>
                <button
                  onClick={() => navigateTo('topics')}
                  className={`w-full text-left block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    currentPage === 'topics'
                      ? 'bg-[#A8B5FF]/10 text-[#A8B5FF]'
                      : 'text-[#2D3748] hover:bg-[#A8B5FF]/5 active:bg-[#A8B5FF]/10'
                  }`}
                >
                  Инструменты
                </button>
                <button
                  onClick={() => navigateTo('booking')}
                  className={`w-full text-left block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    currentPage === 'booking'
                      ? 'bg-[#A8B5FF]/10 text-[#A8B5FF]'
                      : 'text-[#2D3748] hover:bg-[#A8B5FF]/5 active:bg-[#A8B5FF]/10'
                  }`}
                >
                  Консультации
                </button>
                <button
                  onClick={() => navigateTo('resources-list')}
                  className={`w-full text-left block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    currentPage === 'resources-list'
                      ? 'bg-[#A8B5FF]/10 text-[#A8B5FF]'
                      : 'text-[#2D3748] hover:bg-[#A8B5FF]/5 active:bg-[#A8B5FF]/10'
                  }`}
                >
                  Ресурсы
                </button>
                <button
                  onClick={() => navigateTo('about')}
                  className={`w-full text-left block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    currentPage === 'about'
                      ? 'bg-[#A8B5FF]/10 text-[#A8B5FF]'
                      : 'text-[#2D3748] hover:bg-[#A8B5FF]/5 active:bg-[#A8B5FF]/10'
                  }`}
                >
                  О проекте
                </button>
                <button
                  onClick={() => navigateTo('login')}
                  className={`w-full text-left block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    currentPage === 'login'
                      ? 'bg-[#A8B5FF]/10 text-[#A8B5FF]'
                      : 'text-[#2D3748] hover:bg-[#A8B5FF]/5 active:bg-[#A8B5FF]/10'
                  }`}
                >
                  Войти
                </button>
                <div className="pt-2">
                  <button 
                    onClick={() => navigateTo('booking')}
                    className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white font-medium shadow-[0_4px_12px_-2px_rgba(168,181,255,0.4)] active:scale-[0.98] transition-transform"
                  >
                    Записаться на консультацию
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content with Page Transition */}
      <main className="pt-16 sm:pt-20">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <HomePage onNavigateToQuiz={() => navigateTo('quiz-start')} onNavigateToNavigator={() => navigateTo('navigator')} />
            </motion.div>
          )}
          {currentPage === 'how-it-works' && (
            <motion.div
              key="how-it-works"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <HowItWorksPage />
            </motion.div>
          )}
          {currentPage === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AboutPage />
            </motion.div>
          )}
          {currentPage === 'privacy-policy' && (
            <motion.div
              key="privacy-policy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PrivacyPolicyPage />
            </motion.div>
          )}
          {currentPage === 'consent' && (
            <motion.div
              key="consent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ConsentPage />
            </motion.div>
          )}
          {currentPage === 'terms' && (
            <motion.div
              key="terms"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TermsPage />
            </motion.div>
          )}
          {currentPage === 'disclaimer' && (
            <motion.div
              key="disclaimer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DisclaimerPage />
            </motion.div>
          )}
          {currentPage === '404' && (
            <motion.div
              key="404"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <NotFoundPage onNavigate={(page) => navigateTo(page as Page)} />
            </motion.div>
          )}
          {currentPage === 'cookies' && (
            <motion.div
              key="cookies"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CookiesPolicyPage />
            </motion.div>
          )}
          {currentPage === 'topics' && (
            <motion.div
              key="topics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TopicsHubPage
                onNavigateToTopic={(slug) => {
                  setSelectedTopicSlug(slug);
                  navigateTo('topic-detail');
                }}
                onNavigateToQuiz={() => navigateTo('quiz-start')}
                onNavigateToNavigator={() => navigateTo('navigator')}
              />
            </motion.div>
          )}
          {currentPage === 'topic-detail' && (
            <motion.div
              key="topic-detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TopicDetailPage 
                slug={selectedTopicSlug}
                onBack={() => navigateTo('topics')} 
              />
            </motion.div>
          )}
          {currentPage === 'blog' && (
            <motion.div
              key="blog"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BlogListPage 
                onNavigateToArticle={(slug) => {
                  setSelectedArticleSlug(slug);
                  navigateTo('blog-article');
                }} 
              />
            </motion.div>
          )}
          {currentPage === 'blog-article' && (
            <motion.div
              key="blog-article"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BlogArticlePage 
                slug={selectedArticleSlug}
                onBack={() => navigateTo('blog')} 
                onNavigateToArticle={(slug) => {
                  setSelectedArticleSlug(slug);
                  // Страница перерисуется с новым slug
                }} 
              />
            </motion.div>
          )}
          {currentPage === 'resources-list' && (
            <motion.div
              key="resources-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ResourcesListPage />
            </motion.div>
          )}
          {currentPage === 'emergency' && (
            <motion.div
              key="emergency"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <EmergencyHelpPage />
            </motion.div>
          )}
          {currentPage === 'booking' && (
            <motion.div
              key="booking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BookingServicePage
                onSelectService={(service) => {
                  setSelectedService(service);
                  setSelectedServiceId(service.id);
                  navigateTo('booking-slot');
                }}
              />
            </motion.div>
          )}
          {currentPage === 'booking-slot' && (
            <motion.div
              key="booking-slot"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BookingSlotPage
                serviceId={selectedServiceId}
                service={selectedService}
                onContinue={(slot, format) => {
                  setSelectedSlot(slot);
                  setSelectedSlotId(slot.id);
                  setSelectedBookingFormat(format);
                  navigateTo('booking-form');
                }}
                onBack={() => {
                  setSelectedServiceId(null);
                  setSelectedService(null);
                  navigateTo('booking');
                }}
              />
            </motion.div>
          )}
          {currentPage === 'booking-form' && (
            <motion.div
              key="booking-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BookingFormPage
                serviceId={selectedServiceId}
                slotId={selectedSlotId}
                service={selectedService}
                slot={selectedSlot}
                format={selectedBookingFormat}
                onSuccess={() => navigateTo('cabinet')}
                onBack={() => navigateTo('booking-slot')}
              />
            </motion.div>
          )}
          {currentPage === 'cabinet' && (
            <motion.div
              key="cabinet"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CabinetDashboard onNavigate={(page) => navigateTo(`cabinet-${page}` as Page)} />
            </motion.div>
          )}
          {currentPage === 'cabinet-appointments' && (
            <motion.div
              key="cabinet-appointments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CabinetAppointments
                onBack={() => navigateTo('cabinet')}
                onNavigateToBooking={() => navigateTo('booking')}
              />
            </motion.div>
          )}
          {currentPage === 'cabinet-diary' && (
            <motion.div
              key="cabinet-diary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CabinetDiary onBack={() => navigateTo('cabinet')} />
            </motion.div>
          )}
          {currentPage === 'cabinet-materials' && (
            <motion.div
              key="cabinet-materials"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CabinetMaterials
                onBack={() => navigateTo('cabinet')}
                onNavigateToArticle={(slug) => {
                  setSelectedArticleSlug(slug);
                  navigateTo('blog-article');
                }}
                onNavigateToResource={(slug) => {
                  navigateTo('resources-list');
                }}
                onNavigateToResourcesList={() => navigateTo('resources-list')}
              />
            </motion.div>
          )}
          {currentPage === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <LoginPage 
                onNavigateToRegister={() => navigateTo('register')} 
                onNavigateToCabinet={() => navigateTo('cabinet')}
                onNavigateToHome={() => navigateTo('home')}
              />
            </motion.div>
          )}
          {currentPage === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RegisterPage 
                onNavigateToLogin={() => navigateTo('login')}
                onNavigateToCabinet={() => navigateTo('cabinet')}
                onNavigateToHome={() => navigateTo('home')}
              />
            </motion.div>
          )}
          {currentPage === 'quiz-start' && (
            <motion.div
              key="quiz-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <QuizStartPage onStart={() => navigateTo('quiz-progress')} />
            </motion.div>
          )}
          {currentPage === 'quiz-progress' && (
            <motion.div
              key="quiz-progress"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <QuizProgressPage
                onBack={() => navigateTo('quiz-start')}
                onComplete={() => navigateTo('quiz-result')}
                onCrisis={() => navigateTo('quiz-crisis')}
              />
            </motion.div>
          )}
          {currentPage === 'quiz-result' && (
            <motion.div
              key="quiz-result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <QuizResultPage onBackToHome={() => navigateTo('home')} />
            </motion.div>
          )}
          {currentPage === 'quiz-crisis' && (
            <motion.div
              key="quiz-crisis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <QuizCrisisPage onBackToHome={() => navigateTo('home')} />
            </motion.div>
          )}
          {currentPage === 'navigator' && (
            <motion.div
              key="navigator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <NavigatorStartPage onFindPractices={() => navigateTo('topics')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer - Mobile First */}
      <footer className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-gradient-to-b from-white to-[#A8B5FF]/5 border-t border-gray-100">
        <div className="max-w-[1440px] mx-auto">
          {/* Logo & Description */}
          <div className="text-center mb-10 sm:mb-12">
            <button
              onClick={() => navigateTo('home')}
              className="inline-flex items-center justify-center gap-2 mb-4 hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A8B5FF] via-[#FFD4B5] to-[#C8F5E8] flex items-center justify-center shadow-[0_4px_12px_-2px_rgba(168,181,255,0.4)]">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
              <span className="text-xl font-semibold text-[#2D3748]">
                Эмоциональный баланс
              </span>
            </button>
            <p className="text-sm text-[#718096] max-w-md mx-auto leading-relaxed">
              Безопасное пространство для вашего психологического благополучия
            </p>
          </div>

          {/* Navigation Links - Mobile: Vertical, Desktop: Horizontal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 sm:mb-12">
            {/* Column 1 */}
            <div>
              <h4 className="text-sm font-semibold text-[#2D3748] mb-4">Услуги</h4>
              <ul className="space-y-3">
                <li>
                    <button onClick={() => navigateTo('booking')} className="text-sm text-[#718096] hover:text-[#A8B5FF] transition-colors inline-block py-1 text-left">
                      Консультации
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigateTo('topics')} className="text-sm text-[#718096] hover:text-[#A8B5FF] transition-colors inline-block py-1 text-left">
                      Инструменты
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigateTo('resources-list')} className="text-sm text-[#718096] hover:text-[#A8B5FF] transition-colors inline-block py-1 text-left">
                      Ресурсы
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigateTo('how-it-works')} className="text-sm text-[#718096] hover:text-[#A8B5FF] transition-colors inline-block py-1 text-left">
                      Программы
                    </button>
                  </li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="text-sm font-semibold text-[#2D3748] mb-4">О проекте</h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => navigateTo('about')}
                    className="text-sm text-[#718096] hover:text-[#A8B5FF] transition-colors inline-block py-1"
                  >
                    О нас
                  </button>
                </li>
                <li>
                    <button onClick={() => navigateTo('about')} className="text-sm text-[#718096] hover:text-[#A8B5FF] transition-colors inline-block py-1 text-left">
                      Специалисты
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigateTo('how-it-works')} className="text-sm text-[#718096] hover:text-[#A8B5FF] transition-colors inline-block py-1 text-left">
                      Подход
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigateTo('about')} className="text-sm text-[#718096] hover:text-[#A8B5FF] transition-colors inline-block py-1 text-left">
                      Отзывы
                    </button>
                  </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="text-sm font-semibold text-[#2D3748] mb-4">Поддержка</h4>
              <ul className="space-y-3">
                <li>
                    <button onClick={() => navigateTo('how-it-works')} className="text-sm text-[#718096] hover:text-[#A8B5FF] transition-colors inline-block py-1 text-left">
                      FAQ
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigateTo('emergency')} className="text-sm text-[#718096] hover:text-[#A8B5FF] transition-colors inline-block py-1 text-left">
                      Экстренная помощь
                    </button>
                  </li>
                  <li>
                    <a href="mailto:help@emotional-balance.ru" className="text-sm text-[#718096] hover:text-[#A8B5FF] transition-colors inline-block py-1">
                      Контакты
                    </a>
                  </li>
                  <li>
                    <button onClick={() => navigateTo('emergency')} className="text-sm text-[#718096] hover:text-[#A8B5FF] transition-colors inline-block py-1 text-left">
                      Помощь
                    </button>
                  </li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h4 className="text-sm font-semibold text-[#2D3748] mb-4">Юридическое</h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => navigateTo('terms')}
                    className="text-sm text-[#718096] hover:text-[#A8B5FF] transition-colors inline-block py-1 text-left"
                  >
                    Пользовательское соглашение
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('privacy-policy')}
                    className="text-sm text-[#718096] hover:text-[#A8B5FF] transition-colors inline-block py-1 text-left"
                  >
                    Политика конфиденциальности
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('consent')}
                    className="text-sm text-[#718096] hover:text-[#A8B5FF] transition-colors inline-block py-1 text-left"
                  >
                    Согласие на обработку данных
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('cookies')}
                    className="text-sm text-[#718096] hover:text-[#A8B5FF] transition-colors inline-block py-1 text-left"
                  >
                    Cookies
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-8 pb-8 border-b border-gray-100">
            <a
              href="mailto:help@emotional-balance.ru"
              className="flex items-center gap-2 text-sm text-[#718096] hover:text-[#A8B5FF] transition-colors"
            >
              <Mail className="w-4 h-4" />
              help@emotional-balance.ru
            </a>
            <a
              href="tel:+78001234567"
              className="flex items-center gap-2 text-sm text-[#718096] hover:text-[#A8B5FF] transition-colors"
            >
              <Phone className="w-4 h-4" />
              8 (800) 123-45-67
            </a>
          </div>

          {/* Emergency Help Button */}
          <div className="mb-8">
            <button
              onClick={() => navigateTo('emergency')}
              className="mx-auto flex items-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-[#FFB5C5] to-[#FFD4B5] text-white font-medium shadow-[0_8px_24px_-4px_rgba(255,181,197,0.4)] hover:shadow-[0_12px_32px_-4px_rgba(255,181,197,0.5)] active:scale-[0.98] transition-all"
            >
              <Heart className="w-5 h-5" fill="white" />
              <span>Экстренная помощь</span>
            </button>
            <p className="text-xs text-center text-[#718096] mt-3">
              Телефон доверия: 8-800-2000-122 • Круглосуточно • Бесплатно
            </p>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-xs sm:text-sm text-[#718096] mb-2">
              © 2026 Эмоциональный баланс. Создано с заботой о вашем благополучии
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-[#718096]">
              <button onClick={() => navigateTo('404')} className="hover:text-[#A8B5FF] transition-colors">
                Демо: 404
              </button>
              <span>•</span>
              <button onClick={() => navigateTo('topics')} className="hover:text-[#A8B5FF] transition-colors">
                Демо: Темы
              </button>
              <span>•</span>
              <button onClick={() => navigateTo('blog')} className="hover:text-[#A8B5FF] transition-colors">
                Демо: Блог
              </button>
              <span>•</span>
              <button onClick={() => navigateTo('resources-list')} className="hover:text-[#A8B5FF] transition-colors">
                Демо: Ресурсы
              </button>
              <span>•</span>
              <button onClick={() => navigateTo('booking')} className="hover:text-[#A8B5FF] transition-colors">
                Демо: Запись
              </button>
              <span>•</span>
              <button onClick={() => navigateTo('cabinet')} className="hover:text-[#A8B5FF] transition-colors">
                Демо: Кабинет
              </button>
              <span>•</span>
              <button onClick={() => navigateTo('login')} className="hover:text-[#A8B5FF] transition-colors">
                Демо: Вход
              </button>
              <span>•</span>
              <button onClick={() => navigateTo('quiz-start')} className="hover:text-[#A8B5FF] transition-colors">
                Демо: Квиз
              </button>
              <span>•</span>
              <button onClick={() => navigateTo('navigator')} className="hover:text-[#A8B5FF] transition-colors">
                Демо: Навигатор
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}