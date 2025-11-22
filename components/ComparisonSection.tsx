import React from 'react';
import { X, CheckCircle } from './Icons';

const ComparisonSection: React.FC = () => {
  const comparisons = [
    {
      feature: 'Time to create video',
      traditional: '4-8 hours',
      smartAnimator: '60 seconds',
    },
    {
      feature: 'Cost per video',
      traditional: '$300-600',
      smartAnimator: 'Pennies',
    },
    {
      feature: 'Design skills required',
      traditional: 'Professional level',
      smartAnimator: 'None',
    },
    {
      feature: 'Software to learn',
      traditional: 'After Effects, Premiere',
      smartAnimator: 'Just type',
    },
    {
      feature: 'Quality consistency',
      traditional: 'Varies by designer',
      smartAnimator: 'Always professional',
    },
    {
      feature: 'Scalability',
      traditional: 'Limited by team',
      smartAnimator: 'Unlimited',
    },
  ];

  return (
    <div className="py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient-emerald animate-gradient">
              Traditional Methods
            </span>
            <br />
            <span className="text-white">vs Smart Animator</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            See why businesses are switching to AI-powered video creation
          </p>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="grid grid-cols-3 gap-4 p-6 border-b border-slate-800/50 bg-slate-900/50">
            <div className="text-slate-400 font-semibold"></div>
            <div className="text-center">
              <p className="text-slate-400 font-semibold text-sm mb-2">Traditional Methods</p>
              <p className="text-slate-500 text-xs">(Hiring designers/agencies)</p>
            </div>
            <div className="text-center">
              <p className="text-emerald-400 font-bold text-sm mb-2">Smart Animator</p>
              <p className="text-emerald-500/60 text-xs">(AI-powered solution)</p>
            </div>
          </div>

          {comparisons.map((item, index) => (
            <div
              key={index}
              className={`grid grid-cols-3 gap-4 p-6 ${
                index !== comparisons.length - 1 ? 'border-b border-slate-800/30' : ''
              }`}
            >
              <div className="flex items-center">
                <p className="text-white font-medium text-sm md:text-base">{item.feature}</p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-slate-400 text-sm text-center">{item.traditional}</p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <p className="text-emerald-400 font-semibold text-sm text-center">{item.smartAnimator}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 glass-card border-emerald-500/30 rounded-full px-6 py-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <p className="text-slate-300 text-sm">
              <span className="font-bold text-emerald-400">97% cost reduction</span> compared to traditional methods
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSection;
