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
              Bring Your Images to Life
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                AI-Powered Image Animation
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8 leading-relaxed">
              Transform still images into stunning animated videos with AI. Upload any photo and watch it come alive with natural motion powered by Google's Veo 3.1.
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
              icon={<Film className="w-10 h-10" />}
              title="Upload Any Image"
              description="Start with your photos, artwork, or designs. Support for all common image formats including JPG, PNG, and WebP."
            />
            <FeatureCard
              icon={<Sparkles className="w-10 h-10" />}
              title="AI Animation"
              description="Advanced AI analyzes your image and creates natural, realistic motion. No animation skills required."
            />
            <FeatureCard
              icon={<Video className="w-10 h-10" />}
              title="Download HD Videos"
              description="Export your animated videos in 720p or 1080p resolution, ready to share on social media or use in projects."
            />
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-10 mb-20">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Complete Animation Control
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-500/10 p-3 rounded-lg inline-block mb-3">
                  <Settings className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="font-semibold text-white mb-2">Multiple AI Models</h4>
                <p className="text-slate-400 text-sm">Choose from Veo 3.1, Veo 3, or Veo 2 models optimized for image animation</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-500/10 p-3 rounded-lg inline-block mb-3">
                  <Zap className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="font-semibold text-white mb-2">Any Aspect Ratio</h4>
                <p className="text-slate-400 text-sm">Portrait for social media, landscape for web, or cinema for dramatic effect</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-500/10 p-3 rounded-lg inline-block mb-3">
                  <Clock className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="font-semibold text-white mb-2">Custom Duration</h4>
                <p className="text-slate-400 text-sm">Create animations from 4 to 8 seconds perfect for loops and clips</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-500/10 p-3 rounded-lg inline-block mb-3">
                  <Download className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="font-semibold text-white mb-2">Professional Quality</h4>
                <p className="text-slate-400 text-sm">Export in crisp 720p or stunning 1080p resolution</p>
              </div>
            </div>
          </div>

          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Fine-Tune Your Animations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Motion Prompts
                </h4>
                <p className="text-slate-400 text-sm">Describe exactly how you want your image to move. Create gentle swaying, dramatic zooms, or complex motion patterns.</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Camera Control
                </h4>
                <p className="text-slate-400 text-sm">Add dynamic camera movements like pan, tilt, zoom, or orbit to make your animations more cinematic.</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Style References
                </h4>
                <p className="text-slate-400 text-sm">Upload reference images to guide the animation style and maintain visual consistency.</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Visual Styles
                </h4>
                <p className="text-slate-400 text-sm">Apply cinematic styles like film noir, vintage effects, or modern aesthetics to your animated videos.</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Precise Control
                </h4>
                <p className="text-slate-400 text-sm">Use negative prompts to avoid unwanted effects and seed values for reproducible results.</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Smart Defaults
                </h4>
                <p className="text-slate-400 text-sm">Get great results instantly or customize every detail. Perfect for both beginners and professionals.</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-10">
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-12 h-12 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 text-center">
              Your Animation Library
            </h2>
            <p className="text-slate-300 text-center max-w-2xl mx-auto mb-6 leading-relaxed">
              Every animation you create is automatically saved with complete details. Access your entire library anytime, review what worked best, and build on your previous creations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-400 mb-1">Auto-Save</p>
                <p className="text-slate-400 text-sm">Never lose your work</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-400 mb-1">Full Details</p>
                <p className="text-slate-400 text-sm">Settings and parameters saved</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-400 mb-1">Easy Access</p>
                <p className="text-slate-400 text-sm">Browse your history anytime</p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-10 py-5 rounded-lg font-semibold text-xl shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 transition-all inline-flex items-center space-x-3"
            >
              <Sparkles className="w-6 h-6" />
              <span>Animate Your First Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
