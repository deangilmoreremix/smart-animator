import React, { useState } from 'react';
import { CheckCircle, X, Zap, Star, Users } from './Icons';
import AnimatedSection from './AnimatedSection';
import TiltCard from './TiltCard';

interface Plan {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  price: {
    monthly: number;
    annual: number;
  };
  description: string;
  features: {
    included: string[];
    excluded?: string[];
  };
  popular?: boolean;
  cta: string;
  color: string;
}

const plans: Plan[] = [
  {
    name: 'Starter',
    icon: Zap,
    price: {
      monthly: 29,
      annual: 290
    },
    description: 'Perfect for individuals and small creators',
    features: {
      included: [
        '50 video generations per month',
        'HD 1080p quality export',
        'Basic motion templates',
        'Email support',
        'Commercial use rights',
        'No watermarks'
      ],
      excluded: [
        'Priority processing',
        'Advanced motion controls',
        'API access',
        'White-label options'
      ]
    },
    cta: 'Start Free Trial',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    name: 'Professional',
    icon: Star,
    price: {
      monthly: 79,
      annual: 790
    },
    description: 'For growing businesses and agencies',
    features: {
      included: [
        'Everything in Starter',
        '200 video generations per month',
        'Priority processing queue',
        'Advanced motion controls',
        'Batch processing',
        'Priority email & chat support',
        'Custom branding',
        'Team collaboration (3 seats)'
      ],
      excluded: [
        'API access',
        'White-label options',
        'Dedicated account manager'
      ]
    },
    popular: true,
    cta: 'Start Free Trial',
    color: 'from-emerald-500 to-cyan-500'
  },
  {
    name: 'Enterprise',
    icon: Users,
    price: {
      monthly: 299,
      annual: 2990
    },
    description: 'For large teams and organizations',
    features: {
      included: [
        'Everything in Professional',
        'Unlimited video generations',
        'Fastest processing priority',
        'Full API access',
        'White-label options',
        'Unlimited team seats',
        'Dedicated account manager',
        '24/7 phone & chat support',
        'Custom integrations',
        'SLA guarantee',
        'Training & onboarding'
      ]
    },
    cta: 'Contact Sales',
    color: 'from-purple-500 to-pink-500'
  }
];

const PricingSection: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');

  const calculateSavings = (monthly: number, annual: number) => {
    const yearlyMonthly = monthly * 12;
    const savings = Math.round(((yearlyMonthly - annual) / yearlyMonthly) * 100);
    return savings;
  };

  return (
    <div className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-card border-purple-500/30 rounded-full px-6 py-3 mb-6">
              <Star className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 font-semibold text-sm">Simple, Transparent Pricing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Choose Your </span>
              <span className="text-gradient-emerald animate-gradient">
                Perfect Plan
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Start free, upgrade anytime. No hidden fees, no surprises.
            </p>

            <div className="inline-flex items-center gap-4 glass-card rounded-full p-2">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-6 py-2 rounded-full font-semibold transition-all flex items-center gap-2 ${
                  billingPeriod === 'annual'
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Annual
                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const price = billingPeriod === 'monthly' ? plan.price.monthly : plan.price.annual;
            const savings = calculateSavings(plan.price.monthly, plan.price.annual);

            return (
              <AnimatedSection
                key={plan.name}
                animation="scale"
                delay={index * 100}
              >
                <TiltCard>
                  <div
                    className={`glass-card rounded-2xl p-8 h-full flex flex-col relative overflow-hidden transition-all ${
                      plan.popular
                        ? 'border-2 border-emerald-500 shadow-2xl shadow-emerald-500/30 scale-105'
                        : 'hover:border-slate-600'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-1 text-xs font-bold rounded-bl-xl">
                        MOST POPULAR
                      </div>
                    )}

                    <div className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-slate-400 mb-6">{plan.description}</p>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-white">${price}</span>
                        <span className="text-slate-400">
                          /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      </div>
                      {billingPeriod === 'annual' && (
                        <p className="text-emerald-400 text-sm font-semibold mt-2">
                          Save {savings}% with annual billing
                        </p>
                      )}
                    </div>

                    <button
                      className={`w-full py-4 rounded-lg font-bold text-white mb-8 transition-all shadow-lg ${
                        plan.popular
                          ? 'bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 shadow-emerald-500/30 hover:shadow-emerald-500/50'
                          : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    >
                      {plan.cta}
                    </button>

                    <div className="space-y-4 flex-1">
                      <p className="text-white font-semibold text-sm mb-3">What's included:</p>
                      {plan.features.included.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-300 text-sm">{feature}</span>
                        </div>
                      ))}
                      {plan.features.excluded && plan.features.excluded.length > 0 && (
                        <>
                          <div className="border-t border-slate-800 pt-4 mt-4">
                            <p className="text-slate-500 font-semibold text-sm mb-3">Not included:</p>
                          </div>
                          {plan.features.excluded.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3 opacity-50">
                              <X className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                              <span className="text-slate-500 text-sm">{feature}</span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </TiltCard>
              </AnimatedSection>
            );
          })}
        </div>

        <AnimatedSection animation="fade-up" delay={400}>
          <div className="mt-16 text-center glass-card rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              All plans include a 14-day free trial
            </h3>
            <p className="text-slate-300 mb-6">
              No credit card required. Cancel anytime. 30-day money-back guarantee.
            </p>
            <div className="flex flex-wrap gap-6 justify-center items-center text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>30-day money back</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Secure payments</span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default PricingSection;
