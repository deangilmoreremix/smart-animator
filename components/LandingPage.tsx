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

interface ExampleCardProps {
  category: string;
  title: string;
  prompt: string;
  description: string;
}

const ExampleCard: React.FC<ExampleCardProps> = ({ category, title, prompt, description }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-blue-500/30 transition-all group">
    <div className="mb-4">
      <span className="text-blue-400 text-xs font-semibold uppercase tracking-wide">{category}</span>
      <h3 className="text-lg font-bold text-white mt-1">{title}</h3>
    </div>
    <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-4 mb-3">
      <p className="text-slate-300 text-sm italic leading-relaxed">"{prompt}"</p>
    </div>
    <p className="text-slate-400 text-sm">{description}</p>
  </div>
);

interface UseCaseCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  examples: string[];
}

const UseCaseCard: React.FC<UseCaseCardProps> = ({ icon, title, description, examples }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-blue-500/30 transition-all">
    <div className="text-blue-400 mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
    <p className="text-slate-400 text-sm mb-4 leading-relaxed">{description}</p>
    <ul className="space-y-2">
      {examples.map((example, idx) => (
        <li key={idx} className="flex items-start text-slate-300 text-sm">
          <span className="text-blue-400 mr-2">•</span>
          <span>{example}</span>
        </li>
      ))}
    </ul>
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

          <div className="bg-gradient-to-br from-blue-500/5 to-blue-600/5 border border-blue-500/20 rounded-2xl p-8 mb-20">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <span className="inline-block bg-blue-500/20 text-blue-400 text-sm font-semibold px-4 py-2 rounded-full mb-4">
                  FEATURED DEMO
                </span>
                <h2 className="text-3xl font-bold text-white mb-3">
                  Static Image → Animated Video
                </h2>
                <p className="text-slate-400">
                  See the transformation happen in real-time
                </p>
              </div>
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="relative aspect-square bg-gradient-to-br from-slate-800 to-slate-900">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Film className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm font-medium">Static Image</p>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 to-transparent p-4">
                      <p className="text-slate-400 text-xs">Original photo uploaded</p>
                    </div>
                  </div>
                  <div className="relative aspect-square bg-gradient-to-br from-blue-900/20 to-blue-950/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="relative">
                          <Video className="w-16 h-16 text-blue-400 mx-auto mb-3" />
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-blue-400 text-sm font-medium">Animated Video</p>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 to-transparent p-4">
                      <p className="text-slate-300 text-xs font-medium">AI-generated animation with motion</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-900/50 p-6 border-t border-slate-800">
                  <div className="flex items-start space-x-3">
                    <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-medium text-sm mb-1">Animation Prompt Used:</p>
                      <p className="text-slate-300 text-sm italic">
                        "Camera slowly zooms in while subject turns head slightly, soft lighting creates depth, natural breathing motion"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-12 mb-20">
            <h2 className="text-4xl font-bold text-white mb-4 text-center">
              How It Works
            </h2>
            <p className="text-slate-400 text-center max-w-2xl mx-auto mb-12 text-lg">
              From static image to stunning animation in three simple steps
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="relative">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-400">1</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 text-center">Upload Your Image</h3>
                <p className="text-slate-400 text-center leading-relaxed">
                  Select any image from your device. Product shots, portraits, landscapes, artwork - anything you want to animate.
                </p>
              </div>
              <div className="relative">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-400">2</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 text-center">Describe the Motion</h3>
                <p className="text-slate-400 text-center leading-relaxed">
                  Write a simple prompt describing how you want your image to move. Our AI understands natural language and creates the animation.
                </p>
              </div>
              <div className="relative">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-400">3</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 text-center">Download & Share</h3>
                <p className="text-slate-400 text-center leading-relaxed">
                  Get your animated video in seconds. Download in HD quality and share on social media, websites, or presentations.
                </p>
              </div>
            </div>
            <div className="mt-12 text-center">
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 transition-all inline-flex items-center space-x-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>Try It Now - It's Free</span>
              </button>
            </div>
          </div>

          <div className="mb-20">
            <h2 className="text-4xl font-bold text-white mb-4 text-center">
              See It In Action
            </h2>
            <p className="text-slate-400 text-center max-w-3xl mx-auto mb-12 text-lg">
              Watch how static images transform into dynamic animations with just a simple prompt
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden group">
                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mx-auto mb-4">
                        <Film className="w-10 h-10 text-blue-400" />
                      </div>
                      <p className="text-slate-400 text-sm">Product Animation Demo</p>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-blue-400 text-xs font-semibold">BEFORE</span>
                  </div>
                  <div className="absolute top-4 right-4 bg-blue-500/20 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-500">
                    <span className="text-blue-400 text-xs font-semibold">AFTER</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Product Showcase</h3>
                  <p className="text-slate-400 text-sm mb-3">
                    Transform a simple product photo into a dynamic 360° rotating showcase
                  </p>
                  <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-3">
                    <p className="text-slate-300 text-xs italic">
                      "Slowly rotate the product 360 degrees, camera orbits smoothly, soft studio lighting"
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden group">
                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mx-auto mb-4">
                        <Video className="w-10 h-10 text-blue-400" />
                      </div>
                      <p className="text-slate-400 text-sm">Portrait Animation Demo</p>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-blue-400 text-xs font-semibold">BEFORE</span>
                  </div>
                  <div className="absolute top-4 right-4 bg-blue-500/20 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-500">
                    <span className="text-blue-400 text-xs font-semibold">AFTER</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Cinematic Portrait</h3>
                  <p className="text-slate-400 text-sm mb-3">
                    Add natural breathing and subtle movements to bring portraits to life
                  </p>
                  <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-3">
                    <p className="text-slate-300 text-xs italic">
                      "Gentle breathing motion, hair moves slightly in the breeze, slow zoom in on eyes"
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden group">
                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-10 h-10 text-blue-400" />
                      </div>
                      <p className="text-slate-400 text-sm">Landscape Animation Demo</p>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-blue-400 text-xs font-semibold">BEFORE</span>
                  </div>
                  <div className="absolute top-4 right-4 bg-blue-500/20 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-500">
                    <span className="text-blue-400 text-xs font-semibold">AFTER</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Living Landscape</h3>
                  <p className="text-slate-400 text-sm mb-3">
                    Make static landscapes come alive with moving clouds, swaying trees, and flowing water
                  </p>
                  <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-3">
                    <p className="text-slate-300 text-xs italic">
                      "Clouds drift across sky, trees sway gently, camera pans slowly across scene"
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden group">
                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mx-auto mb-4">
                        <Layers className="w-10 h-10 text-blue-400" />
                      </div>
                      <p className="text-slate-400 text-sm">Social Media Demo</p>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-blue-400 text-xs font-semibold">BEFORE</span>
                  </div>
                  <div className="absolute top-4 right-4 bg-blue-500/20 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-500">
                    <span className="text-blue-400 text-xs font-semibold">AFTER</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Social Content</h3>
                  <p className="text-slate-400 text-sm mb-3">
                    Create eye-catching content optimized for Instagram, TikTok, and other platforms
                  </p>
                  <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-3">
                    <p className="text-slate-300 text-xs italic">
                      "Dramatic zoom in, background blur increases, energetic camera movement"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-20">
            <h2 className="text-4xl font-bold text-white mb-4 text-center">
              Why Choose AI Animation?
            </h2>
            <p className="text-slate-400 text-center max-w-3xl mx-auto mb-12 text-lg">
              Skip the expensive video production and complex animation software. Get professional results in minutes, not weeks.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
                <div className="text-red-400 mb-4">
                  <Clock className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Traditional Video Production</h3>
                <ul className="space-y-2 text-slate-400 text-sm mb-4">
                  <li>Days or weeks of planning</li>
                  <li>Expensive equipment and crew</li>
                  <li>Complex editing software</li>
                  <li>Costly reshoots for changes</li>
                </ul>
                <p className="text-red-400 font-bold">$1,000s + Weeks of work</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-2 border-blue-500 rounded-xl p-8 text-center relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full">BEST CHOICE</span>
                </div>
                <div className="text-blue-400 mb-4">
                  <Sparkles className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">AI Image Animation</h3>
                <ul className="space-y-2 text-slate-300 text-sm mb-4">
                  <li>Upload and animate in minutes</li>
                  <li>No equipment needed</li>
                  <li>Simple, intuitive interface</li>
                  <li>Unlimited iterations and tweaks</li>
                </ul>
                <p className="text-blue-400 font-bold">Seconds to create</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
                <div className="text-orange-400 mb-4">
                  <Settings className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Animation Software</h3>
                <ul className="space-y-2 text-slate-400 text-sm mb-4">
                  <li>Steep learning curve</li>
                  <li>Expensive software licenses</li>
                  <li>Hours of manual work per clip</li>
                  <li>Requires animation expertise</li>
                </ul>
                <p className="text-orange-400 font-bold">$100s/mo + Hours per video</p>
              </div>
            </div>
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
            <h2 className="text-4xl font-bold text-white mb-4 text-center">
              Animation Examples
            </h2>
            <p className="text-slate-400 text-center max-w-3xl mx-auto mb-12 text-lg">
              See what's possible with AI-powered image animation. From product demos to social content, the possibilities are endless.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <ExampleCard
                category="Product Animation"
                title="Floating Product Shot"
                prompt="Camera slowly orbits around the product as it gently rotates, soft lighting creates highlights and shadows"
                description="Perfect for e-commerce and product showcases. Makes static product photos dynamic and eye-catching."
              />
              <ExampleCard
                category="Portrait Animation"
                title="Cinematic Portrait"
                prompt="Subtle head movement and natural breathing, hair gently moves with a breeze, soft focus shift from eyes to background"
                description="Bring portrait photos to life with natural micro-movements that add depth and emotion."
              />
              <ExampleCard
                category="Landscape Animation"
                title="Nature Scene"
                prompt="Clouds drift across the sky, trees sway in the wind, camera slowly pans left revealing more of the landscape"
                description="Transform landscape photos into immersive scenes with natural environmental motion."
              />
              <ExampleCard
                category="Social Media"
                title="Instagram Story"
                prompt="Slow zoom in on subject while background subtly blurs, text overlay area remains stable"
                description="Create attention-grabbing social content that stands out in feeds and stories."
              />
              <ExampleCard
                category="Real Estate"
                title="Property Showcase"
                prompt="Smooth camera glide through the space, natural lighting shifts, atmospheric depth"
                description="Turn property photos into virtual tours that engage potential buyers."
              />
              <ExampleCard
                category="Art & Design"
                title="Artwork Animation"
                prompt="Parallax effect separating foreground and background elements, subtle color shifting, dramatic lighting"
                description="Give digital art and illustrations dynamic depth and movement for portfolios."
              />
            </div>
          </div>

          <div className="mb-20">
            <h2 className="text-4xl font-bold text-white mb-4 text-center">
              Perfect For Every Creator
            </h2>
            <p className="text-slate-400 text-center max-w-3xl mx-auto mb-12 text-lg">
              Whether you're a marketer, content creator, designer, or business owner, image animation unlocks new creative possibilities.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <UseCaseCard
                icon={<Sparkles className="w-10 h-10" />}
                title="Content Creators & Marketers"
                description="Stand out on social media and capture attention with animated posts, stories, and ads."
                examples={[
                  "Eye-catching Instagram and TikTok content",
                  "Animated product demonstrations",
                  "Dynamic LinkedIn posts and professional content",
                  "Engaging email marketing visuals"
                ]}
              />
              <UseCaseCard
                icon={<Film className="w-10 h-10" />}
                title="E-commerce & Retail"
                description="Showcase products in motion without expensive video shoots or complex 3D modeling."
                examples={[
                  "360-degree product views from a single photo",
                  "Animated product catalogs",
                  "Dynamic homepage hero sections",
                  "Before and after transformations"
                ]}
              />
              <UseCaseCard
                icon={<Video className="w-10 h-10" />}
                title="Real Estate & Property"
                description="Transform property photos into engaging virtual tours that attract more buyers."
                examples={[
                  "Property walkthroughs from still photos",
                  "Animated listing previews",
                  "Neighborhood and amenity showcases",
                  "Construction progress documentation"
                ]}
              />
              <UseCaseCard
                icon={<Layers className="w-10 h-10" />}
                title="Designers & Artists"
                description="Bring your creative work to life and showcase it in dynamic portfolios and presentations."
                examples={[
                  "Animated portfolio pieces",
                  "Character and illustration movement",
                  "Architectural visualizations",
                  "Motion graphics from static designs"
                ]}
              />
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
