import React, { useEffect, useState } from 'react';
import { Users, CheckCircle, Star } from './Icons';
import AnimatedCounter from './AnimatedCounter';

const SocialProofBanner: React.FC = () => {
  const [recentActivity, setRecentActivity] = useState('');

  const activities = [
    'Sarah from Austin just created a video',
    'Michael from London created 3 videos today',
    'Emma from Toronto just signed up',
    'David from Sydney created a product video',
    'Lisa from Berlin just downloaded a video',
  ];

  useEffect(() => {
    const updateActivity = () => {
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      setRecentActivity(randomActivity);
    };

    updateActivity();
    const interval = setInterval(updateActivity, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-8 border-y border-slate-800/50 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <AnimatedCounter end={500} suffix="+" className="text-2xl font-bold text-white" />
                <p className="text-slate-400 text-sm">Active Users</p>
              </div>
            </div>

            <div className="hidden md:block w-px h-12 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <Star className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">4.8/5</p>
                <p className="text-slate-400 text-sm">User Rating</p>
              </div>
            </div>

            <div className="hidden md:block w-px h-12 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <AnimatedCounter end={2500} suffix="+" className="text-2xl font-bold text-white" />
                <p className="text-slate-400 text-sm">Videos Created</p>
              </div>
            </div>
          </div>

          <div className="glass-card border-emerald-500/30 rounded-full px-6 py-3 animate-pulse-glow">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <p className="text-slate-300 text-sm font-medium">{recentActivity}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialProofBanner;
