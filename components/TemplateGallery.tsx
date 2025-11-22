import React, { useState } from 'react';
import { Film, Copy, CheckCircle } from './Icons';
import AnimatedSection from './AnimatedSection';
import TiltCard from './TiltCard';

interface Template {
  id: number;
  name: string;
  prompt: string;
  category: string;
  thumbnail: string;
  popular?: boolean;
}

const templates: Template[] = [
  {
    id: 1,
    name: 'Product Rotation',
    prompt: 'Slowly rotate the product 360 degrees, smooth studio lighting, professional showcase',
    category: 'E-commerce',
    thumbnail: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400',
    popular: true
  },
  {
    id: 2,
    name: 'Portrait Breathing',
    prompt: 'Gentle breathing motion, hair moves slightly in breeze, slow zoom in, natural movement',
    category: 'Social Media',
    thumbnail: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=400',
    popular: true
  },
  {
    id: 3,
    name: 'Dramatic Zoom',
    prompt: 'Dramatic zoom in, background blur increases, energetic camera movement, cinematic feel',
    category: 'Marketing',
    thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
    popular: true
  },
  {
    id: 4,
    name: 'Slow Pan',
    prompt: 'Slow camera pan from left to right, smooth motion, reveal details gradually',
    category: 'Real Estate',
    thumbnail: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 5,
    name: 'Upward Float',
    prompt: 'Gentle upward floating motion, ethereal feeling, soft glow effect',
    category: 'Creative',
    thumbnail: 'https://images.pexels.com/photos/1cosmos629/pexels-photo-1629236.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 6,
    name: 'Pulse Effect',
    prompt: 'Subtle pulsing motion, zoom in and out gently, attention-grabbing effect',
    category: 'Social Media',
    thumbnail: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

const categories = ['All', 'E-commerce', 'Social Media', 'Marketing', 'Real Estate', 'Creative'];

const TemplateGallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const copyPrompt = (prompt: string, id: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-card border-purple-500/30 rounded-full px-6 py-3 mb-6">
              <Film className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 font-semibold text-sm">Ready-to-Use Templates</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Instant Inspiration with </span>
              <span className="text-gradient-emerald animate-gradient">
                Motion Prompts
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Copy any prompt and start creating professional videos in seconds
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={200}>
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {categories.map((category, index) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg scale-105'
                    : 'glass-card text-slate-400 hover:text-white hover:border-purple-500/50'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {category}
              </button>
            ))}
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <AnimatedSection
              key={template.id}
              animation="scale"
              delay={index * 100}
            >
              <TiltCard>
                <div className="glass-card rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all group h-full">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>

                    {template.popular && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1 rounded-full">
                        <span className="text-white text-xs font-bold">POPULAR</span>
                      </div>
                    )}

                    <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-white text-xs font-semibold">{template.category}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                      {template.name}
                    </h3>

                    <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                      <p className="text-slate-300 text-sm leading-relaxed font-mono">
                        {template.prompt}
                      </p>
                    </div>

                    <button
                      onClick={() => copyPrompt(template.prompt, template.id)}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                        copiedId === template.id
                          ? 'bg-green-500 text-white'
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      {copiedId === template.id ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          <span>Copy Prompt</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </TiltCard>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection animation="fade-up" delay={400}>
          <div className="mt-12 text-center">
            <div className="glass-card rounded-2xl p-8 inline-block">
              <p className="text-slate-300 mb-4">
                <span className="font-bold text-white">Pro Tip:</span> Mix and match elements from different prompts to create unique animations
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">+ Add lighting effects</span>
                <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm">+ Change speed</span>
                <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm">+ Combine motions</span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default TemplateGallery;
