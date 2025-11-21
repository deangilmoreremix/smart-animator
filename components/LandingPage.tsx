import React from 'react';
import { Film, Video, Sparkles, Zap, Layers, Download, CheckCircle, TrendingUp, Shield } from './Icons';
import Testimonials from './Testimonials';
import FAQ from './FAQ';
import AnimatedBackground from './AnimatedBackground';
import ScrollProgress from './ScrollProgress';
import TiltCard from './TiltCard';
import MagneticButton from './MagneticButton';
import AnimatedCounter from './AnimatedCounter';

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
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/30 glass-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30 animate-pulse-glow">
              <span className="font-bold text-white text-lg">S</span>
            </div>
            <h1 className="text-xl font-bold text-gradient-emerald tracking-tight">Smart Animator</h1>
          </div>
          <MagneticButton
            onClick={onGetStarted}
            className="bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white px-6 py-2 rounded-lg font-medium text-sm transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
          >
            Sign In
          </MagneticButton>
        </div>
      </header>

      <div className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-teal-600/5 to-cyan-500/10"></div>
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-card border-emerald-500/20 rounded-full px-6 py-3 mb-8 animate-shimmer">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold text-sm">Powered by Google Veo 3.1 AI</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              <span className="text-white">Stop Losing Engagement.</span>
              <br />
              <span className="text-gradient-emerald animate-gradient">
                Create Scroll-Stopping Videos
              </span>
              <br />
              <span className="text-white">in 60 Seconds</span>
            </h1>

            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Transform any static image into a dynamic video with AI. No design skills needed.
              Simply describe the motion you want - our AI does the rest.
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center mb-10">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm">Professional quality</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm">HD video exports</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm">60 second processing</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <MagneticButton
                onClick={onGetStarted}
                className="group btn-holographic animate-gradient text-white px-10 py-5 rounded-xl font-bold text-lg shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60 hover:scale-105 transition-all inline-flex items-center space-x-3"
              >
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span>Create Your First Video</span>
              </MagneticButton>
            </div>

            <p className="text-slate-500 text-sm mt-4">Join 500+ creators already using Smart Animator</p>
          </div>

          <div className="relative mb-20">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 glass-card border-emerald-500/30 rounded-full px-4 py-2 animate-pulse-glow">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold text-sm">Real Results: 3x More Engagement</span>
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
                  <p className="text-slate-400 text-sm">Showcase products with smooth 360° rotation</p>
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
                  <p className="text-slate-400 text-sm">Create attention-grabbing posts that convert</p>
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
                  <p className="text-slate-400 text-sm">Visuals that drive clicks and conversions</p>
                </button>
              </TiltCard>
            </div>

            <div className="mt-8 text-center">
              <p className="text-slate-400 text-sm">Click any example above to try it instantly</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            <TiltCard>
              <div className="glass-card border-emerald-500/30 rounded-2xl p-8 hover:border-emerald-400/50 transition-all group h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Launch Campaigns 10x Faster</h3>
                <p className="text-slate-300 leading-relaxed">
                  What used to take your design team hours now takes 60 seconds. Ship content while your competitors are still planning.
                </p>
              </div>
            </TiltCard>

            <TiltCard>
              <div className="glass-card border-cyan-500/30 rounded-2xl p-8 hover:border-cyan-400/50 transition-all group h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/30">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">No Design Skills Needed</h3>
                <p className="text-slate-300 leading-relaxed">
                  Our AI does the heavy lifting. Simply describe what you want in plain English - no complex tools or training required.
                </p>
              </div>
            </TiltCard>

            <TiltCard>
              <div className="glass-card border-emerald-500/30 rounded-2xl p-8 hover:border-emerald-400/50 transition-all group h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Proven to Boost Engagement</h3>
                <p className="text-slate-300 leading-relaxed">
                  Our users report 3x more clicks, longer view times, and higher conversion rates compared to static images.
                </p>
              </div>
            </TiltCard>
          </div>

          <div className="glass-card rounded-3xl p-12 mb-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5"></div>
            <div className="relative">
              <h2 className="text-4xl font-bold text-center mb-4">
                <span className="text-gradient-emerald animate-gradient">
                  How It Works
                </span>
              </h2>
            <p className="text-slate-400 text-center max-w-2xl mx-auto mb-16 text-lg">
              Three simple steps to create stunning animations
            </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="text-center">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/40 animate-pulse-glow">
                      <span className="text-3xl font-black text-white">1</span>
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"></div>
                  </div>
                  <Film className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Upload Image</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Drop any image - product photos, portraits, landscapes, or artwork
                  </p>
                </div>

                <div className="text-center">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-teal-500/40 animate-pulse-glow" style={{ animationDelay: '0.5s' }}>
                      <span className="text-3xl font-black text-white">2</span>
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></div>
                  </div>
                  <Sparkles className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Describe Motion</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Tell our AI how you want it to move using simple natural language
                  </p>
                </div>

                <div className="text-center">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-cyan-500/40 animate-pulse-glow" style={{ animationDelay: '1s' }}>
                      <span className="text-3xl font-black text-white">3</span>
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"></div>
                  </div>
                  <Download className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Download HD Video</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Get your animated video in seconds, ready to share everywhere
                  </p>
                </div>
              </div>

              <div className="mt-16 text-center">
                <MagneticButton
                  onClick={onGetStarted}
                  className="btn-holographic animate-gradient text-white px-10 py-5 rounded-xl font-bold text-lg shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60 hover:scale-105 transition-all inline-flex items-center space-x-3"
                >
                  <Sparkles className="w-6 h-6" />
                  <span>Start Creating Videos</span>
                </MagneticButton>
              </div>
            </div>
          </div>

          <Testimonials />

          <div className="mb-20">
            <h2 className="text-4xl font-bold text-center mb-4">
              <span className="text-gradient-emerald animate-gradient">
                Perfect For Every Use Case
              </span>
            </h2>
            <p className="text-slate-400 text-center max-w-3xl mx-auto mb-12 text-lg">
              Transform your content strategy with AI-powered animations
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <TiltCard glowColor="rgba(249, 115, 22, 0.3)">
                <button
                  onClick={() => handleDemoClick("Slowly rotate the product 360 degrees, camera orbits smoothly, soft studio lighting")}
                  className="group glass-card hover:border-orange-500/50 rounded-2xl p-6 text-left transition-all w-full h-full"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/30">
                    <Layers className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">E-commerce</h3>
                  <p className="text-slate-400 text-sm mb-3">360° product views increase sales by 47%</p>
                  <p className="text-orange-400 text-xs font-semibold">Click to try</p>
                </button>
              </TiltCard>

              <TiltCard glowColor="rgba(236, 72, 153, 0.3)">
                <button
                  onClick={() => handleDemoClick("Gentle breathing motion, hair moves slightly in the breeze, slow zoom in")}
                  className="group glass-card hover:border-pink-500/50 rounded-2xl p-6 text-left transition-all w-full h-full"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-pink-500/30">
                    <Film className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">Social Media</h3>
                  <p className="text-slate-400 text-sm mb-3">Get 3x more engagement vs static posts</p>
                  <p className="text-pink-400 text-xs font-semibold">Click to try</p>
                </button>
              </TiltCard>

              <TiltCard glowColor="rgba(16, 185, 129, 0.3)">
                <button
                  onClick={() => handleDemoClick("Clouds drift across sky, trees sway gently, camera pans slowly")}
                  className="group glass-card hover:border-emerald-500/50 rounded-2xl p-6 text-left transition-all w-full h-full"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Real Estate</h3>
                  <p className="text-slate-400 text-sm mb-3">Bring property photos to life instantly</p>
                  <p className="text-emerald-400 text-xs font-semibold">Click to try</p>
                </button>
              </TiltCard>

              <TiltCard glowColor="rgba(234, 179, 8, 0.3)">
                <button
                  onClick={() => handleDemoClick("Dramatic zoom in, background blur increases, energetic camera movement")}
                  className="group glass-card hover:border-yellow-500/50 rounded-2xl p-6 text-left transition-all w-full h-full"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-yellow-500/30">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">Advertising</h3>
                  <p className="text-slate-400 text-sm mb-3">Drive clicks and conversions with motion</p>
                  <p className="text-yellow-400 text-xs font-semibold">Click to try</p>
                </button>
              </TiltCard>
            </div>
          </div>

          <FAQ />

          <div className="relative glass-card border-emerald-500/30 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-cyan-900/20 to-teal-900/30"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
            <div className="max-w-3xl mx-auto relative">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl mb-8 shadow-2xl shadow-emerald-500/50 animate-pulse-glow">
                <Sparkles className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-4xl md:text-5xl font-black mb-6">
                <span className="text-gradient-emerald animate-gradient">
                  Start Creating Today
                </span>
              </h2>

              <p className="text-xl text-slate-300 mb-10 leading-relaxed">
                Join 500+ creators transforming static images into engaging videos.
                Get started in seconds.
              </p>

              <MagneticButton
                onClick={onGetStarted}
                className="group btn-holographic animate-gradient text-white px-12 py-6 rounded-2xl font-black text-xl shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-500/70 hover:scale-105 transition-all inline-flex items-center space-x-4"
              >
                <Sparkles className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                <span>Create Your First Video</span>
              </MagneticButton>

              <div className="flex flex-wrap gap-6 justify-center items-center mt-8 text-slate-400 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>HD quality</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Commercial use</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Secure & private</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
