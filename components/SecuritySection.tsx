import React from 'react';
import { Shield, Lock, CheckCircle, Eye } from './Icons';
import AnimatedSection from './AnimatedSection';
import TiltCard from './TiltCard';

const securityFeatures = [
  {
    icon: Shield,
    title: 'Enterprise-Grade Security',
    description: 'Bank-level encryption and security protocols',
    details: [
      'AES-256 encryption at rest',
      'TLS 1.3 encryption in transit',
      'Regular security audits',
      'Penetration testing'
    ]
  },
  {
    icon: Lock,
    title: 'Data Privacy',
    description: 'Your data belongs to you, always',
    details: [
      'GDPR compliant',
      'CCPA compliant',
      'No data selling',
      'Data retention controls'
    ]
  },
  {
    icon: Eye,
    title: 'Access Control',
    description: 'Granular permissions and monitoring',
    details: [
      'Role-based access control',
      'Two-factor authentication',
      'Audit logs',
      'IP whitelisting'
    ]
  }
];

const certifications = [
  { name: 'SOC 2 Type II', icon: '🛡️', status: 'Certified' },
  { name: 'GDPR', icon: '🇪🇺', status: 'Compliant' },
  { name: 'CCPA', icon: '🇺🇸', status: 'Compliant' },
  { name: 'ISO 27001', icon: '📋', status: 'In Progress' }
];

const SecuritySection: React.FC = () => {
  return (
    <div className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-card border-green-500/30 rounded-full px-6 py-3 mb-6">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold text-sm">Enterprise-Grade Security</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Your Content is </span>
              <span className="text-gradient-emerald animate-gradient">
                Safe & Secure
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              We take security seriously so you can focus on creating amazing content
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <AnimatedSection
                key={index}
                animation="fade-up"
                delay={index * 150}
              >
                <TiltCard>
                  <div className="glass-card rounded-2xl p-8 h-full hover:border-green-500/50 transition-all">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-300 mb-6">{feature.description}</p>
                    <ul className="space-y-3">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-slate-300 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TiltCard>
              </AnimatedSection>
            );
          })}
        </div>

        <AnimatedSection animation="fade-up">
          <div className="glass-card rounded-2xl p-8 mb-12">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">Compliance & Certifications</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {certifications.map((cert, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 rounded-xl p-6 text-center hover:bg-slate-800 transition-all"
                >
                  <div className="text-4xl mb-3">{cert.icon}</div>
                  <h4 className="text-white font-semibold mb-2">{cert.name}</h4>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    cert.status === 'Certified' || cert.status === 'Compliant'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {cert.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={200}>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-4">Data Protection</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Encrypted Storage</p>
                    <p className="text-slate-400 text-sm">All files encrypted at rest using AES-256</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Secure Transfer</p>
                    <p className="text-slate-400 text-sm">TLS 1.3 encryption for all data in transit</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Automatic Deletion</p>
                    <p className="text-slate-400 text-sm">Files automatically deleted after 30 days</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Backup & Recovery</p>
                    <p className="text-slate-400 text-sm">Daily backups with 99.9% uptime SLA</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-4">Privacy Commitment</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">No Training on Your Data</p>
                    <p className="text-slate-400 text-sm">We never use your content to train AI models</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Data Ownership</p>
                    <p className="text-slate-400 text-sm">You retain full ownership of all your content</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Export Anytime</p>
                    <p className="text-slate-400 text-sm">Download all your data in standard formats</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Right to be Forgotten</p>
                    <p className="text-slate-400 text-sm">Request complete data deletion at any time</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={400}>
          <div className="mt-12 text-center glass-card rounded-2xl p-8">
            <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">Questions About Security?</h3>
            <p className="text-slate-300 mb-6">
              Our security team is here to help. Get detailed answers to your security questions.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg">
                Contact Security Team
              </button>
              <button className="glass-card hover:border-green-500/50 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                Read Security Whitepaper
              </button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default SecuritySection;
