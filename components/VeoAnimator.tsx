import React, { useState, useRef } from 'react';
import { AspectRatio, Resolution, GenerationMode, ReferenceImage, VideoDuration, VeoModel, ReferenceImageType } from '../types';
import { veoService } from '../services/veoService';
import Button from './Button';
import { UploadCloud, Video, Film, Download, XCircle, Loader2, Plus, Trash2 } from './Icons';

interface VeoAnimatorProps {
  initialPrompt?: string | null;
}

const VeoAnimator: React.FC<VeoAnimatorProps> = ({ initialPrompt }) => {
  const [mode, setMode] = useState<GenerationMode>(GenerationMode.IMAGE_TO_VIDEO);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [prompt, setPrompt] = useState<string>(
    initialPrompt || "A close-up video of the character speaking and making natural facial expressions."
  );
  const [negativePrompt, setNegativePrompt] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.PORTRAIT);
  const [resolution, setResolution] = useState<Resolution>(Resolution.HD);
  const [duration, setDuration] = useState<VideoDuration>(VideoDuration.LONG);
  const [model, setModel] = useState<VeoModel>(VeoModel.VEO_3_1_FAST);
  const [seed, setSeed] = useState<string>("");
  const [enablePersonGeneration, setEnablePersonGeneration] = useState<boolean>(false);
  const [cameraMotion, setCameraMotion] = useState<string>("");
  const [cinematicStyle, setCinematicStyle] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (mode === GenerationMode.VIDEO_EXTENSION) {
      if (!file.type.startsWith('video/')) {
        setError("Please upload a valid video file (MP4, WebM).");
        return;
      }
      setVideoFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onload = (ev) => setVideoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      if (!file.type.startsWith('image/')) {
        setError("Please upload a valid image file (PNG or JPG).");
        return;
      }
      setImageFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleReferenceImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && referenceImages.length < 3) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError("Please upload a valid image file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const base64Data = dataUrl.split(',')[1];
        const newRef: ReferenceImage = {
          id: Date.now().toString(),
          imageBytes: base64Data,
          mimeType: file.type,
          type: ReferenceImageType.ASSET
        };
        setReferenceImages([...referenceImages, newRef]);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateReferenceImageType = (id: string, type: ReferenceImageType) => {
    setReferenceImages(referenceImages.map(img =>
      img.id === id ? { ...img, type } : img
    ));
  };

  const removeReferenceImage = (id: string) => {
    setReferenceImages(referenceImages.filter(img => img.id !== id));
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
    if (mode === GenerationMode.IMAGE_TO_VIDEO && (!imageFile || !imagePreview)) return;
    if (mode === GenerationMode.VIDEO_EXTENSION && (!videoFile || !videoPreview)) return;

    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    startTimer();

    try {
      const config: any = {
        mode,
        prompt,
        negativePrompt: negativePrompt || undefined,
        aspectRatio,
        resolution,
        duration,
        model,
        numberOfVideos: 1,
        cameraMotion: cameraMotion || undefined,
        cinematicStyle: cinematicStyle || undefined,
        referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
        seed: seed ? parseInt(seed) : undefined,
        enablePersonGeneration
      };

      if (mode === GenerationMode.IMAGE_TO_VIDEO && imagePreview) {
        const base64Data = imagePreview.split(',')[1];
        config.image = {
          imageBytes: base64Data,
          mimeType: imageFile!.type
        };
      }

      if (mode === GenerationMode.VIDEO_EXTENSION && videoPreview) {
        const base64Data = videoPreview.split(',')[1];
        config.videoBase64 = base64Data;
        config.videoMimeType = videoFile!.type;
      }

      const url = await veoService.generateVideo(config);
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
    setVideoFile(null);
    setVideoPreview(null);
    setReferenceImages([]);
    setVideoUrl(null);
    setError(null);
    setElapsedTime(0);
    setPrompt("A close-up video of the character speaking and making natural facial expressions.");
    setNegativePrompt("");
    setCameraMotion("");
    setCinematicStyle("");
  };

  const handleModeChange = (newMode: GenerationMode) => {
    setMode(newMode);
    setImageFile(null);
    setImagePreview(null);
    setVideoFile(null);
    setVideoPreview(null);
    setVideoUrl(null);
    setError(null);
  };

  const canGenerate = () => {
    if (mode === GenerationMode.TEXT_TO_VIDEO) return prompt.trim().length > 0;
    if (mode === GenerationMode.IMAGE_TO_VIDEO) return imageFile !== null;
    if (mode === GenerationMode.VIDEO_EXTENSION) return videoFile !== null;
    return false;
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-6">
          <Film className="text-blue-400 w-6 h-6" />
          <h2 className="text-xl font-semibold text-white">Generation Studio</h2>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-3">Generation Mode</label>
          <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-lg border border-slate-700">
            <button
              className={`py-2 px-3 rounded-md text-xs font-medium transition-all ${mode === GenerationMode.TEXT_TO_VIDEO ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              onClick={() => handleModeChange(GenerationMode.TEXT_TO_VIDEO)}
              disabled={isGenerating}
            >
              Text-to-Video
            </button>
            <button
              className={`py-2 px-3 rounded-md text-xs font-medium transition-all ${mode === GenerationMode.IMAGE_TO_VIDEO ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              onClick={() => handleModeChange(GenerationMode.IMAGE_TO_VIDEO)}
              disabled={isGenerating}
            >
              Image-to-Video
            </button>
            <button
              className={`py-2 px-3 rounded-md text-xs font-medium transition-all ${mode === GenerationMode.VIDEO_EXTENSION ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              onClick={() => handleModeChange(GenerationMode.VIDEO_EXTENSION)}
              disabled={isGenerating}
            >
              Extend Video
            </button>
          </div>
        </div>

        {mode === GenerationMode.IMAGE_TO_VIDEO && (
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
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
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
        )}

        {mode === GenerationMode.VIDEO_EXTENSION && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-2">Input Video</label>
            {!videoPreview ? (
              <div
                className="border-2 border-dashed border-slate-700 rounded-xl p-10 flex flex-col items-center justify-center text-slate-500 hover:border-blue-500 hover:bg-slate-800/50 transition-all cursor-pointer group"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById('videoInput')?.click()}
              >
                <Video className="w-12 h-12 mb-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                <p className="text-center font-medium">Click or drag video here</p>
                <p className="text-xs text-slate-600 mt-2">Supports MP4, WebM</p>
                <input
                  id="videoInput"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-700 group">
                <video src={videoPreview} className="w-full h-48 object-cover" controls />
                {!isGenerating && (
                  <button
                    onClick={() => { setVideoFile(null); setVideoPreview(null); }}
                    className="absolute top-2 right-2 bg-slate-900/80 hover:bg-red-900/90 text-white p-2 rounded-full transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-24"
            placeholder="Describe your video..."
            disabled={isGenerating}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2">Negative Prompt (Optional)</label>
          <textarea
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-16"
            placeholder="What to avoid..."
            disabled={isGenerating}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2">Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as VeoModel)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            disabled={isGenerating}
          >
            <option value={VeoModel.VEO_3_1_FAST}>Veo 3.1 Fast (Recommended)</option>
            <option value={VeoModel.VEO_3_1_PREVIEW}>Veo 3.1 Preview</option>
            <option value={VeoModel.VEO_3_FAST}>Veo 3 Fast</option>
            <option value={VeoModel.VEO_3_PREVIEW}>Veo 3 Preview</option>
            <option value={VeoModel.VEO_2}>Veo 2</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Camera Motion</label>
            <input
              type="text"
              value={cameraMotion}
              onChange={(e) => setCameraMotion(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g., pan left, zoom in"
              disabled={isGenerating}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Cinematic Style</label>
            <input
              type="text"
              value={cinematicStyle}
              onChange={(e) => setCinematicStyle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g., noir, vintage"
              disabled={isGenerating}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Seed (Optional)</label>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Random"
              disabled={isGenerating}
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enablePersonGeneration}
                onChange={(e) => setEnablePersonGeneration(e.target.checked)}
                className="w-4 h-4 bg-slate-950 border-slate-700 rounded focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              />
              <span className="text-sm text-slate-400">Allow People</span>
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2">Aspect Ratio</label>
          <div className="grid grid-cols-5 gap-2 bg-slate-950 p-1 rounded-lg border border-slate-700">
            <button
              className={`py-2 px-2 rounded-md text-xs font-medium transition-all ${aspectRatio === AspectRatio.PORTRAIT ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setAspectRatio(AspectRatio.PORTRAIT)}
              disabled={isGenerating}
            >
              9:16
            </button>
            <button
              className={`py-2 px-2 rounded-md text-xs font-medium transition-all ${aspectRatio === AspectRatio.SQUARE ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setAspectRatio(AspectRatio.SQUARE)}
              disabled={isGenerating}
            >
              1:1
            </button>
            <button
              className={`py-2 px-2 rounded-md text-xs font-medium transition-all ${aspectRatio === AspectRatio.LANDSCAPE ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setAspectRatio(AspectRatio.LANDSCAPE)}
              disabled={isGenerating}
            >
              16:9
            </button>
            <button
              className={`py-2 px-2 rounded-md text-xs font-medium transition-all ${aspectRatio === AspectRatio.ULTRAWIDE ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setAspectRatio(AspectRatio.ULTRAWIDE)}
              disabled={isGenerating}
            >
              21:9
            </button>
            <button
              className={`py-2 px-2 rounded-md text-xs font-medium transition-all ${aspectRatio === AspectRatio.CINEMA ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setAspectRatio(AspectRatio.CINEMA)}
              disabled={isGenerating}
            >
              Cinema
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Resolution</label>
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-700">
              <button
                className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all ${resolution === Resolution.HD ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setResolution(Resolution.HD)}
                disabled={isGenerating}
              >
                720p
              </button>
              <button
                className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all ${resolution === Resolution.FULL_HD ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setResolution(Resolution.FULL_HD)}
                disabled={isGenerating}
              >
                1080p
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Duration</label>
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-700">
              <button
                className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all ${duration === VideoDuration.SHORT ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setDuration(VideoDuration.SHORT)}
                disabled={isGenerating}
              >
                4s
              </button>
              <button
                className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all ${duration === VideoDuration.MEDIUM ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setDuration(VideoDuration.MEDIUM)}
                disabled={isGenerating}
              >
                6s
              </button>
              <button
                className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all ${duration === VideoDuration.LONG ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setDuration(VideoDuration.LONG)}
                disabled={isGenerating}
              >
                8s
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Reference Images (Up to 3)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {referenceImages.map((ref) => (
              <div key={ref.id} className="space-y-2">
                <div className="relative rounded-lg overflow-hidden border border-slate-700 aspect-square group">
                  <img
                    src={`data:${ref.mimeType};base64,${ref.imageBytes}`}
                    alt="Reference"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeReferenceImage(ref.id)}
                    className="absolute top-1 right-1 bg-slate-900/80 hover:bg-red-900/90 text-white p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    disabled={isGenerating}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <select
                  value={ref.type || ReferenceImageType.ASSET}
                  onChange={(e) => updateReferenceImageType(ref.id, e.target.value as ReferenceImageType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-slate-300"
                  disabled={isGenerating}
                >
                  <option value={ReferenceImageType.ASSET}>Asset</option>
                  <option value={ReferenceImageType.STYLE}>Style</option>
                  <option value={ReferenceImageType.CONTENT}>Content</option>
                </select>
              </div>
            ))}
            {referenceImages.length < 3 && (
              <button
                onClick={() => document.getElementById('refInput')?.click()}
                className="border-2 border-dashed border-slate-700 rounded-lg aspect-square flex items-center justify-center hover:border-blue-500 hover:bg-slate-800/50 transition-all cursor-pointer"
                disabled={isGenerating}
              >
                <Plus className="w-8 h-8 text-slate-600" />
                <input
                  id="refInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleReferenceImageChange}
                />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm flex items-center">
             <XCircle className="w-4 h-4 mr-2 shrink-0" />
             {error}
          </div>
        )}

        <div className="flex gap-4">
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate() || isGenerating}
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
                 <h3 className="text-lg font-medium text-white mb-2">Generating Video</h3>
                 <p className="text-slate-400 max-w-xs mx-auto">This usually takes about a minute. We are using the Veo 3.1 model.</p>
                 <div className="mt-6 text-3xl font-mono text-blue-300">{formatTime(elapsedTime)}</div>
               </div>
             ) : (
               <div className="text-center p-8 text-slate-600">
                 <Film className="w-16 h-16 mx-auto mb-4 opacity-20" />
                 <p className="text-lg font-medium">No video generated yet</p>
                 <p className="text-sm mt-2">Configure your settings and click Generate.</p>
               </div>
             )}
          </div>

          {videoUrl && (
            <div className="mt-6 flex justify-end">
              <a href={videoUrl} download="veo-video.mp4" className="no-underline">
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
