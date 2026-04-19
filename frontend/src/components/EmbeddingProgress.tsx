import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface EmbeddingProgressProps {
  totalChunks: number;
  isComplete: boolean;
  onDetectionStart: () => void;
}

const EmbeddingProgress: React.FC<EmbeddingProgressProps> = ({ totalChunks, isComplete, onDetectionStart }) => {
  const [progress, setProgress] = useState(0);
  const batchSize = 100;
  const totalBatches = Math.ceil(totalChunks / batchSize);
  const currentBatch = Math.min(totalBatches, Math.floor((progress / 100) * totalBatches) + 1);

  useEffect(() => {
    if (isComplete) {
       setProgress(100);
       return;
    }
    // Simulate progress while waiting for the real backend response
    // The backend takes some time to embed, so we fake a log-style progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) return prev;
        const step = Math.random() * 2;
        return prev + step;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isComplete]);

  return (
    <div className="w-full max-w-4xl flex flex-col items-center py-12 px-6">
      <div className="relative z-10 flex flex-col items-center gap-12 w-full">
        {/* Animated Icon — Floating */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-28 h-28 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center relative shadow-2xl"
        >
          {isComplete ? (
             <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               className="w-full h-full rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)]"
             >
               <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="white">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
               </svg>
             </motion.div>
          ) : (
            <>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-[3px] border-indigo-500 border-t-transparent border-l-transparent"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-full border-[2px] border-violet-400 border-b-transparent border-r-transparent"
              />
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </>
          )}
        </motion.div>

        {/* Title + description — Floating */}
        <div className="text-center space-y-4 max-w-2xl">
          <h2 className="text-6xl font-extralight text-slate-900 tracking-tight leading-tight">
            {isComplete ? 'Embedding Complete' : 'Semantic Embedding'}
          </h2>
          <p className="text-slate-500 text-xl font-light leading-relaxed">
            {isComplete 
              ? `${totalChunks.toLocaleString()} chunks have been vectorized and are ready for similarity detection.`
              : `Converting ${totalChunks.toLocaleString()} chunks into high-dimensional vectors.`
            }
          </p>
        </div>

        {/* Progress — Floating */}
        <div className="w-full max-w-xl space-y-5">
          <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 px-1">
            <span>{isComplete ? 'Ready for Analysis' : `Processing Batch ${currentBatch} / ${totalBatches}`}</span>
            <span>{Math.floor(progress)}%</span>
          </div>
          <div className="w-full bg-slate-900/5 h-2.5 rounded-full overflow-hidden shadow-inner backdrop-blur-sm">
            <motion.div 
              className={`h-full ${isComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'}`}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {isComplete ? (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onDetectionStart}
            className="px-20 py-5 bg-slate-900 text-white rounded-full text-xl font-bold flex items-center justify-center gap-5 hover:bg-black transition-all duration-300 shadow-[0_25px_50px_rgba(0,0,0,0.25)] hover:scale-105 active:scale-95 group border-2 border-white/20 tracking-tight min-w-[320px]"
          >
            Move to detection
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="group-hover:translate-x-2 transition-transform duration-300">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5-5 5M6 12h12" />
            </svg>
          </motion.button>
        ) : (
          /* Fake Logs for visual effect — Subtle floating */
          <div className="w-full max-w-lg mt-8 font-mono text-[10px] text-slate-400/40 h-24 overflow-hidden relative text-center">
            <motion.div 
              animate={{ y: [0, -200] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="flex flex-col gap-3"
            >
              {[...Array(10)].map((_, i) => (
                <div key={i}>OPTIMIZING VECTOR SPACE BATCH {Math.min(currentBatch + i, totalBatches)} ... OK</div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmbeddingProgress;
