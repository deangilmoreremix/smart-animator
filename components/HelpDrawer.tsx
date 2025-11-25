import React, { useState, useEffect } from 'react';
import { X, Search, HelpCircle, Book, MessageCircle, ExternalLink } from './Icons';

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface HelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: string;
  articles: HelpArticle[];
  onOpenTour?: () => void;
}

export const HelpDrawer: React.FC<HelpDrawerProps> = ({
  isOpen,
  onClose,
  currentPage = 'general',
  articles,
  onOpenTour
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedArticle(null);
    }
  }, [isOpen]);

  const filteredArticles = articles.filter(article => {
    const matchesPage = !currentPage || article.category === currentPage || article.category === 'general';
    const matchesSearch = !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPage && matchesSearch;
  });

  const contextArticles = filteredArticles.filter(a => a.category === currentPage);
  const generalArticles = filteredArticles.filter(a => a.category === 'general');

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[480px] bg-slate-900 shadow-2xl border-l border-slate-800 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Help Center</h2>
              <p className="text-sm text-slate-400">Get answers and learn more</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close help"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles..."
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {selectedArticle ? (
            <div className="p-6">
              <button
                onClick={() => setSelectedArticle(null)}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 transition-colors"
              >
                <span>←</span>
                <span>Back to articles</span>
              </button>

              <h3 className="text-2xl font-bold text-white mb-4">
                {selectedArticle.title}
              </h3>

              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {selectedArticle.content}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {onOpenTour && (
                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20">
                  <button
                    onClick={onOpenTour}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Book className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold mb-1">
                          Take the Product Tour
                        </h4>
                        <p className="text-sm text-slate-300">
                          Learn the basics in 2 minutes
                        </p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-blue-400" />
                    </div>
                  </button>
                </div>
              )}

              {contextArticles.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Help for this page
                  </h3>
                  <div className="space-y-2">
                    {contextArticles.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="w-full text-left p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-500/30 transition-all group"
                      >
                        <h4 className="text-white font-medium mb-1 group-hover:text-blue-400 transition-colors">
                          {article.title}
                        </h4>
                        <p className="text-sm text-slate-400 line-clamp-2">
                          {article.content}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {generalArticles.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    General Help
                  </h3>
                  <div className="space-y-2">
                    {generalArticles.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="w-full text-left p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-500/30 transition-all group"
                      >
                        <h4 className="text-white font-medium mb-1 group-hover:text-blue-400 transition-colors">
                          {article.title}
                        </h4>
                        <p className="text-sm text-slate-400 line-clamp-2">
                          {article.content}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredArticles.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-slate-400 mb-2">No articles found</p>
                  <p className="text-sm text-slate-500">
                    Try a different search term
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold mb-1">
                  Need More Help?
                </h4>
                <p className="text-sm text-slate-400 mb-3">
                  Contact our support team for assistance
                </p>
                <a
                  href="mailto:support@smartanimator.com"
                  className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>support@smartanimator.com</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpDrawer;
