import React from 'react';
import { CheckCircle, Zap, DollarSign, Clock } from './Icons';
import TiltCard from './TiltCard';
import MagneticButton from './MagneticButton';

interface SolutionSectionProps {
  onGetStarted: () => void;
}

const SolutionSection: React.FC<SolutionSectionProps> = ({ onGetStarted }) => {
  return (
    <div className="py-16 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 glass-card border-emerald-500/30 rounded-full px-6 py-3 mb-6">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold text-sm">The Solution You've Been Looking For</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient-emerald animate-gradient">
              Turn Any Image Into Video
            </span>
            <br />
            <span className="text-white">In 60 Seconds. No Skills Required.</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Smart Animator uses cutting-edge AI to transform your static images into scroll-stopping videos instantly. No design team. No expensive software. Just results.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <TiltCard glowColor="rgba(16, 185, 129, 0.3)">
            <div className="glass-card border-emerald-500/30 rounded-2xl p-8 h-full hover:border-emerald-400/50 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="mb-4">
                <p className="text-4xl font-black text-gradient-emerald mb-2">60 sec</p>
                <p className="text-slate-400 text-sm">vs 4-8 hours with designers</p>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Lightning Fast Results</h3>
              <p className="text-slate-300 leading-relaxed">
                What takes your design team hours is done in seconds. Upload, describe motion, download.
              </p>
            </div>
          </TiltCard>

          <TiltCard glowColor="rgba(6, 182, 212, 0.3)">
            <div className="glass-card border-cyan-500/30 rounded-2xl p-8 h-full hover:border-cyan-400/50 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div className="mb-4">
                <p className="text-4xl font-black text-gradient-emerald mb-2">97%</p>
                <p className="text-slate-400 text-sm">cost reduction vs hiring</p>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Massive Cost Savings</h3>
              <p className="text-slate-300 leading-relaxed">
                Stop paying $300-600 per video. Create unlimited professional videos for a fraction of the cost.
              </p>
            </div>
          </TiltCard>

          <TiltCard glowColor="rgba(20, 184, 166, 0.3)">
            <div className="glass-card border-teal-500/30 rounded-2xl p-8 h-full hover:border-teal-400/50 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-teal-500/30">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="mb-4">
                <p className="text-4xl font-black text-gradient-emerald mb-2">3x</p>
                <p className="text-slate-400 text-sm">more engagement than static</p>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Proven to Convert</h3>
              <p className="text-slate-300 leading-relaxed">
                Our users report 3x more clicks, longer view times, and 47% higher conversion rates.
              </p>
            </div>
          </TiltCard>
        </div>

        <div className="glass-card border-emerald-500/30 rounded-2xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10"></div>
          <div className="relative text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Stop Losing to Your Competition
            </h3>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Every day you wait is another day your competitors capture attention with dynamic content while your static images get ignored.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <MagneticButton
                onClick={onGetStarted}
                className="group btn-holographic animate-gradient text-white px-10 py-5 rounded-xl font-bold text-lg shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60 hover:scale-105 transition-all inline-flex items-center space-x-3"
              >
                <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span>Start Creating Videos Now</span>
              </MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 justify-center items-center text-slate-400 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Setup in 60 seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>First video in under 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionSection;
