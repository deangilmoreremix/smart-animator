import React, { useState } from 'react';
import { Sparkles, Zap, Download, Target, Settings, Award } from './Icons';
import AnimatedSection from './AnimatedSection';

const features = [
  {
    id: 'ai',
    icon: Sparkles,
    title: 'AI-Powered Animation',
    description: 'Advanced Google Veo 3.1 technology',
    details: [
      'Natural language processing understands your vision',
      'Machine learning creates realistic motion',
      'Automatic scene detection and optimization',
      'Professional quality output every time'
    ],
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'speed',
    icon: Zap,
    title: 'Lightning Fast Processing',
    description: 'Get results in under 60 seconds',
    details: [
      'Cloud-based processing for instant results',
      'No waiting in queues or slow renders',
      'Batch processing for multiple videos',
      'Priority processing for pro users'
    ],
    image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'quality',
    icon: Award,
    title: 'Professional Quality',
    description: 'HD output ready for any platform',
    details: [
      '1080p HD video export',
      'Optimized for all social platforms',
      'No watermarks on any plan',
      'Commercial use rights included'
    ],
    image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'control',
    icon: Target,
    title: 'Complete Control',
    description: 'Fine-tune every aspect of your video',
    details: [
      'Precise motion control with text prompts',
      'Adjust speed, direction, and intensity',
      'Multiple style options to choose from',
      'Regenerate unlimited times'
    ],
    image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'export',
    icon: Download,
    title: 'Easy Export',
    description: 'Download and share instantly',
    details: [
      'One-click download in MP4 format',
      'Direct sharing to social platforms',
      'Cloud storage integration',
      'API access for automation'
    ],
    image: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'customize',
    icon: Settings,
    title: 'Customization',
    description: 'Make it uniquely yours',
    details: [
      'Custom aspect ratios for any platform',
      'Brand color and style matching',
      'Template library for quick starts',
      'Save and reuse favorite settings'
    ],
    image: 'https://images.pexels.com/photos/3183171/pexels-photo-3183171.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
];

const FeaturesTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('ai');
  const activeFeature = features.find(f => f.id === activeTab) || features[0];
  const Icon = activeFeature.icon;

  return (
    <div className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-card border-emerald-500/30 rounded-full px-6 py-3 mb-6">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold text-sm">Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Everything You Need to Create </span>
              <span className="text-gradient-emerald animate-gradient">
                Stunning Videos
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Professional-grade tools designed for creators of all skill levels
            </p>
          </div>
        </AnimatedSection>

        <div className="glass-card rounded-2xl p-6 md:p-8">
          <div className="flex flex-wrap gap-3 mb-8 border-b border-slate-800/50 pb-6">
            {features.map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveTab(feature.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    activeTab === feature.id
                      ? 'bg-gradient-to-r from-emerald-600 to-cyan-500 text-white shadow-lg scale-105'
                      : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <FeatureIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">{feature.title}</span>
                </button>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <AnimatedSection animation="fade-right" key={activeTab}>
              <div>
                <div className={`w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 animate-bounce-subtle`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-3xl font-bold text-white mb-3">{activeFeature.title}</h3>
                <p className="text-xl text-emerald-400 mb-6">{activeFeature.description}</p>

                <div className="space-y-4">
                  {activeFeature.details.map((detail, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-left" key={`${activeTab}-image`}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl blur-2xl"></div>
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={activeFeature.image}
                    alt={activeFeature.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesTabs;
