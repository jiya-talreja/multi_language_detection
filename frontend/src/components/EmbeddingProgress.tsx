import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface EmbeddingProgressProps {
  totalChunks: number;
}

const EmbeddingProgress: React.FC<EmbeddingProgressProps> = ({ totalChunks }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progress while waiting for the real backend response
    // The backend takes some time to embed, so we fake a log-style progress
    const interval = setInterval(() => {
      setProgress(prev => {
        // Slow down as it gets closer to 95%
        const increment = (95 - prev) * 0.05 + 0.1;
        if (prev >= 95) return 95;
        return prev + increment;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-3xl flex flex-col items-center justify-center min-h-[500px]">
      <div className="w-full bg-white/60 backdrop-blur-2xl border border-indigo-100/50 rounded-[2rem] p-12 shadow-2xl overflow-hidden relative">
        {/* Animated Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center mb-8 relative"
          >
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
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="url(#gradient-ai)">
              <defs>
                <linearGradient id="gradient-ai" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </motion.div>

          <h2 className="text-3xl font-light text-slate-800 tracking-tight mb-3">Semantic Embedding</h2>
          <p className="text-slate-500 text-center max-w-md mb-10 text-sm leading-relaxed">
            Converting {totalChunks.toLocaleString()} chunks into high-dimensional vectors using <span className="font-medium text-indigo-600">paraphrase-multilingual-MiniLM-L12-v2</span>.
          </p>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="w-full flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>Vectorizing Text</span>
            <span>{Math.floor(progress)}%</span>
          </div>

          {/* Fake Logs for visual effect */}
          <div className="w-full mt-8 bg-slate-900 rounded-xl p-4 font-mono text-[10px] text-indigo-200/70 h-32 overflow-hidden relative shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900 pointer-events-none z-10" />
            <motion.div 
              animate={{ y: [0, -200] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="flex flex-col gap-2"
            >
              {[...Array(20)].map((_, i) => (
                <div key={i} className="flex gap-4 opacity-70">
                  <span className="text-slate-500">[{new Date().toISOString().split('T')[1].slice(0,8)}]</span>
                  <span className="text-emerald-400">INFO:</span>
                  <span>Encoded batch {(i * 32).toString().padStart(4, '0')} - {(i * 32 + 32).toString().padStart(4, '0')} ... [Shape: 32x384]</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbeddingProgress;
