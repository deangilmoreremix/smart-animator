import React, { useState, useRef, useEffect } from 'react';
import { AspectRatio } from '../types';
import { veoService } from '../services/veoService';
import Button from './Button';
import { UploadCloud, Video, Film, Download, RefreshCw, XCircle, Loader2 } from './Icons';

const VeoAnimator: React.FC = () => {
  // State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("A close-up video of the character speaking and making natural facial expressions.");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.PORTRAIT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Timer State
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file (PNG or JPG).");
      return;
    }
    setImageFile(file);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const startTimer = () => {
    setElapsedTime(0);
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleGenerate = async () => {
    if (!imageFile || !imagePreview) return;

    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    startTimer();

    try {
      // Extract base64 data without prefix
      const base64Data = imagePreview.split(',')[1];
      
      const url = await veoService.generateVideo({
        prompt,
        imageBase64: base64Data,
        mimeType: imageFile.type,
        aspectRatio,
      });

      setVideoUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate video.");
    } finally {
      setIsGenerating(false);
      stopTimer();
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setVideoUrl(null);
    setError(null);
    setElapsedTime(0);
    setPrompt("A close-up video of the character speaking and making natural facial expressions.");
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      
      {/* Left Panel: Input & Config */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-6">
          <Film className="text-blue-400 w-6 h-6" />
          <h2 className="text-xl font-semibold text-white">Animation Studio</h2>
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2">Input Image</label>
          {!imagePreview ? (
            <div 
              className="border-2 border-dashed border-slate-700 rounded-xl p-10 flex flex-col items-center justify-center text-slate-500 hover:border-blue-500 hover:bg-slate-800/50 transition-all cursor-pointer group"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <UploadCloud className="w-12 h-12 mb-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
              <p className="text-center font-medium">Click or drag image here</p>
              <p className="text-xs text-slate-600 mt-2">Supports JPG, PNG</p>
              <input 
                id="fileInput" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-slate-700 group">
              <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              {!isGenerating && (
                <button 
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 bg-slate-900/80 hover:bg-red-900/90 text-white p-2 rounded-full transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Prompt Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2">Animation Prompt</label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-32"
            placeholder="Describe how the character should move..."
            disabled={isGenerating}
          />
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4 mb-8">
           <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Aspect Ratio</label>
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-700">
              <button 
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${aspectRatio === AspectRatio.PORTRAIT ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setAspectRatio(AspectRatio.PORTRAIT)}
                disabled={isGenerating}
              >
                9:16 (Portrait)
              </button>
              <button 
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${aspectRatio === AspectRatio.LANDSCAPE ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setAspectRatio(AspectRatio.LANDSCAPE)}
                disabled={isGenerating}
              >
                16:9 (Landscape)
              </button>
            </div>
           </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm flex items-center">
             <XCircle className="w-4 h-4 mr-2 shrink-0" />
             {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            onClick={handleGenerate} 
            disabled={!imageFile || isGenerating} 
            isLoading={isGenerating}
            className="flex-1"
          >
            {isGenerating ? `Generating (${formatTime(elapsedTime)})` : 'Generate Video'}
          </Button>
          <Button 
            onClick={handleReset} 
            variant="secondary"
            disabled={isGenerating}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Right Panel: Output */}
      <div className="flex flex-col h-full">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm flex-grow flex flex-col min-h-[500px]">
          <div className="flex items-center space-x-3 mb-6">
            <Video className="text-blue-400 w-6 h-6" />
            <h2 className="text-xl font-semibold text-white">Preview Output</h2>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative">
             {videoUrl ? (
               <video 
                controls 
                autoPlay 
                loop 
                src={videoUrl} 
                className="max-h-full max-w-full rounded-lg shadow-2xl"
               />
             ) : isGenerating ? (
               <div className="text-center p-8 animate-pulse">
                 <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
                 <h3 className="text-lg font-medium text-white mb-2">Generating Animation</h3>
                 <p className="text-slate-400 max-w-xs mx-auto">This usually takes about a minute. We are using the Veo 3.1 model to bring your image to life.</p>
                 <div className="mt-6 text-3xl font-mono text-blue-300">{formatTime(elapsedTime)}</div>
               </div>
             ) : (
               <div className="text-center p-8 text-slate-600">
                 <Film className="w-16 h-16 mx-auto mb-4 opacity-20" />
                 <p className="text-lg font-medium">No video generated yet</p>
                 <p className="text-sm mt-2">Upload an image and click Generate to start.</p>
               </div>
             )}
          </div>

          {videoUrl && (
            <div className="mt-6 flex justify-end">
              <a href={videoUrl} download="veo-animation.mp4" className="no-underline">
                <Button icon={<Download className="w-5 h-5" />}>
                  Download MP4
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VeoAnimator;