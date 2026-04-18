"use client";

import { useState, useRef, ChangeEvent } from 'react';
import { Camera, Sparkles, RefreshCcw, Loader2, Send, ImagePlus, X } from 'lucide-react';

export default function Home() {
  const [step, setStep] = useState<'idle' | 'loading_question' | 'answering' | 'loading_grade' | 'graded'>('idle');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [grade, setGrade] = useState<{ multiplier: string; explanation: string } | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);

  const fileInputRefCamera = useRef<HTMLInputElement>(null);
  const fileInputRefGallery = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access denied or error:", err);
      // Fallback to file picker if camera fails
      setCameraActive(false);
      fileInputRefCamera.current?.click();
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const takeSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg');
        stopCamera();
        processImage(base64);
      }
    }
  };

  const processImage = async (base64: string) => {
    setImageBase64(base64);
    setStep('loading_question');

    try {
      const res = await fetch('/api/notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 1, imageBase64: base64 }),
      });

      const data = await res.json();
      if (data.question) {
        setQuestion(data.question);
        setStep('answering');
      } else {
        console.error(data.error);
        setStep('idle');
      }
    } catch (err) {
      console.error(err);
      setStep('idle');
    }
  };

  const handleCapture = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setStep('loading_grade');

    try {
      const res = await fetch('/api/notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 2, question, answer }),
      });

      const data = await res.json();
      if (data.result) {
        // Parse the result
        // Expected format: "[3x]\nExplanation text here"
        const lines = data.result.trim().split('\n');
        let multiplier = lines[0].trim();
        // Fallback matching if Claude added extra text on first line
        if (!multiplier.match(/^\[\dx\]$/)) {
            const match = multiplier.match(/\[(.*?)\]/);
            multiplier = match ? match[0] : '[1x]';
        }
        const explanation = lines.slice(1).join('\n').trim() || data.result;

        setGrade({ multiplier, explanation });
        setStep('graded');
      } else {
        console.error(data.error);
        setStep('answering');
      }
    } catch (err) {
      console.error(err);
      setStep('answering');
    }
  };

  const handleReset = () => {
    setStep('idle');
    setImageBase64(null);
    setQuestion('');
    setAnswer('');
    setGrade(null);
    stopCamera();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center text-slate-800">
      {/* Mobile Wrapper */}
      <div className="w-full max-w-md mx-auto min-h-screen sm:min-h-[850px] bg-white sm:border-x sm:shadow-2xl relative flex flex-col overflow-hidden sm:rounded-2xl">
        
        {/* Header */}
        <header className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h1 className="text-xl font-medium tracking-tight text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Notice the World
          </h1>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-6 flex flex-col relative z-0">

          {/* Idle State */}
          {step === 'idle' && !cameraActive && (
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="space-y-4">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Break out of autopilot.</h2>
                <div className="bg-slate-100/80 rounded-2xl p-5 mx-auto max-w-sm border border-slate-200 text-left space-y-3">
                  <p className="text-slate-600 text-[15px] leading-relaxed">
                    Doomscrolling trains us to look without really seeing, keeping our minds trapped on digital autopilot.
                  </p>
                  <p className="text-slate-600 text-[15px] leading-relaxed">
                    Inspired by the core method in <span className="italic font-medium text-slate-800">The Art of Noticing</span>, this tool actively stretches your "noticing muscle". By pausing to intensely observe one mundane object, you reclaim your attention and find wonder hiding in plain sight.
                  </p>
                </div>
                <p className="text-slate-600 font-medium">
                  Snap a photo of an ordinary object near you.
                </p>
              </div>
              <div className="flex flex-row justify-center gap-6">
                <div className="flex flex-col items-center gap-3">
                  <button 
                    onClick={startCamera}
                    className="group relative w-24 h-24 sm:w-28 sm:h-28 bg-slate-900 rounded-full flex items-center justify-center shadow-xl hover:bg-slate-800 transition-all active:scale-95 touch-manipulation overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 scale-0 group-hover:scale-100 rounded-full transition-transform duration-300"></div>
                    <Camera className="w-10 h-10 text-white" />
                  </button>
                  <span className="text-sm font-medium text-slate-600">Camera</span>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <button 
                    onClick={() => fileInputRefGallery.current?.click()}
                    className="group relative w-24 h-24 sm:w-28 sm:h-28 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 touch-manipulation overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-slate-900/5 scale-0 group-hover:scale-100 rounded-full transition-transform duration-300"></div>
                    <ImagePlus className="w-10 h-10 text-slate-700" />
                  </button>
                  <span className="text-sm font-medium text-slate-600">Gallery</span>
                </div>
              </div>
              
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                ref={fileInputRefCamera}
                onChange={handleCapture}
                className="hidden"
              />
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRefGallery}
                onChange={handleCapture}
                className="hidden"
              />
            </div>
          )}

          {/* Camera View State */}
          {step === 'idle' && cameraActive && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 w-full animate-in fade-in duration-300">
               <div className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-slate-900 shadow-xl aspect-[3/4] flex items-center justify-center">
                  <video 
                    ref={videoRef} 
                    playsInline 
                    className="absolute inset-0 w-full h-full object-cover" 
                  />
                  <button 
                    onClick={stopCamera}
                    className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors z-10"
                  >
                    <X className="w-5 h-5"/>
                  </button>
               </div>
               <button 
                 onClick={takeSnapshot}
                 className="w-20 h-20 bg-indigo-500 rounded-full border-4 border-indigo-200 shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
               >
                 <div className="w-16 h-16 bg-white rounded-full"></div>
               </button>
               <p className="text-slate-500 font-medium text-lg mt-2">Take a photo</p>
            </div>
          )}

          {/* Loading States */}
          {(step === 'loading_question' || step === 'loading_grade') && (
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6 animate-in fade-in duration-500">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
              <p className="text-xl text-slate-600 font-medium animate-pulse">
                {step === 'loading_question' ? 'Observing...' : 'Evaluating detail...'}
              </p>
            </div>
          )}

          {/* Answering State */}
          {step === 'answering' && (
            <div className="flex-1 flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-500">
              
              {imageBase64 && (
                <div className="relative w-full h-48 mb-6 rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageBase64} alt="Captured object" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
              )}

              <div className="bg-indigo-50 rounded-2xl p-5 mb-6 border border-indigo-100 relative">
                <Sparkles className="w-5 h-5 text-indigo-400 absolute top-5 left-5" />
                <p className="text-indigo-900 text-lg font-medium pl-8 leading-snug">
                  {question}
                </p>
              </div>

              <div className="flex-1 flex flex-col space-y-4">
                <textarea 
                  className="w-full flex-1 min-h-[160px] p-5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none resize-none transition-all text-slate-800 text-lg placeholder:text-slate-400"
                  placeholder="Look closely. Type your observation here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                ></textarea>

                <button 
                  onClick={handleSubmitAnswer}
                  disabled={!answer.trim()}
                  className="w-full min-h-[56px] bg-slate-900 text-white rounded-2xl font-medium text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 touch-manipulation shadow-md"
                >
                  Submit Observation
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Graded State */}
          {step === 'graded' && grade && (
            <div className="flex-1 flex flex-col justify-center items-center text-center animate-in zoom-in-95 fade-in duration-500 py-8">
              
              <div className="w-full bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex flex-col items-center relative overflow-hidden mb-8">
                <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                
                <h3 className="text-sm uppercase tracking-widest font-semibold text-slate-400 mb-4">Your Multiplier</h3>
                
                <div className="text-6xl font-bold tracking-tighter text-slate-900 mb-6 drop-shadow-sm">
                  {grade.multiplier}
                </div>
                
                <div className="w-12 h-1 bg-slate-100 mb-6 rounded-full"></div>
                
                <p className="text-slate-600 text-lg leading-relaxed px-2">
                  {grade.explanation}
                </p>
              </div>

              <button 
                onClick={handleReset}
                className="w-full min-h-[56px] bg-transparent border-2 border-slate-200 text-slate-700 rounded-2xl font-medium text-lg flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] touch-manipulation"
              >
                <RefreshCcw className="w-5 h-5" />
                Notice Something Else
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
