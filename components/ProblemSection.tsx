import React from 'react';
import { Clock, DollarSign, TrendingDown, AlertCircle } from './Icons';
import TiltCard from './TiltCard';

const ProblemSection: React.FC = () => {
  return (
    <div className="py-16 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 glass-card border-red-500/30 rounded-full px-6 py-3 mb-6">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-semibold text-sm">The Hidden Cost of Static Content</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Your Static Images Are <span className="text-red-400">Costing You</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            While your competitors are capturing attention with dynamic content, your static images are getting scrolled past in seconds
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <TiltCard glowColor="rgba(239, 68, 68, 0.2)">
            <div className="glass-card border-red-500/30 rounded-2xl p-8 h-full">
              <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Hours Wasted</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Your design team spends 4-8 hours creating a single product video
              </p>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-300 text-sm font-medium">Cost per video: $300-600</p>
              </div>
            </div>
          </TiltCard>

          <TiltCard glowColor="rgba(239, 68, 68, 0.2)">
            <div className="glass-card border-red-500/30 rounded-2xl p-8 h-full">
              <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center mb-6">
                <TrendingDown className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Lost Engagement</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Static images get 70% less engagement than animated content on social media
              </p>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-300 text-sm font-medium">Missing 1000s of potential customers</p>
              </div>
            </div>
          </TiltCard>

          <TiltCard glowColor="rgba(239, 68, 68, 0.2)">
            <div className="glass-card border-red-500/30 rounded-2xl p-8 h-full">
              <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center mb-6">
                <DollarSign className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Revenue Left Behind</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                E-commerce sites with video content convert 47% better than those without
              </p>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-300 text-sm font-medium">Every day without video = lost sales</p>
              </div>
            </div>
          </TiltCard>
        </div>

        <div className="glass-card border-red-500/20 rounded-2xl p-8 md:p-12 text-center bg-red-500/5">
          <p className="text-2xl md:text-3xl font-bold text-white mb-4">
            But here's the real problem...
          </p>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            You know you need video content. But hiring videographers is expensive. Learning complex animation software takes months. And you need results <span className="text-red-400 font-bold">today</span>, not next quarter.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProblemSection;
