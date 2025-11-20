import React from 'react';
import { Film, Video, Sparkles, Zap, Layers, Settings, Download, Clock, Shield } from './Icons';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-blue-500/50 transition-all group">
    <div className="text-blue-400 mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
  </div>
);

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-blue-500/10"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blue-500/10 p-4 rounded-2xl">
                <Film className="w-16 h-16 text-blue-400" />
              </div>
            </div>
            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
              AI Video Generation
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                Powered by Veo 3.1
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8 leading-relaxed">
              Create stunning, professional videos from text, images, or extend existing videos with Google's most advanced AI video generation model.
            </p>
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 transition-all inline-flex items-center space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Start Creating</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <FeatureCard
              icon={<Video className="w-10 h-10" />}
              title="Text-to-Video"
              description="Transform your ideas into videos with just a text prompt. Describe what you want and watch it come to life."
            />
            <FeatureCard
              icon={<Film className="w-10 h-10" />}
              title="Image-to-Video"
              description="Animate still images with natural motion. Bring photos and artwork to life with realistic movement."
            />
            <FeatureCard
              icon={<Layers className="w-10 h-10" />}
              title="Video Extension"
              description="Extend existing videos seamlessly. Add more content and continue the story beyond the original footage."
            />
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-10 mb-20">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Powerful Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-500/10 p-3 rounded-lg inline-block mb-3">
                  <Settings className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="font-semibold text-white mb-2">5 Model Options</h4>
                <p className="text-slate-400 text-sm">Choose from Veo 3.1, Veo 3, or Veo 2 models with fast variants</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-500/10 p-3 rounded-lg inline-block mb-3">
                  <Zap className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="font-semibold text-white mb-2">5 Aspect Ratios</h4>
                <p className="text-slate-400 text-sm">Portrait, Square, Landscape, Ultrawide, and Cinema formats</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-500/10 p-3 rounded-lg inline-block mb-3">
                  <Clock className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="font-semibold text-white mb-2">Flexible Duration</h4>
                <p className="text-slate-400 text-sm">Generate videos from 4 to 8 seconds in length</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-500/10 p-3 rounded-lg inline-block mb-3">
                  <Download className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="font-semibold text-white mb-2">HD & Full HD</h4>
                <p className="text-slate-400 text-sm">Export in 720p or 1080p resolution</p>
              </div>
            </div>
          </div>

          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Advanced Controls
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Reference Images
                </h4>
                <p className="text-slate-400 text-sm">Upload up to 3 reference images to guide style, content, or asset consistency across generations.</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Camera Motion
                </h4>
                <p className="text-slate-400 text-sm">Define camera movements like pan, tilt, zoom, or tracking shots for cinematic effects.</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Cinematic Styles
                </h4>
                <p className="text-slate-400 text-sm">Apply visual styles like noir, vintage, or modern aesthetics to your videos.</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Negative Prompts
                </h4>
                <p className="text-slate-400 text-sm">Specify what to avoid in your video for better control over the final output.</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Seed Control
                </h4>
                <p className="text-slate-400 text-sm">Set a seed value for reproducible generations with consistent results.</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Person Generation
                </h4>
                <p className="text-slate-400 text-sm">Toggle whether people should appear in your generated videos.</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-10">
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-12 h-12 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 text-center">
              Generation History & Database
            </h2>
            <p className="text-slate-300 text-center max-w-2xl mx-auto mb-6 leading-relaxed">
              All your video generations are securely stored in a Supabase database. Track your creations, review parameters, and access your entire generation history anytime.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-400 mb-1">Complete Metadata</p>
                <p className="text-slate-400 text-sm">Every parameter tracked</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-400 mb-1">Secure Storage</p>
                <p className="text-slate-400 text-sm">Row-level security enabled</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-400 mb-1">Easy Access</p>
                <p className="text-slate-400 text-sm">View history anytime</p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-10 py-5 rounded-lg font-semibold text-xl shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 transition-all inline-flex items-center space-x-3"
            >
              <Sparkles className="w-6 h-6" />
              <span>Start Creating Videos Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
