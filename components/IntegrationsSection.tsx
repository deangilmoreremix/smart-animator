import React from 'react';
import { Layers, Code, Zap, CheckCircle } from './Icons';
import AnimatedSection from './AnimatedSection';

interface Integration {
  name: string;
  description: string;
  logo: string;
  category: string;
  color: string;
}

const integrations: Integration[] = [
  { name: 'Shopify', description: 'E-commerce platform', logo: '🛍️', category: 'E-commerce', color: 'bg-green-500' },
  { name: 'WordPress', description: 'Content management', logo: '📝', category: 'CMS', color: 'bg-blue-500' },
  { name: 'Instagram', description: 'Social media', logo: '📸', category: 'Social', color: 'bg-pink-500' },
  { name: 'Facebook', description: 'Social advertising', logo: '👥', category: 'Social', color: 'bg-blue-600' },
  { name: 'TikTok', description: 'Short-form video', logo: '🎵', category: 'Social', color: 'bg-slate-900' },
  { name: 'Zapier', description: 'Automation', logo: '⚡', category: 'Automation', color: 'bg-orange-500' },
  { name: 'Make', description: 'Workflow automation', logo: '🔧', category: 'Automation', color: 'bg-purple-500' },
  { name: 'Slack', description: 'Team communication', logo: '💬', category: 'Productivity', color: 'bg-purple-600' },
  { name: 'Dropbox', description: 'Cloud storage', logo: '📦', category: 'Storage', color: 'bg-blue-500' },
  { name: 'Google Drive', description: 'Cloud storage', logo: '☁️', category: 'Storage', color: 'bg-yellow-500' },
  { name: 'HubSpot', description: 'CRM & Marketing', logo: '🎯', category: 'Marketing', color: 'bg-orange-600' },
  { name: 'Mailchimp', description: 'Email marketing', logo: '📧', category: 'Marketing', color: 'bg-yellow-400' }
];

const IntegrationsSection: React.FC = () => {
  return (
    <div className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-card border-blue-500/30 rounded-full px-6 py-3 mb-6">
              <Layers className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-semibold text-sm">Seamless Integrations</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Works With Your </span>
              <span className="text-gradient-emerald animate-gradient">
                Favorite Tools
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Connect Smart Animator to your existing workflow in seconds
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {integrations.map((integration, index) => (
            <AnimatedSection
              key={integration.name}
              animation="scale"
              delay={index * 50}
            >
              <div className="glass-card rounded-xl p-6 hover:border-blue-500/50 transition-all group cursor-pointer">
                <div className={`w-12 h-12 ${integration.color} rounded-lg flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
                  {integration.logo}
                </div>
                <h3 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                  {integration.name}
                </h3>
                <p className="text-slate-400 text-sm">{integration.description}</p>
                <div className="mt-3 inline-block bg-blue-500/20 px-2 py-1 rounded text-blue-400 text-xs font-semibold">
                  {integration.category}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <AnimatedSection animation="fade-right">
            <div className="glass-card rounded-2xl p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Powerful API</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Build custom integrations with our RESTful API. Full documentation, code examples in multiple languages, and developer support included.
              </p>
              <ul className="space-y-3 mb-6">
                {['RESTful endpoints', 'Webhook support', 'Rate limiting: 1000 req/min', 'Real-time status updates', 'Comprehensive documentation'].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg">
                View API Docs
              </button>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-left">
            <div className="glass-card rounded-2xl p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No-Code Automation</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Connect Smart Animator to 5000+ apps without writing code. Create automated workflows that save hours every week.
              </p>
              <ul className="space-y-3 mb-6">
                {['Zapier integration', 'Make.com workflows', 'IFTTT support', 'Pre-built templates', 'Visual workflow builder'].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-orange-500 hover:to-yellow-400 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg">
                Browse Templates
              </button>
            </div>
          </AnimatedSection>
        </div>

        <AnimatedSection animation="fade-up" delay={400}>
          <div className="mt-12 text-center glass-card rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-3">Need a Custom Integration?</h3>
            <p className="text-slate-300 mb-6">
              Our team can help build custom integrations for enterprise customers
            </p>
            <button className="bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white px-8 py-4 rounded-lg font-bold transition-all shadow-lg">
              Contact Our Integration Team
            </button>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default IntegrationsSection;
