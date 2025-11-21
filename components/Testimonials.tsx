import React from 'react';
import { Star } from './Icons';
import TiltCard from './TiltCard';
import AnimatedCounter from './AnimatedCounter';

interface TestimonialProps {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
}

const testimonials: TestimonialProps[] = [
  {
    name: "Sarah Chen",
    role: "Marketing Director",
    company: "TechFlow Inc",
    content: "We've seen a 3x increase in engagement since using Smart Animator. What used to take our design team hours now takes minutes. Absolute game-changer for our social media campaigns.",
    rating: 5,
    avatar: "SC"
  },
  {
    name: "Marcus Rodriguez",
    role: "E-commerce Owner",
    company: "StyleHub",
    content: "Our product videos now look professionally animated. Sales conversion increased 47% after adding these animations to our product pages. Best investment we've made.",
    rating: 5,
    avatar: "MR"
  },
  {
    name: "Emily Watson",
    role: "Content Creator",
    company: "Creative Studio",
    content: "I create content for 5+ brands daily. Smart Animator saves me 10+ hours every week. The AI understands exactly what motion I want. It's like having a professional animator on demand.",
    rating: 5,
    avatar: "EW"
  },
  {
    name: "David Park",
    role: "Agency Creative Director",
    company: "Pixel Forge",
    content: "We can now offer animated content to all our clients without hiring additional staff. The quality is consistently high and our clients are blown away by the results.",
    rating: 5,
    avatar: "DP"
  }
];

const Testimonial: React.FC<TestimonialProps> = ({ name, role, company, content, rating, avatar }) => (
  <TiltCard>
    <div className="glass-card rounded-2xl p-6 hover:border-emerald-500/30 transition-all h-full">
    <div className="flex gap-1 mb-4">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
      ))}
    </div>
      <p className="text-slate-300 mb-6 leading-relaxed">{content}</p>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/30">
          {avatar}
        </div>
        <div>
          <p className="text-white font-semibold">{name}</p>
          <p className="text-slate-400 text-sm">{role} at {company}</p>
        </div>
      </div>
    </div>
  </TiltCard>
);

const Testimonials: React.FC = () => {
  return (
    <div className="mb-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">
          <span className="text-gradient-emerald animate-gradient">
            Loved by Creators Worldwide
          </span>
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Join thousands of marketers, creators, and businesses transforming their visual content
        </p>
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="text-center">
            <AnimatedCounter end={2500} suffix="+" className="text-3xl font-bold text-gradient-emerald" />
            <p className="text-slate-400 text-sm mt-1">Videos Created</p>
          </div>
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gradient-emerald">4.8/5</p>
            <p className="text-slate-400 text-sm mt-1">User Rating</p>
          </div>
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
          <div className="text-center">
            <AnimatedCounter end={500} suffix="+" className="text-3xl font-bold text-gradient-emerald" />
            <p className="text-slate-400 text-sm mt-1">Happy Users</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((testimonial, index) => (
          <Testimonial key={index} {...testimonial} />
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
