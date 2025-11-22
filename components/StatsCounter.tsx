import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import AnimatedCounter from './AnimatedCounter';
import { Users, Video, Star, TrendingUp } from './Icons';
import AnimatedSection from './AnimatedSection';

const stats = [
  {
    icon: Users,
    value: 500,
    suffix: '+',
    label: 'Active Users',
    color: 'from-emerald-500 to-cyan-500'
  },
  {
    icon: Video,
    value: 2500,
    suffix: '+',
    label: 'Videos Created',
    color: 'from-cyan-500 to-teal-500'
  },
  {
    icon: Star,
    value: 4.8,
    suffix: '/5',
    label: 'Average Rating',
    color: 'from-yellow-500 to-orange-500',
    decimals: 1
  },
  {
    icon: TrendingUp,
    value: 97,
    suffix: '%',
    label: 'Satisfaction Rate',
    color: 'from-green-500 to-emerald-500'
  }
];

const StatsCounter: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });

  return (
    <div ref={ref} className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="glass-card rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-teal-500/10"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

          <div className="relative">
            <AnimatedSection animation="fade-up">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Trusted by Creators <span className="text-gradient-emerald animate-gradient">Worldwide</span>
                </h2>
                <p className="text-slate-300 text-lg">Join thousands who are already creating amazing content</p>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <AnimatedSection
                    key={index}
                    animation="scale"
                    delay={index * 150}
                  >
                    <div className="text-center group">
                      <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="mb-2">
                        {isVisible && (
                          <AnimatedCounter
                            end={stat.value}
                            suffix={stat.suffix}
                            decimals={stat.decimals}
                            className="text-4xl font-black text-gradient-emerald"
                          />
                        )}
                      </div>
                      <p className="text-slate-400 font-medium">{stat.label}</p>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCounter;
