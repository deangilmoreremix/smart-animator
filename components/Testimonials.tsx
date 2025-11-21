import React from 'react';
import { Star } from './Icons';

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
  <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
    <div className="flex gap-1 mb-4">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
      ))}
    </div>
    <p className="text-slate-300 mb-6 leading-relaxed">{content}</p>
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
        {avatar}
      </div>
      <div>
        <p className="text-white font-semibold">{name}</p>
        <p className="text-slate-400 text-sm">{role} at {company}</p>
      </div>
    </div>
  </div>
);

const Testimonials: React.FC = () => {
  return (
    <div className="mb-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Loved by Creators Worldwide
          </span>
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Join thousands of marketers, creators, and businesses transforming their visual content
        </p>
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">50,000+</p>
            <p className="text-slate-400 text-sm">Videos Created</p>
          </div>
          <div className="w-px h-12 bg-slate-700"></div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">4.9/5</p>
            <p className="text-slate-400 text-sm">User Rating</p>
          </div>
          <div className="w-px h-12 bg-slate-700"></div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">10,000+</p>
            <p className="text-slate-400 text-sm">Happy Users</p>
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
