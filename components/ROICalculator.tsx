import React, { useState } from 'react';
import { DollarSign, TrendingUp, CheckCircle } from './Icons';
import TiltCard from './TiltCard';

const ROICalculator: React.FC = () => {
  const [videosPerMonth, setVideosPerMonth] = useState(10);

  const traditionalCost = videosPerMonth * 450;
  const smartAnimatorCost = 49;
  const savings = traditionalCost - smartAnimatorCost;
  const savingsPercent = Math.round((savings / traditionalCost) * 100);
  const annualSavings = savings * 12;

  return (
    <div className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 glass-card border-emerald-500/30 rounded-full px-6 py-3 mb-6">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold text-sm">Calculate Your Savings</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">See How Much </span>
            <span className="text-gradient-emerald animate-gradient">You'll Save</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Compare the cost of hiring designers versus using Smart Animator
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 md:p-12 mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <label className="block text-white font-semibold mb-4 text-lg">
                How many videos do you need per month?
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={videosPerMonth}
                onChange={(e) => setVideosPerMonth(Number(e.target.value))}
                className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-slate-400 text-sm">1 video</span>
                <div className="text-center">
                  <p className="text-4xl font-black text-gradient-emerald">{videosPerMonth}</p>
                  <p className="text-slate-400 text-sm">videos/month</p>
                </div>
                <span className="text-slate-400 text-sm">50 videos</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <TiltCard glowColor="rgba(239, 68, 68, 0.2)">
                <div className="glass-card border-red-500/30 rounded-xl p-6 text-center bg-red-500/5">
                  <p className="text-slate-400 text-sm mb-2">Traditional Method</p>
                  <p className="text-3xl font-black text-red-400 mb-2">
                    ${traditionalCost.toLocaleString()}
                  </p>
                  <p className="text-slate-500 text-xs">per month</p>
                  <p className="text-slate-400 text-xs mt-3">
                    Based on $450 avg per video
                  </p>
                </div>
              </TiltCard>

              <TiltCard glowColor="rgba(16, 185, 129, 0.3)">
                <div className="glass-card border-emerald-500/30 rounded-xl p-6 text-center bg-emerald-500/5">
                  <p className="text-slate-400 text-sm mb-2">Smart Animator</p>
                  <p className="text-3xl font-black text-gradient-emerald mb-2">
                    ${smartAnimatorCost}
                  </p>
                  <p className="text-slate-500 text-xs">per month</p>
                  <p className="text-emerald-400 text-xs mt-3 font-semibold">
                    Unlimited videos
                  </p>
                </div>
              </TiltCard>

              <TiltCard glowColor="rgba(6, 182, 212, 0.3)">
                <div className="glass-card border-cyan-500/30 rounded-xl p-6 text-center bg-cyan-500/5">
                  <p className="text-slate-400 text-sm mb-2">Your Savings</p>
                  <p className="text-3xl font-black text-gradient-emerald mb-2">
                    ${savings.toLocaleString()}
                  </p>
                  <p className="text-slate-500 text-xs">per month</p>
                  <p className="text-cyan-400 text-xs mt-3 font-semibold">
                    {savingsPercent}% cost reduction
                  </p>
                </div>
              </TiltCard>
            </div>

            <div className="mt-8 glass-card border-emerald-500/30 rounded-xl p-6 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10">
              <div className="flex items-center justify-center gap-3 mb-3">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
                <p className="text-xl font-bold text-white">Annual Savings Projection</p>
              </div>
              <p className="text-center">
                <span className="text-4xl md:text-5xl font-black text-gradient-emerald">
                  ${annualSavings.toLocaleString()}
                </span>
              </p>
              <p className="text-center text-slate-400 mt-2">
                saved in your first year
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-300 text-sm">
                  <span className="font-semibold text-white">No per-video charges:</span> Create unlimited videos for one flat monthly fee
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-300 text-sm">
                  <span className="font-semibold text-white">No hidden costs:</span> No revision fees, no rush charges, no surprises
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-300 text-sm">
                  <span className="font-semibold text-white">Cancel anytime:</span> No long-term contracts or commitments required
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROICalculator;
