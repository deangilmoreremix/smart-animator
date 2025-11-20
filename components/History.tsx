import React, { useEffect, useState } from 'react';
import { databaseService, VideoGeneration } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Video, Clock, Trash2, Download } from './Icons';

const History: React.FC = () => {
  const { user } = useAuth();
  const [generations, setGenerations] = useState<VideoGeneration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadGenerations();
    }
  }, [user?.id]);

  const loadGenerations = async () => {
    if (!user?.id) return;
    setLoading(true);
    const data = await databaseService.getVideoGenerations(user.id);
    setGenerations(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this generation?')) {
      const success = await databaseService.deleteVideoGeneration(id);
      if (success) {
        setGenerations(generations.filter(g => g.id !== id));
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Loading history...</div>
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Video className="w-16 h-16 text-slate-700 mb-4" />
        <h3 className="text-xl font-semibold text-slate-400 mb-2">No generations yet</h3>
        <p className="text-slate-500">Your video generation history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Generation History</h2>
        <span className="text-slate-400 text-sm">{generations.length} videos</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {generations.map((gen) => (
          <div key={gen.id} className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all group">
            {gen.video_url ? (
              <div className="aspect-video bg-slate-950 relative overflow-hidden">
                <video
                  src={gen.video_url}
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                />
              </div>
            ) : (
              <div className="aspect-video bg-slate-950 flex items-center justify-center">
                <Video className="w-12 h-12 text-slate-700" />
              </div>
            )}

            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate mb-1">{gen.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2">{gen.prompt}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ml-2 whitespace-nowrap ${
                  gen.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                  gen.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                  'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {gen.status}
                </span>
              </div>

              <div className="flex items-center text-xs text-slate-500 mb-3 space-x-3">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDate(gen.created_at!)}
                </span>
                <span>{gen.duration}s</span>
                <span>{gen.resolution}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">{gen.model.split('-')[0]}</span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">{gen.aspect_ratio}</span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">{gen.mode}</span>
              </div>

              <div className="flex items-center gap-2 mt-4">
                {gen.video_url && (
                  <a
                    href={gen.video_url}
                    download={`${gen.title}.mp4`}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                )}
                <button
                  onClick={() => handleDelete(gen.id!)}
                  className="flex items-center justify-center gap-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
