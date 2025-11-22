import React from 'react';
import { ShoppingCart, Users, Home, Briefcase, GraduationCap, Heart } from './Icons';
import AnimatedSection from './AnimatedSection';
import TiltCard from './TiltCard';

const industries = [
  {
    icon: ShoppingCart,
    title: 'E-Commerce',
    description: 'Boost product sales with 360° views',
    stats: '47% higher conversion rate',
    features: ['Product rotations', 'Zoom effects', 'Feature highlights', 'Bundle animations'],
    color: 'from-orange-500 to-red-500',
    bgColor: 'orange-500/20'
  },
  {
    icon: Users,
    title: 'Social Media Marketing',
    description: 'Create thumb-stopping content',
    stats: '3x more engagement',
    features: ['Story animations', 'Reel content', 'Post enhancements', 'Brand consistency'],
    color: 'from-pink-500 to-rose-500',
    bgColor: 'pink-500/20'
  },
  {
    icon: Home,
    title: 'Real Estate',
    description: 'Bring properties to life',
    stats: '2x faster bookings',
    features: ['Virtual tours', 'Aerial views', 'Room highlights', 'Neighborhood tours'],
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'blue-500/20'
  },
  {
    icon: Briefcase,
    title: 'Corporate Training',
    description: 'Engage learners effectively',
    stats: '85% completion rate',
    features: ['Process demos', 'Safety videos', 'Product training', 'Onboarding content'],
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'purple-500/20'
  },
  {
    icon: GraduationCap,
    title: 'Education',
    description: 'Make learning interactive',
    stats: '60% better retention',
    features: ['Lesson animations', 'Concept visualization', 'Study guides', 'Exam prep'],
    color: 'from-green-500 to-emerald-500',
    bgColor: 'green-500/20'
  },
  {
    icon: Heart,
    title: 'Healthcare',
    description: 'Simplify complex procedures',
    stats: '40% faster understanding',
    features: ['Patient education', 'Procedure demos', 'Equipment training', 'Health tips'],
    color: 'from-red-500 to-pink-500',
    bgColor: 'red-500/20'
  }
];

const IndustryShowcase: React.FC = () => {
  return (
    <div className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-card border-emerald-500/30 rounded-full px-6 py-3 mb-6">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold text-sm">Trusted Across Industries</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gradient-emerald animate-gradient">
                Built for Every Industry
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              From e-commerce to education, Smart Animator delivers results across every sector
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry, index) => {
            const Icon = industry.icon;
            return (
              <AnimatedSection
                key={index}
                animation="fade-up"
                delay={index * 100}
              >
                <TiltCard glowColor={`rgba(${industry.bgColor})`}>
                  <div className="glass-card rounded-2xl p-8 h-full hover:border-emerald-500/50 transition-all group">
                    <div className={`w-16 h-16 bg-gradient-to-br ${industry.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                      {industry.title}
                    </h3>

                    <p className="text-slate-300 mb-4">{industry.description}</p>

                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2 mb-6 inline-block">
                      <p className="text-emerald-400 font-semibold text-sm">{industry.stats}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-slate-400 text-sm font-semibold mb-3">Perfect for:</p>
                      {industry.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                          <span className="text-slate-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default IndustryShowcase;
