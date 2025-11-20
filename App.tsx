import React from 'react';
import VeoAnimator from './components/VeoAnimator';
import { RefreshCw } from './components/Icons';

const App: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-slate-950 relative overflow-x-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-950/20 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <header className="relative z-10 border-b border-slate-800/50 backdrop-blur-md bg-slate-950/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
               <span className="font-bold text-white text-lg">V</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Veo Animator</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800"
              title="Reload App"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <VeoAnimator />
      </main>

      <footer className="relative z-10 border-t border-slate-800 mt-12 py-8 bg-slate-950">
         <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
           <p>Powered by Google Gemini Veo 3.1 &bull; Built with React & Tailwind</p>
         </div>
      </footer>
    </div>
  );
};

export default App;