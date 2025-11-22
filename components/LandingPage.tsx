import React from 'react';
import { Film, Video, Sparkles, Zap, Layers, Download, CheckCircle, TrendingUp, Shield, Clock } from './Icons';
import Testimonials from './Testimonials';
import FAQ from './FAQ';
import AnimatedBackground from './AnimatedBackground';
import ScrollProgress from './ScrollProgress';
import TiltCard from './TiltCard';
import MagneticButton from './MagneticButton';
import UrgencyBanner from './UrgencyBanner';
import ProblemSection from './ProblemSection';
import SolutionSection from './SolutionSection';
import SocialProofBanner from './SocialProofBanner';
import ComparisonSection from './ComparisonSection';
import GuaranteeSection from './GuaranteeSection';
import ROICalculator from './ROICalculator';

interface LandingPageProps {
  onGetStarted: () => void;
  onDemoClick?: (prompt: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onDemoClick }) => {
  const handleDemoClick = (prompt: string) => {
    if (onDemoClick) {
      onDemoClick(prompt);
    } else {
      onGetStarted();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
      <AnimatedBackground />
      <ScrollProgress />
      <UrgencyBanner />

      <header className="sticky top-12 z-40 border-b border-slate-800/30 glass-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30 animate-pulse-glow">
              <span className="font-bold text-white text-lg">S</span>
            </div>
            <h1 className="text-xl font-bold text-gradient-emerald tracking-tight">Smart Animator</h1>
          </div>
          <MagneticButton
            onClick={onGetStarted}
            className="group btn-holographic animate-gradient text-white px-8 py-3 rounded-lg font-bold text-sm transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 inline-flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span>Start Free</span>
          </MagneticButton>
        </div>
      </header>

      <div className="relative overflow-hidden pt-28">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-teal-600/5 to-cyan-500/10"></div>
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-card border-emerald-500/20 rounded-full px-6 py-3 mb-8 animate-shimmer">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold text-sm">Powered by Google Veo 3.1 AI</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              <span className="text-white">Stuck With </span>
              <span className="text-red-400">Static Images</span>
              <span className="text-white">?</span>
              <br />
              <span className="text-gradient-emerald animate-gradient">
                Turn Them Into Videos
              </span>
              <br />
              <span className="text-white">in 60 Seconds</span>
            </h1>

            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Stop losing engagement to competitors. Transform your static images into scroll-stopping videos that get <span className="text-emerald-400 font-bold">3x more clicks</span> without hiring designers or learning complex software.
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center mb-10">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm font-semibold">No credit card required</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm font-semibold">Setup in 60 seconds</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-semibold">First video in 2 minutes</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <MagneticButton
                onClick={onGetStarted}
                className="group btn-holographic animate-gradient text-white px-10 py-5 rounded-xl font-bold text-lg shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60 hover:scale-105 transition-all inline-flex items-center space-x-3"
              >
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span>Create Your First Video Free</span>
              </MagneticButton>
            </div>

            <p className="text-slate-400 text-sm mt-4 font-medium">Join 500+ businesses already saving $1000s/month</p>
          </div>

          <div className="relative mb-20">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 glass-card border-emerald-500/30 rounded-full px-4 py-2 animate-pulse-glow">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold text-sm">Click any example to try instantly</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TiltCard glowColor="rgba(16, 185, 129, 0.3)">
                <button
                  onClick={() => handleDemoClick("Slowly rotate the product 360 degrees, smooth studio lighting")}
                  className="group relative glass-card hover:border-emerald-500/50 rounded-2xl p-6 text-left transition-all overflow-hidden w-full h-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-all"></div>
                  <div className="relative aspect-video rounded-xl mb-4 overflow-hidden">
                    <img
                      src="https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800"
                      alt="Product photography"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent"></div>
                    <Film className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-white/80 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-emerald-400 transition-colors">Product Demos</h3>
                  <p className="text-slate-400 text-sm mb-2">360° rotation increases sales by 47%</p>
                  <p className="text-emerald-400 text-xs font-semibold">Try this demo →</p>
                </button>
              </TiltCard>

              <TiltCard glowColor="rgba(6, 182, 212, 0.3)">
                <button
                  onClick={() => handleDemoClick("Gentle breathing motion, hair moves slightly in breeze, slow zoom")}
                  className="group relative glass-card hover:border-cyan-500/50 rounded-2xl p-6 text-left transition-all overflow-hidden w-full h-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-all"></div>
                  <div className="relative aspect-video rounded-xl mb-4 overflow-hidden">
                    <img
                      src="https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=800"
                      alt="Social media content"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent"></div>
                    <Video className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-white/80 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-cyan-400 transition-colors">Social Content</h3>
                  <p className="text-slate-400 text-sm mb-2">Get 3x more engagement than static posts</p>
                  <p className="text-cyan-400 text-xs font-semibold">Try this demo →</p>
                </button>
              </TiltCard>

              <TiltCard glowColor="rgba(20, 184, 166, 0.3)">
                <button
                  onClick={() => handleDemoClick("Dramatic zoom in, background blur, energetic movement")}
                  className="group relative glass-card hover:border-teal-500/50 rounded-2xl p-6 text-left transition-all overflow-hidden w-full h-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-all"></div>
                  <div className="relative aspect-video rounded-xl mb-4 overflow-hidden">
                    <img
                      src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
                      alt="Marketing campaign"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-white/80 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-teal-400 transition-colors">Marketing Campaigns</h3>
                  <p className="text-slate-400 text-sm mb-2">Videos that drive clicks and conversions</p>
                  <p className="text-teal-400 text-xs font-semibold">Try this demo →</p>
                </button>
              </TiltCard>
            </div>
          </div>
        </div>
      </div>

      <SocialProofBanner />

      <ProblemSection />

      <SolutionSection onGetStarted={onGetStarted} />

      <ComparisonSection />

      <ROICalculator />

      <Testimonials />

      <GuaranteeSection />

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="glass-card rounded-3xl p-12 md:p-16 text-center overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-cyan-900/20 to-teal-900/30"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
          <div className="max-w-3xl mx-auto relative">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl mb-8 shadow-2xl shadow-emerald-500/50 animate-pulse-glow">
              <Sparkles className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-4xl md:text-5xl font-black mb-6">
              <span className="text-white">Ready to </span>
              <span className="text-gradient-emerald animate-gradient">Stop Losing</span>
              <br />
              <span className="text-white">to Your Competitors?</span>
            </h2>

            <p className="text-xl text-slate-300 mb-10 leading-relaxed">
              Every day you wait, your competitors capture more attention with dynamic video content. Start creating scroll-stopping videos in the next 2 minutes.
            </p>

            <MagneticButton
              onClick={onGetStarted}
              className="group btn-holographic animate-gradient text-white px-12 py-6 rounded-2xl font-black text-xl shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-500/70 hover:scale-105 transition-all inline-flex items-center space-x-4 mb-6"
            >
              <Sparkles className="w-7 h-7 group-hover:rotate-12 transition-transform" />
              <span>Start Creating Videos Now</span>
            </MagneticButton>

            <div className="flex flex-wrap gap-6 justify-center items-center text-slate-400 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>30-day guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FAQ />

      <footer className="border-t border-slate-800 py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <span className="font-bold text-white text-xl">S</span>
              </div>
              <span className="text-2xl font-bold text-gradient-emerald">Smart Animator</span>
            </div>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Transform static images into dynamic videos with AI. Powered by Google Veo 3.1.
            </p>
          </div>
          <div className="text-slate-500 text-sm">
            <p>Built with React & Tailwind CSS</p>
            <p className="mt-2">© 2025 Smart Animator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
