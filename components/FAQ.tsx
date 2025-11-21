import React, { useState } from 'react';
import { ChevronDown } from './Icons';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How long does it take to create an animation?",
    answer: "Most animations are generated within 30-60 seconds. The AI processes your image and motion prompt instantly, delivering professional-quality results in under a minute."
  },
  {
    question: "Do I need any design or animation experience?",
    answer: "Not at all! Smart Animator is built for everyone. Simply describe the motion you want in plain English, and our AI handles all the technical animation work. If you can type a sentence, you can create stunning animations."
  },
  {
    question: "What image formats are supported?",
    answer: "We support all common image formats including JPG, PNG, WebP, and more. Images can be portraits, landscapes, products, artwork, or any static visual you want to animate."
  },
  {
    question: "Can I use the videos commercially?",
    answer: "Yes! All videos you create are yours to use however you like - for social media, marketing campaigns, e-commerce, client work, or personal projects. No attribution required."
  },
  {
    question: "What video quality and formats do you provide?",
    answer: "All videos are exported in high-definition (1080p) MP4 format, perfect for social media, websites, and professional presentations. Videos are optimized for fast loading while maintaining excellent quality."
  },
  {
    question: "Is there a limit to how many videos I can create?",
    answer: "Pricing is flexible based on your needs. Our plans range from starter packages to unlimited professional tiers with priority processing and advanced features like longer videos and custom resolutions."
  },
  {
    question: "How does the AI understand what motion I want?",
    answer: "Our AI is powered by Google's Veo 3.1 technology, trained on millions of videos. It understands natural language descriptions like 'slow zoom in' or 'product rotating 360 degrees' and applies realistic, professional motion to your images."
  },
  {
    question: "Can I edit the animation after it's created?",
    answer: "Each generation is unique based on your prompt. If you want different motion, simply adjust your description and generate again. You have full control through natural language - no complex editing tools needed."
  }
];

const FAQItem: React.FC<{ item: FAQItem; isOpen: boolean; onClick: () => void }> = ({ item, isOpen, onClick }) => (
  <div className="glass-card rounded-xl overflow-hidden hover:border-emerald-500/30 transition-all">
    <button
      onClick={onClick}
      className="w-full px-6 py-5 flex items-center justify-between text-left"
    >
      <span className="text-white font-semibold text-lg pr-4">{item.question}</span>
      <ChevronDown className={`w-5 h-5 text-emerald-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <div className={`overflow-hidden transition-all ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
      <div className="px-6 pb-5 text-slate-300 leading-relaxed">
        {item.answer}
      </div>
    </div>
  </div>
);

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mb-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">
          <span className="text-gradient-emerald animate-gradient">
            Frequently Asked Questions
          </span>
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Everything you need to know about creating stunning animations
        </p>
      </div>
      <div className="max-w-3xl mx-auto space-y-3">
        {faqData.map((item, index) => (
          <FAQItem
            key={index}
            item={item}
            isOpen={openIndex === index}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </div>
  );
};

export default FAQ;
