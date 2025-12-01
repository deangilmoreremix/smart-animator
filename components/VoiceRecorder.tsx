import React, { useState, useRef, useEffect } from 'react';
import { openaiRealtimeService } from '../services/openai/realtimeService';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import { Mic, MicOff, Square, Play, Pause } from './Icons';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  onRecordingComplete?: (audioBlob: Blob, transcript: string, duration: number) => void;
  mode?: 'simple' | 'realtime';
  conversationType?: 'video_creation' | 'script_editing' | 'analytics_query' | 'campaign_setup';
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscript,
  onRecordingComplete,
  mode = 'simple',
  conversationType = 'video_creation'
}) => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());

        if (chunksRef.current.length > 0) {
          await processRecording(audioBlob);
        }
      };

      if (mode === 'realtime' && user) {
        await openaiRealtimeService.startSession(user.id, conversationType);
        await openaiRealtimeService.connectWebSocket('session_' + Date.now());
      }

      mediaRecorder.start(1000);
      setIsRecording(true);
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const processRecording = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');

      const response = await fetch('/.netlify/functions/openai-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: 'audio/transcriptions',
          data: {
            file: audioBlob,
            model: 'whisper-1'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const result = await response.json();
      const transcribedText = result.text;

      setTranscript(transcribedText);
      onTranscript(transcribedText);

      if (onRecordingComplete && user) {
        await openaiRealtimeService.saveVoiceRecording(
          audioBlob,
          transcribedText,
          duration,
          user.id
        );
        onRecordingComplete(audioBlob, transcribedText, duration);
      }

      if (mode === 'realtime') {
        await openaiRealtimeService.endSession();
      }
    } catch (error) {
      console.error('Error processing recording:', error);
      alert('Failed to process recording. Please try again.');
    } finally {
      setIsProcessing(false);
      setDuration(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl border-2 border-gray-200">
      <div className="text-center">
        <div className="text-4xl font-bold text-gray-900 mb-2">
          {formatTime(duration)}
        </div>
        {transcript && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg max-w-md">
            <p className="text-sm text-gray-700">{transcript}</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            disabled={isProcessing}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all transform hover:scale-105"
          >
            <Mic className="w-6 h-6 mr-2" />
            Start Recording
          </Button>
        ) : (
          <>
            {isPaused ? (
              <Button
                onClick={resumeRecording}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
              >
                <Play className="w-5 h-5 mr-2" />
                Resume
              </Button>
            ) : (
              <Button
                onClick={pauseRecording}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full"
              >
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </Button>
            )}

            <Button
              onClick={stopRecording}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-full"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop
            </Button>
          </>
        )}
      </div>

      {isProcessing && (
        <div className="text-sm text-gray-600 animate-pulse">
          Processing recording...
        </div>
      )}

      <div className="text-xs text-gray-500 max-w-md text-center">
        {mode === 'realtime'
          ? 'Voice will be transcribed and sent to AI in real-time'
          : 'Recording will be transcribed after you stop'
        }
      </div>
    </div>
  );
};

export default VoiceRecorder;
