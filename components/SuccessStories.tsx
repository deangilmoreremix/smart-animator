import React, { useState } from 'react';
import { TrendingUp, Users, Award, ChevronRight } from './Icons';
import AnimatedSection from './AnimatedSection';
import TiltCard from './TiltCard';

interface CaseStudy {
  id: number;
  company: string;
  industry: string;
  logo: string;
  challenge: string;
  solution: string;
  results: {
    metric: string;
    value: string;
    change: string;
  }[];
  testimonial: string;
  author: string;
  role: string;
  avatar: string;
  featured: boolean;
}

const caseStudies: CaseStudy[] = [
  {
    id: 1,
    company: 'TrendyWear Fashion',
    industry: 'E-commerce',
    logo: '👔',
    challenge: 'Static product photos resulted in low engagement and high bounce rates on social media.',
    solution: 'Implemented animated product showcases with 360° rotations and zoom effects for all new arrivals.',
    results: [
      { metric: 'Conversion Rate', value: '47%', change: '+47%' },
      { metric: 'Social Engagement', value: '312%', change: '+312%' },
      { metric: 'Time on Page', value: '3.2min', change: '+156%' },
      { metric: 'Revenue', value: '$124K', change: '+89%' }
    ],
    testimonial: 'Smart Animator transformed our social media presence. Our animated product videos now get 3x more engagement than static images ever did.',
    author: 'Sarah Mitchell',
    role: 'Marketing Director',
    avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=200',
    featured: true
  },
  {
    id: 2,
    company: 'HomeVista Realty',
    industry: 'Real Estate',
    logo: '🏠',
    challenge: 'Property listings with static photos were not generating enough viewing requests.',
    solution: 'Created animated virtual tours and property highlight videos for all premium listings.',
    results: [
      { metric: 'Viewing Requests', value: '2.3x', change: '+130%' },
      { metric: 'Listing Views', value: '284%', change: '+284%' },
      { metric: 'Average Sale Time', value: '-18 days', change: '-45%' },
      { metric: 'Commission', value: '$89K', change: '+67%' }
    ],
    testimonial: 'Properties with animated videos sell 45% faster. This tool paid for itself in the first week.',
    author: 'Michael Chen',
    role: 'Senior Real Estate Agent',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
    featured: true
  },
  {
    id: 3,
    company: 'FitLife Coaching',
    industry: 'Fitness & Wellness',
    logo: '💪',
    challenge: 'Instagram posts were getting lost in the feed, resulting in declining follower growth.',
    solution: 'Started creating animated transformation photos and exercise demonstrations.',
    results: [
      { metric: 'Follower Growth', value: '523%', change: '+523%' },
      { metric: 'Client Inquiries', value: '8.2x', change: '+720%' },
      { metric: 'Post Reach', value: '456%', change: '+456%' },
      { metric: 'New Clients', value: '+47', change: '+340%' }
    ],
    testimonial: 'We went from posting to crickets to having a waitlist of clients. Animated content is the secret weapon.',
    author: 'Jessica Torres',
    role: 'Founder & Head Coach',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200',
    featured: false
  }
];

const SuccessStories: React.FC = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-card border-green-500/30 rounded-full px-6 py-3 mb-6">
              <Award className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold text-sm">Real Results, Real People</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Success Stories from </span>
              <span className="text-gradient-emerald animate-gradient">
                Our Customers
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              See how businesses like yours are achieving remarkable results with Smart Animator
            </p>
          </div>
        </AnimatedSection>

        <div className="space-y-8">
          {caseStudies.map((study, index) => (
            <AnimatedSection
              key={study.id}
              animation="fade-up"
              delay={index * 150}
            >
              <TiltCard>
                <div className="glass-card rounded-2xl p-8 hover:border-green-500/50 transition-all">
                  {study.featured && (
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-1.5 rounded-full mb-6">
                      <Award className="w-4 h-4 text-white" />
                      <span className="text-white text-xs font-bold">FEATURED SUCCESS</span>
                    </div>
                  )}

                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                          {study.logo}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">{study.company}</h3>
                          <p className="text-emerald-400 font-semibold">{study.industry}</p>
                        </div>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div>
                          <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                            The Challenge
                          </h4>
                          <p className="text-slate-300 leading-relaxed">{study.challenge}</p>
                        </div>

                        <div>
                          <h4 className="text-cyan-400 font-bold mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                            The Solution
                          </h4>
                          <p className="text-slate-300 leading-relaxed">{study.solution}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {study.results.map((result, idx) => (
                          <div key={idx} className="bg-slate-800/50 rounded-xl p-4 text-center">
                            <div className="text-2xl font-black text-gradient-emerald mb-1">
                              {result.value}
                            </div>
                            <p className="text-xs text-slate-400 mb-1">{result.metric}</p>
                            <div className="inline-flex items-center gap-1 bg-green-500/20 px-2 py-0.5 rounded-full">
                              <TrendingUp className="w-3 h-3 text-green-400" />
                              <span className="text-green-400 text-xs font-bold">{result.change}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                        <div className="flex items-start gap-4">
                          <img
                            src={study.avatar}
                            alt={study.author}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1">
                            <p className="text-slate-300 italic mb-3 leading-relaxed">"{study.testimonial}"</p>
                            <div>
                              <p className="text-white font-semibold">{study.author}</p>
                              <p className="text-slate-400 text-sm">{study.role}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleExpand(study.id)}
                    className="mt-6 flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                  >
                    <span>{expandedId === study.id ? 'Show Less' : 'Read Full Case Study'}</span>
                    <ChevronRight className={`w-5 h-5 transition-transform ${expandedId === study.id ? 'rotate-90' : ''}`} />
                  </button>

                  {expandedId === study.id && (
                    <div className="mt-6 pt-6 border-t border-slate-700/50 animate-fade-in">
                      <p className="text-slate-300 leading-relaxed mb-4">
                        This is where you would include the full detailed case study with additional metrics,
                        implementation details, timeline, and more customer quotes. The full story shows the
                        complete journey from challenge to success.
                      </p>
                      <button className="bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg">
                        Download Full Case Study PDF
                      </button>
                    </div>
                  )}
                </div>
              </TiltCard>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection animation="fade-up" delay={400}>
          <div className="mt-12 text-center glass-card rounded-2xl p-8">
            <Users className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">Want to Be Our Next Success Story?</h3>
            <p className="text-slate-300 mb-6">Join hundreds of businesses already growing with Smart Animator</p>
            <button className="bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg shadow-emerald-500/30">
              Start Your Success Story
            </button>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default SuccessStories;
