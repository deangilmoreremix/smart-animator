import React from 'react';
import { CheckCircle, X, Zap } from './Icons';
import AnimatedSection from './AnimatedSection';

interface ComparisonRow {
  feature: string;
  smartAnimator: boolean | string;
  competitor1: boolean | string;
  competitor2: boolean | string;
}

const comparisonData: ComparisonRow[] = [
  { feature: 'AI-Powered Animation', smartAnimator: true, competitor1: true, competitor2: false },
  { feature: 'Processing Speed', smartAnimator: '30-45 sec', competitor1: '2-3 min', competitor2: '5-10 min' },
  { feature: 'Quality (Resolution)', smartAnimator: '1080p HD', competitor1: '720p', competitor2: '1080p' },
  { feature: 'Monthly Price', smartAnimator: '$29', competitor1: '$49', competitor2: '$39' },
  { feature: 'Videos Per Month (Starter)', smartAnimator: '50', competitor1: '20', competitor2: '30' },
  { feature: 'Custom Motion Prompts', smartAnimator: true, competitor1: 'Limited', competitor2: false },
  { feature: 'Batch Processing', smartAnimator: true, competitor1: false, competitor2: 'Pro only' },
  { feature: 'API Access', smartAnimator: 'Pro+', competitor1: 'Enterprise', competitor2: false },
  { feature: 'No Watermarks', smartAnimator: 'All plans', competitor1: 'Pro+', competitor2: 'Pro+' },
  { feature: 'Commercial License', smartAnimator: true, competitor1: true, competitor2: 'Add-on' },
  { feature: 'Support Response Time', smartAnimator: '< 2 hours', competitor1: '24 hours', competitor2: '48 hours' },
  { feature: 'Free Trial', smartAnimator: '14 days', competitor1: '7 days', competitor2: false }
];

const CompetitorComparison: React.FC = () => {
  const renderCell = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto" />
      ) : (
        <X className="w-6 h-6 text-red-400 mx-auto" />
      );
    }
    return <span className="text-white font-semibold">{value}</span>;
  };

  return (
    <div className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-card border-yellow-500/30 rounded-full px-6 py-3 mb-6">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold text-sm">See the Difference</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Why Smart Animator </span>
              <span className="text-gradient-emerald animate-gradient">
                Beats the Competition
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Compare features, pricing, and performance with leading alternatives
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={200}>
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left p-6 text-slate-400 font-semibold">Feature</th>
                    <th className="p-6 text-center">
                      <div className="inline-flex flex-col items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                          <span className="text-white font-bold text-lg">S</span>
                        </div>
                        <span className="text-white font-bold">Smart Animator</span>
                        <span className="text-emerald-400 text-xs mt-1">That's Us!</span>
                      </div>
                    </th>
                    <th className="p-6 text-center">
                      <div className="inline-flex flex-col items-center">
                        <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center mb-2">
                          <span className="text-slate-400 font-bold text-lg">A</span>
                        </div>
                        <span className="text-slate-400 font-semibold">Competitor A</span>
                      </div>
                    </th>
                    <th className="p-6 text-center">
                      <div className="inline-flex flex-col items-center">
                        <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center mb-2">
                          <span className="text-slate-400 font-bold text-lg">B</span>
                        </div>
                        <span className="text-slate-400 font-semibold">Competitor B</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-6 text-slate-300 font-medium">{row.feature}</td>
                      <td className="p-6 text-center bg-emerald-500/5">
                        {renderCell(row.smartAnimator)}
                      </td>
                      <td className="p-6 text-center text-slate-400">
                        {renderCell(row.competitor1)}
                      </td>
                      <td className="p-6 text-center text-slate-400">
                        {renderCell(row.competitor2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={400}>
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="text-4xl font-black text-gradient-emerald mb-2">3x</div>
              <p className="text-slate-300">Faster Processing</p>
            </div>
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="text-4xl font-black text-gradient-emerald mb-2">40%</div>
              <p className="text-slate-300">Lower Price</p>
            </div>
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="text-4xl font-black text-gradient-emerald mb-2">2.5x</div>
              <p className="text-slate-300">More Videos Included</p>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={600}>
          <div className="mt-12 text-center glass-card rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-3">Ready to Switch?</h3>
            <p className="text-slate-300 mb-6">
              Get 50% off your first month when you migrate from a competitor
            </p>
            <button className="bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white px-8 py-4 rounded-lg font-bold transition-all shadow-lg shadow-emerald-500/30">
              Claim Your Switcher Discount
            </button>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default CompetitorComparison;
