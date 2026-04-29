
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { Camera, Video, X, RefreshCcw, Zap, Check, Trash2 } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File, type: 'image' | 'video') => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const {
    videoRef, isActive, isRecording, error, facing,
    startCamera, stopCamera, toggleFacing,
    takePhoto, startRecording, stopRecording,
  } = useCamera();

  const [preview, setPreview] = useState<{ url: string; blob: Blob; type: 'image' | 'video' } | null>(null);
  const [mode, setMode] = useState<'image' | 'video'>('image');
  const [isCounting, setIsCounting] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // Re-attach stream when returning from preview
  useEffect(() => {
    if (!preview && isActive && videoRef.current && !videoRef.current.srcObject) {
       // Check if we have a stream in useCamera (we'll need to expose it or just call startCamera again)
       // Calling startCamera again is safer to ensure fresh attachment
       startCamera(facing);
    }
  }, [preview, isActive, startCamera, videoRef, facing]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimer(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleCapture = async () => {
    if (mode === 'image') {
      try {
        const blob = await takePhoto();
        const url = URL.createObjectURL(blob);
        setPreview({ url, blob, type: 'image' });
      } catch (err) {
        console.error(err);
      }
    } else {
      if (isRecording) {
        const blob = await stopRecording();
        const url = URL.createObjectURL(blob);
        setPreview({ url, blob, type: 'video' });
      } else {
        startRecording();
      }
    }
  };

  const handleConfirm = () => {
    if (preview) {
      const ext = preview.type === 'image' ? 'jpg' : (preview.blob.type.includes('mp4') ? 'mp4' : 'webm');
      const file = new File([preview.blob], `capture-${Date.now()}.${ext}`, { type: preview.blob.type });
      onCapture(file, preview.type);
      onClose();
    }
  };

  const handleDiscard = () => {
    if (preview) {
      URL.revokeObjectURL(preview.url);
      setPreview(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center font-sans overflow-hidden animate-in fade-in duration-300">
      
      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
        <button 
          onClick={onClose}
          className="w-12 h-12 vision-pill bg-black/40 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-all"
        >
          <X className="w-6 h-6" />
        </button>

        {isRecording && (
          <div className="flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-full animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.5)]">
            <div className="w-2 h-2 rounded-full bg-white"></div>
            <span className="text-xs font-black text-white uppercase tracking-widest">{formatTime(timer)}</span>
          </div>
        )}

        {!preview && (
          <button 
            onClick={toggleFacing}
            className="w-12 h-12 vision-pill bg-black/40 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Viewfinder / Preview */}
      <div className="relative w-full h-full flex items-center justify-center bg-zinc-950 overflow-hidden">
        {preview ? (
          <div className="w-full h-full flex items-center justify-center">
            {preview.type === 'image' ? (
              <img src={preview.url} className="w-full h-full object-contain md:max-w-xl md:rounded-[2rem] shadow-2xl" alt="Preview" />
            ) : (
              <video src={preview.url} controls autoPlay className="w-full h-full object-contain md:max-w-xl md:rounded-[2rem] shadow-2xl" />
            )}
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
            {error && (
              <div className="absolute inset-0 flex items-center justify-center p-8 text-center bg-black/80 backdrop-blur-md">
                <p className="text-white text-sm font-medium">{error}</p>
              </div>
            )}
            
            {/* Guide Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute top-1/3 left-0 right-0 h-px bg-white"></div>
              <div className="absolute top-2/3 left-0 right-0 h-px bg-white"></div>
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white"></div>
              <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white"></div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-10 pb-16 flex flex-col items-center gap-8 z-50 bg-gradient-to-t from-black via-black/40 to-transparent">
        
        {preview ? (
          <div className="flex items-center gap-12 animate-in slide-in-from-bottom-8 duration-500">
            <button 
              onClick={handleDiscard}
              className="w-20 h-20 rounded-full bg-white/10 border border-white/20 text-white flex flex-col items-center justify-center hover:bg-red-500/20 hover:border-red-500/40 transition-all gap-1"
            >
              <Trash2 className="w-6 h-6 text-red-500" />
              <span className="text-[8px] font-black uppercase tracking-widest text-red-500">Repetir</span>
            </button>
            
            <button 
              onClick={handleConfirm}
              className="w-24 h-24 rounded-full bg-white text-slate-950 flex flex-col items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.4)] gap-1"
            >
              <Check className="w-8 h-8 text-slate-950" />
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-950">Confirmar</span>
            </button>
          </div>
        ) : (
          <>
            {/* Mode Selector */}
            <div className="flex items-center bg-white/5 backdrop-blur-3xl rounded-full p-1.5 border border-white/10">
              <button 
                onClick={() => setMode('image')}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${mode === 'image' ? 'bg-white !text-slate-950 shadow-xl' : '!text-white/40'}`}
              >
                <Camera className="w-3.5 h-3.5" /> FOTO
              </button>
              <button 
                onClick={() => setMode('video')}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${mode === 'video' ? 'bg-white !text-slate-950 shadow-xl' : '!text-white/40'}`}
              >
                <Video className="w-3.5 h-3.5" /> VIDEO
              </button>
            </div>

            {/* Capture Button */}
            <div className="relative group">
              <div className={`absolute inset-0 rounded-full blur-[30px] opacity-20 transition-all duration-700 ${mode === 'video' ? 'bg-red-500 group-hover:opacity-40' : 'bg-white group-hover:opacity-40'}`}></div>
              <button 
                onClick={handleCapture}
                disabled={!isActive}
                className={`relative w-24 h-24 rounded-full border-4 transition-all duration-300 flex items-center justify-center shadow-2xl active:scale-90
                  ${mode === 'video' 
                    ? (isRecording ? 'bg-white border-red-500 scale-110' : 'bg-white/10 border-white hover:bg-white/20') 
                    : 'bg-white border-white/20 hover:scale-105 shadow-white/10'}`}
              >
                {mode === 'video' ? (
                  isRecording ? (
                    <div className="w-8 h-8 bg-red-600 rounded-lg"></div>
                  ) : (
                    <div className="w-10 h-10 bg-red-600 rounded-full animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.5)]"></div>
                  )
                ) : (
                  <div className="w-16 h-16 rounded-full border border-black/10"></div>
                )}
              </button>
            </div>

            <p className="text-[9px] font-black !text-white/60 uppercase tracking-[0.3em] animate-pulse">
              Sistema de Captura en Alta Resolución Activo
            </p>
          </>
        )}
      </div>
    </div>
  );
}
