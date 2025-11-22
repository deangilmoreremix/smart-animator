import React from 'react';
import { Shield, Clock, CheckCircle, RefreshCw } from './Icons';
import TiltCard from './TiltCard';

const GuaranteeSection: React.FC = () => {
  return (
    <div className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 glass-card border-emerald-500/30 rounded-full px-6 py-3 mb-6">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold text-sm">Zero Risk Guarantee</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">Try It </span>
            <span className="text-gradient-emerald animate-gradient">Risk-Free</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            We're so confident you'll love Smart Animator, we back it with these guarantees
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <TiltCard glowColor="rgba(16, 185, 129, 0.3)">
            <div className="glass-card border-emerald-500/30 rounded-2xl p-8 h-full hover:border-emerald-400/50 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">60-Second Video Guarantee</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                If your video takes longer than 60 seconds to generate, we'll refund your credit. No questions asked.
              </p>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                <p className="text-emerald-300 text-sm font-medium">Average generation time: 45 seconds</p>
              </div>
            </div>
          </TiltCard>

          <TiltCard glowColor="rgba(6, 182, 212, 0.3)">
            <div className="glass-card border-cyan-500/30 rounded-2xl p-8 h-full hover:border-cyan-400/50 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Satisfaction Guarantee</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Not happy with your results? Get a full refund within 30 days. Zero hassle. Zero questions.
              </p>
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
                <p className="text-cyan-300 text-sm font-medium">Less than 2% refund rate</p>
              </div>
            </div>
          </TiltCard>
        </div>

        <div className="glass-card border-emerald-500/30 rounded-2xl p-8 md:p-12 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              What You Get With Every Plan
            </h3>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3 text-left">
                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-semibold mb-1">HD Quality Exports</p>
                  <p className="text-slate-400 text-sm">Professional 1080p MP4 videos</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-semibold mb-1">Commercial License</p>
                  <p className="text-slate-400 text-sm">Use for clients and campaigns</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-semibold mb-1">Unlimited Revisions</p>
                  <p className="text-slate-400 text-sm">Regenerate as many times as needed</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-semibold mb-1">Priority Support</p>
                  <p className="text-slate-400 text-sm">Fast response when you need help</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-semibold mb-1">No Watermarks</p>
                  <p className="text-slate-400 text-sm">Clean, professional output</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-semibold mb-1">Secure & Private</p>
                  <p className="text-slate-400 text-sm">Your content stays yours</p>
                </div>
              </div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Shield className="w-6 h-6 text-emerald-400" />
                <p className="text-xl font-bold text-white">Protected by Our Guarantee</p>
              </div>
              <p className="text-slate-300">
                Join with confidence. If you're not thrilled with your results, we'll make it right.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuaranteeSection;
