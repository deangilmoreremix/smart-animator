import React, { useState } from 'react';
import { PlayCircle, X } from './Icons';
import AnimatedSection from './AnimatedSection';
import BeforeAfterSlider from './BeforeAfterSlider';

const videos = [
  {
    id: 1,
    title: 'E-commerce Product Demo',
    thumbnail: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Product',
    views: '12K',
    prompt: '360° rotation with studio lighting'
  },
  {
    id: 2,
    title: 'Social Media Portrait',
    thumbnail: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Social',
    views: '8.5K',
    prompt: 'Gentle breathing and hair movement'
  },
  {
    id: 3,
    title: 'Marketing Campaign',
    thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Advertising',
    views: '15K',
    prompt: 'Dramatic zoom with energy'
  },
  {
    id: 4,
    title: 'Real Estate Tour',
    thumbnail: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Real Estate',
    views: '9.2K',
    prompt: 'Smooth camera pan across property'
  }
];

const VideoShowcase: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);

  return (
    <div className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-card border-cyan-500/30 rounded-full px-6 py-3 mb-6">
              <PlayCircle className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 font-semibold text-sm">See It In Action</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Real Videos Created by </span>
              <span className="text-gradient-emerald animate-gradient">
                Real Users
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Watch how businesses transform static images into engaging content
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={200}>
          <div className="mb-16">
            <BeforeAfterSlider
              beforeImage="https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=1200"
              beforeLabel="Original Image"
              afterLabel="AI-Animated Video"
            />
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {videos.map((video, index) => (
            <AnimatedSection
              key={video.id}
              animation="scale"
              delay={index * 100}
            >
              <button
                onClick={() => setSelectedVideo(video.id)}
                className="group relative glass-card rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all w-full"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                      <PlayCircle className="w-10 h-10 text-white" />
                    </div>
                  </div>

                  <div className="absolute top-3 left-3 bg-emerald-500/80 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white text-xs font-semibold">{video.category}</span>
                  </div>

                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white text-xs font-semibold">{video.views} views</span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-white font-semibold mb-2 group-hover:text-emerald-400 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-slate-400 text-sm">"{video.prompt}"</p>
                </div>
              </button>
            </AnimatedSection>
          ))}
        </div>

        {selectedVideo && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="max-w-4xl w-full glass-card rounded-2xl p-6 animate-scale-up">
              <div className="aspect-video bg-slate-800 rounded-xl flex items-center justify-center">
                <PlayCircle className="w-24 h-24 text-white/50" />
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-bold text-white mb-2">
                  {videos.find(v => v.id === selectedVideo)?.title}
                </h3>
                <p className="text-slate-400">
                  Prompt: "{videos.find(v => v.id === selectedVideo)?.prompt}"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoShowcase;
