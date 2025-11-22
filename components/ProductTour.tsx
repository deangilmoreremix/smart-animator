import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, Clock } from './Icons';
import AnimatedSection from './AnimatedSection';

interface Step {
  number: number;
  title: string;
  description: string;
  image: string;
  duration: string;
  tips: string[];
}

const steps: Step[] = [
  {
    number: 1,
    title: 'Upload Your Image',
    description: 'Drag and drop any image or select from your device. Supports JPG, PNG, and WebP formats up to 10MB.',
    image: 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=800',
    duration: '5 seconds',
    tips: ['Use high-resolution images for best results', 'Square or landscape formats work best', 'Clear, well-lit images produce better animations']
  },
  {
    number: 2,
    title: 'Describe the Motion',
    description: 'Tell our AI how you want your image to move. Use natural language like "slowly zoom in" or "gentle breathing motion".',
    image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
    duration: '10 seconds',
    tips: ['Be specific about speed and direction', 'Combine multiple motion types', 'Try our template prompts for inspiration']
  },
  {
    number: 3,
    title: 'AI Processing',
    description: 'Our Google Veo 3.1 AI analyzes your image and creates natural, realistic motion. Watch the magic happen in real-time.',
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    duration: '30-45 seconds',
    tips: ['Processing time varies by complexity', 'You can queue multiple videos', 'Receive email when complete']
  },
  {
    number: 4,
    title: 'Preview & Adjust',
    description: 'Review your animated video. Not perfect? Regenerate with adjusted prompts or try different motion styles.',
    image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
    duration: '15 seconds',
    tips: ['Compare side-by-side with original', 'Fine-tune motion intensity', 'Save favorite prompts for reuse']
  },
  {
    number: 5,
    title: 'Download & Share',
    description: 'Export in HD quality and share directly to social platforms or download for your campaigns.',
    image: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=800',
    duration: '10 seconds',
    tips: ['Download in MP4 format', 'Optimized for all platforms', 'No watermarks on any plan']
  }
];

const ProductTour: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const currentStep = steps[activeStep];

  const nextStep = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const goToStep = (index: number) => {
    setActiveStep(index);
  };

  return (
    <div className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-card border-cyan-500/30 rounded-full px-6 py-3 mb-6">
              <CheckCircle className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 font-semibold text-sm">Simple 5-Step Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Create Your First Video in </span>
              <span className="text-gradient-emerald animate-gradient">
                Under 2 Minutes
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              No learning curve. No complicated software. Just results.
            </p>
          </div>
        </AnimatedSection>

        <div className="glass-card rounded-3xl p-8 md:p-12">
          <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <button
                  onClick={() => goToStep(index)}
                  className={`flex flex-col items-center min-w-[80px] transition-all ${
                    index === activeStep ? 'scale-110' : 'scale-100 opacity-60'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white mb-2 transition-all ${
                      index === activeStep
                        ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/50'
                        : index < activeStep
                        ? 'bg-emerald-500'
                        : 'bg-slate-700'
                    }`}
                  >
                    {index < activeStep ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className={`text-xs font-medium text-center ${index === activeStep ? 'text-white' : 'text-slate-400'}`}>
                    {step.title.split(' ')[0]}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`h-1 w-16 mx-2 rounded transition-all ${index < activeStep ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                )}
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center" key={activeStep}>
            <AnimatedSection animation="fade-right">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-emerald-500/30">
                    {currentStep.number}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white">{currentStep.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-400 text-sm font-semibold">{currentStep.duration}</span>
                    </div>
                  </div>
                </div>

                <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                  {currentStep.description}
                </p>

                <div className="bg-slate-800/50 rounded-xl p-6 mb-6">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                    Pro Tips:
                  </h4>
                  <ul className="space-y-2">
                    {currentStep.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-300 text-sm">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={prevStep}
                    disabled={activeStep === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-slate-800 hover:bg-slate-700 text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={activeStep === steps.length - 1}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white shadow-lg"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-left">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl blur-2xl"></div>
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={currentStep.image}
                    alt={currentStep.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2">
                      <p className="text-white text-sm font-semibold">Step {currentStep.number} of {steps.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800/50 text-center">
            <p className="text-slate-400 text-sm mb-2">Total time from start to finish</p>
            <p className="text-2xl font-bold text-gradient-emerald">Less than 2 minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTour;
