import React from 'react';
import { Clock, User, ChevronRight } from './Icons';
import AnimatedSection from './AnimatedSection';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  category: string;
}

const posts: BlogPost[] = [
  {
    id: 1,
    title: '10 Motion Prompts That Get 10x More Engagement',
    excerpt: 'Discover the exact motion prompts that top creators use to make their content go viral on social media.',
    image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
    author: 'Alex Rivera',
    authorAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
    date: 'Dec 15, 2024',
    readTime: '5 min read',
    category: 'Tips & Tricks'
  },
  {
    id: 2,
    title: 'How E-commerce Brands Increased Sales 47% With Animated Product Photos',
    excerpt: 'A case study on how three e-commerce brands transformed their conversion rates using animated product showcases.',
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    author: 'Maria Chen',
    authorAvatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
    date: 'Dec 12, 2024',
    readTime: '8 min read',
    category: 'Case Studies'
  },
  {
    id: 3,
    title: 'The Complete Guide to Video Marketing for Real Estate',
    excerpt: 'Everything you need to know about using animated property videos to sell homes faster and at better prices.',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
    author: 'David Park',
    authorAvatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=100',
    date: 'Dec 10, 2024',
    readTime: '12 min read',
    category: 'Guides'
  }
];

const BlogPreview: React.FC = () => {
  return (
    <div className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-card border-indigo-500/30 rounded-full px-6 py-3 mb-6">
              <User className="w-5 h-5 text-indigo-400" />
              <span className="text-indigo-400 font-semibold text-sm">Learn & Grow</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Latest from Our </span>
              <span className="text-gradient-emerald animate-gradient">
                Blog
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Tips, tutorials, and insights to help you create better animated content
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {posts.map((post, index) => (
            <AnimatedSection
              key={post.id}
              animation="fade-up"
              delay={index * 100}
            >
              <article className="glass-card rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all group cursor-pointer h-full flex flex-col">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                  <div className="absolute top-4 left-4 bg-indigo-500/80 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white text-xs font-semibold">{post.category}</span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-slate-300 mb-4 line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.authorAvatar}
                        alt={post.author}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-white text-sm font-semibold">{post.author}</p>
                        <p className="text-slate-400 text-xs">{post.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </div>
              </article>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection animation="fade-up" delay={300}>
          <div className="text-center">
            <button className="inline-flex items-center gap-2 glass-card hover:border-indigo-500/50 px-8 py-4 rounded-lg font-semibold text-white transition-all group">
              <span>View All Articles</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default BlogPreview;
