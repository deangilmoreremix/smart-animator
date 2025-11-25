import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import VeoAnimator from './components/VeoAnimator';
import LandingPage from './components/LandingPage';
import History from './components/History';
import AuthPage from './components/AuthPage';
import AdminPanel from './components/AdminPanel';
import { ContactsManager } from './components/ContactsManager';
import { DistributionPage } from './components/DistributionPage';
import { RefreshCw, Film, Clock, LogOut, User, Shield, Users, Send, HelpCircle } from './components/Icons';

type Page = 'landing' | 'animator' | 'history' | 'contacts' | 'distribution' | 'admin';

const AppContent: React.FC = () => {
  const { user, loading, signOut, isSuperAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [demoPrompt, setDemoPrompt] = useState<string | null>(null);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [celebrationData, setCelebrationData] = useState<any>(null);
  const [helpArticles, setHelpArticles] = useState<any[]>([]);

  const handleDemoClick = (prompt: string) => {
    if (!user) {
      setShowAuthPage(true);
      return;
    }
    setDemoPrompt(prompt);
    setCurrentPage('animator');
  };

  const handleGetStarted = () => {
    if (!user) {
      setShowAuthPage(true);
      return;
    }
    setDemoPrompt(null);
    setCurrentPage('animator');
  };

  const handleAuthSuccess = async () => {
    setShowAuthPage(false);
    setCurrentPage('animator');

    if (user) {
      const shouldShow = await onboardingService.shouldShowWelcome(user.id);
      if (shouldShow) {
        await onboardingService.createOrGetProfile(user.id);
        setShowWelcome(true);
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setCurrentPage('landing');
  };

  useEffect(() => {
    const initOnboarding = async () => {
      if (user) {
        const shouldShowWelcome = await onboardingService.shouldShowWelcome(user.id);
        if (shouldShowWelcome && currentPage !== 'landing') {
          setShowWelcome(true);
        }
      }
    };

    const loadHelpArticles = async () => {
      const articles = await helpService.getAllArticles();
      if (articles.length === 0) {
        setHelpArticles(helpService.getDefaultArticles());
      } else {
        setHelpArticles(articles);
      }
    };

    initOnboarding();
    loadHelpArticles();
  }, [user, currentPage]);

  const handleStartTour = () => {
    setShowWelcome(false);
    setShowTour(true);
  };

  const handleSkipWelcome = async () => {
    if (user) {
      await onboardingService.skipOnboarding(user.id);
    }
    setShowWelcome(false);
  };

  const handleTourComplete = async () => {
    if (user) {
      await onboardingService.completeOnboarding(user.id);
    }
    setShowTour(false);
    setShowQuickStart(true);
  };

  const handleQuickStartNavigate = (page: 'contacts' | 'animator' | 'distribution') => {
    setCurrentPage(page);
  };

  const handleQuickStartComplete = async () => {
    if (user) {
      await onboardingService.updateOnboardingProgress(user.id, {
        quick_start_completed: true
      });
    }
    setShowQuickStart(false);
    setCelebrationData({
      title: 'Welcome Aboard!',
      message: 'You\'re all set up and ready to create amazing campaigns!',
      achievement: 'Completed Quick Start Guide'
    });
    setShowCelebration(true);
  };

  const handleOpenHelp = async () => {
    if (user) {
      await onboardingService.incrementHelpDrawerOpened(user.id);
    }
    setShowHelp(true);
  };

  const handleOpenTourFromHelp = () => {
    setShowHelp(false);
    setShowTour(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (showAuthPage || (!user && currentPage !== 'landing')) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <LandingPage
            onGetStarted={handleGetStarted}
            onDemoClick={handleDemoClick}
          />
        );
      case 'animator':
        return <VeoAnimator initialPrompt={demoPrompt} />;
      case 'history':
        return <History />;
      case 'contacts':
        return <ContactsManager />;
      case 'distribution':
        return <DistributionPage />;
      case 'admin':
        return <AdminPanel />;
      default:
        return (
          <LandingPage
            onGetStarted={handleGetStarted}
            onDemoClick={handleDemoClick}
          />
        );
    }
  };

  if (currentPage === 'landing') {
    return renderPage();
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 relative overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-950/20 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <header className="relative z-10 border-b border-slate-800/50 backdrop-blur-md bg-slate-950/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setCurrentPage('landing')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                 <span className="font-bold text-white text-lg">S</span>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Smart Animator</h1>
            </button>

            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage('animator')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === 'animator'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Film className="w-4 h-4 inline mr-2" />
                Create
              </button>
              <button
                onClick={() => setCurrentPage('history')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === 'history'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                History
              </button>
              <button
                onClick={() => setCurrentPage('contacts')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === 'contacts'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Contacts
              </button>
              <button
                onClick={() => setCurrentPage('distribution')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === 'distribution'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Send className="w-4 h-4 inline mr-2" />
                Distribute
              </button>
              {isSuperAdmin && (
                <button
                  onClick={() => setCurrentPage('admin')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === 'admin'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Shield className="w-4 h-4 inline mr-2" />
                  Admin
                </button>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenHelp}
                  className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors px-3 py-2 rounded-lg hover:bg-slate-800"
                  title="Help"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span className="hidden md:inline text-sm">Help</span>
                </button>
                <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm">
                  <User className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-slate-800"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden md:inline text-sm">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="md:hidden border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-2 flex space-x-2 overflow-x-auto">
            <button
              onClick={() => setCurrentPage('animator')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === 'animator'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Film className="w-4 h-4 inline mr-2" />
              Create
            </button>
            <button
              onClick={() => setCurrentPage('history')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === 'history'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              History
            </button>
            <button
              onClick={() => setCurrentPage('contacts')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === 'contacts'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Contacts
            </button>
            <button
              onClick={() => setCurrentPage('distribution')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === 'distribution'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Send className="w-4 h-4 inline mr-2" />
              Distribute
            </button>
            {isSuperAdmin && (
              <button
                onClick={() => setCurrentPage('admin')}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === 'admin'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Admin
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {renderPage()}
      </main>

      <footer className="relative z-10 border-t border-slate-800 mt-12 py-8 bg-slate-950">
         <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
           <p>Powered by Google Gemini Veo 3.1 &bull; Built with React & Tailwind</p>
         </div>
      </footer>

      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
        onStartTour={handleStartTour}
        onSkip={handleSkipWelcome}
      />

      <InteractiveTour
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        onComplete={handleTourComplete}
        currentPage={currentPage}
      />

      <QuickStartWizard
        isOpen={showQuickStart}
        onClose={() => setShowQuickStart(false)}
        onComplete={handleQuickStartComplete}
        onNavigate={handleQuickStartNavigate}
      />

      {celebrationData && (
        <CelebrationModal
          isOpen={showCelebration}
          onClose={() => {
            setShowCelebration(false);
            setCelebrationData(null);
          }}
          title={celebrationData.title}
          message={celebrationData.message}
          achievement={celebrationData.achievement}
          stats={celebrationData.stats}
        />
      )}

      <HelpDrawer
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        currentPage={helpService.getPageContextFromRoute(currentPage)}
        articles={helpArticles}
        onOpenTour={handleOpenTourFromHelp}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
