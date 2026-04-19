import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Background from './components/Background';
import Header from './components/Header';
import DropZone from './components/DropZone';
import ComparisonEngine from './components/ComparisonEngine';
import NormalizationReview from './components/NormalizationReview';
import ChunkingReview from './components/ChunkingReview';
import EmbeddingProgress from './components/EmbeddingProgress';
import type { DuplicatePair } from './components/DuplicatePairCard';

// ─── Demo seed data ─────────────────────────────────────────────────────────
const DEMO_PAIRS: DuplicatePair[] = [
  {
    id: 'pair-1',
    similarity: 0.94,
    recordA: {
      id: '001',
      name: 'محمد علي حسن',
      email: 'mhassan@example.com',
      phone: '+966 50 123 4567',
      language: 'Arabic',
      languageCode: 'ar',
    },
    recordB: {
      id: '002',
      name: 'Mohammed Ali Hassan',
      email: 'm.hassan@example.com',
      phone: '+966501234567',
      language: 'English',
      languageCode: 'en',
    },
  },
  {
    id: 'pair-2',
    similarity: 0.87,
    recordA: {
      id: '018',
      name: 'Александра Петрова',
      email: 'a.petrova@mail.ru',
      text: 'Клиент обратился с жалобой на качество обслуживания в отделении.',
      language: 'Russian',
      languageCode: 'ru',
    },
    recordB: {
      id: '019',
      name: 'Alexandra Petrova',
      email: 'alexandra.p@gmail.com',
      text: 'Customer complained about service quality at the branch.',
      language: 'English',
      languageCode: 'en',
    },
  },
  {
    id: 'pair-3',
    similarity: 0.78,
    recordA: {
      id: '045',
      name: 'Jean-Pierre Dubois',
      email: 'jp.dubois@orange.fr',
      phone: '+33 6 12 34 56 78',
      language: 'French',
      languageCode: 'fr',
    },
    recordB: {
      id: '046',
      name: 'Juan Pedro Dubois',
      email: 'jpdubois@gmail.com',
      phone: '+34 612 345 678',
      language: 'Spanish',
      languageCode: 'es',
    },
  },
];

function App() {
  const [hasFile, setHasFile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pairs, setPairs] = useState<DuplicatePair[]>([]);
  const [resolved, setResolved] = useState(0);
  const [normalizationData, setNormalizationData] = useState<any[]>([]);
  const [showNormalizationReview, setShowNormalizationReview] = useState(false);
  const [chunkingData, setChunkingData] = useState<any[]>([]);
  const [showChunkingReview, setShowChunkingReview] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEmbeddingComplete, setIsEmbeddingComplete] = useState(false);
  const [storedPairs, setStoredPairs] = useState<DuplicatePair[]>([]);

  const handleFileAccepted = useCallback(async (file: File) => {
    setHasFile(true);
    setIsProcessing(true);
    setPairs([]);
    setResolved(0);
    setError(null);
    setCurrentFile(file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Step 1: Just Normalize to show the results to the user
      const response = await fetch("http://localhost:8000/normalize", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to normalize file");
      }

      const data = await response.json();
      setNormalizationData(data.data);
      setShowNormalizationReview(true);
    } catch (error) {
      console.error("Error normalizing file:", error);
      setError((error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleMoveToChunking = async () => {
    setIsProcessing(true);
    setShowNormalizationReview(false);

    try {
      const response = await fetch("http://localhost:8000/chunk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizationData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to chunk data");
      }

      const data = await response.json();
      setChunkingData(data.data);
      setShowChunkingReview(true);
    } catch (error) {
      console.error("Error chunking data:", error);
      setError((error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartDetection = async () => {
    if (!currentFile) return;
    
    setIsProcessing(true);
    setShowChunkingReview(false);
    setIsEmbeddingComplete(false);
    setStoredPairs([]);

    const formData = new FormData();
    formData.append("file", currentFile);
    formData.append("eps", "0.3");

    try {
      const response = await fetch("http://localhost:8000/detect", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to process file");
      }

      const data = await response.json();
      setStoredPairs(data.pairs);
      
      // Simulate that embedding is done after the backend returns
      // (In a real app, you might have real-time progress from backend)
      setTimeout(() => {
        setIsEmbeddingComplete(true);
      }, 500);
      
    } catch (error) {
      console.error("Error processing file:", error);
      setError((error as Error).message);
      setIsProcessing(false);
    }
  };

  const handleFinalDetection = () => {
    setIsProcessing(false);
    // Animate pairs in
    storedPairs.forEach((pair: DuplicatePair, i: number) => {
      setTimeout(() => {
        setPairs(prev => [...prev, pair]);
      }, i * 150);
    });
  };

  const handleResolve = useCallback((id: string, _action: 'keep' | 'remove') => {
    setPairs(prev => prev.filter(p => p.id !== id));
    setResolved(prev => prev + 1);
  }, []);

  return (
    <div className="h-screen w-full relative font-inter text-[#1a1a2e] overflow-hidden">
      <Background />

      {/* Main Container */}
      <div className="relative z-10 h-full w-full overflow-y-auto">
        <main className="min-h-full w-full flex flex-col items-center justify-center py-12">
          <div className={`w-full flex flex-col items-center ${(!hasFile || error || (isProcessing && !showNormalizationReview && !showChunkingReview && pairs.length === 0)) ? 'px-8 max-w-4xl' : `${(showNormalizationReview || showChunkingReview) ? 'max-w-none w-full h-full' : 'px-8 max-w-[1240px] mx-auto pt-28 pb-20'}`}`}>

            {/* 1 & 2. Hero and Upload (Hidden during processing) */}
            <AnimatePresence mode="wait">
              {!hasFile && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                  className="w-full flex flex-col items-center"
                >
                  <div className="text-center mb-56">
                    <h1 className="text-5xl md:text-7xl font-extralight tracking-tight mb-6 leading-[1.05]">
                      Detect Duplicates<br />
                      <span className="font-medium bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                        Across Many Languages
                      </span>
                    </h1>
                  </div>

                  <div className="w-full max-w-2xl">
                    <DropZone onFileAccepted={handleFileAccepted} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading State for Normalization */}
            {hasFile && isProcessing && !showNormalizationReview && !showChunkingReview && pairs.length === 0 && chunkingData.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center gap-6"
                >
                 <div className="relative w-16 h-16 flex items-center justify-center">
                   <div className="absolute inset-0 rounded-full border-2 border-violet-200/20"></div>
                   <div className="absolute inset-0 rounded-full border-t-2 border-violet-500 animate-spin"></div>
                   <span className="text-violet-500 font-bold text-lg">AI</span>
                 </div>
                 <p className="text-[#1a1a2e]/60 tracking-widest text-sm uppercase">
                    Standardizing your data format...
                 </p>
               </motion.div>
            )}

            {/* Loading State for Embedding */}
            {hasFile && isProcessing && !showChunkingReview && pairs.length === 0 && chunkingData.length > 0 && (
                <EmbeddingProgress 
                  totalChunks={chunkingData.length} 
                  isComplete={isEmbeddingComplete}
                  onDetectionStart={handleFinalDetection}
                />
            )}

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex flex-col items-center justify-center gap-12"
              >
                {/* Icon Section */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-32 h-32 rounded-full bg-red-500/10 backdrop-blur-md border border-red-500/20 flex items-center justify-center shadow-[0_0_60px_rgba(239,68,68,0.15)]"
                >
                  <span className="text-6xl drop-shadow-2xl">⚠️</span>
                </motion.div>
                
                {/* Text Section */}
                <div className="flex flex-col items-center gap-10 max-w-4xl text-center">
                  <h3 className="text-6xl font-extralight text-slate-900 tracking-tight leading-tight">Processing Error</h3>
                  <div className="px-20 py-7 bg-red-500/5 backdrop-blur-md rounded-full border border-red-500/10 shadow-[0_15px_35px_rgba(239,68,68,0.06)] min-w-[600px] flex justify-center items-center">
                    <p className="text-red-600 text-xl font-medium tracking-tight">
                      {error}
                    </p>
                  </div>
                </div>
                
                {/* Action Section */}
                <div className="pt-4">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setHasFile(false); setError(null); }}
                    className="px-20 py-5 bg-slate-900 text-white rounded-full text-xl font-bold flex items-center justify-center gap-5 hover:bg-black transition-all duration-300 shadow-[0_25px_50px_rgba(0,0,0,0.25)] group border-2 border-white/20 tracking-tight min-w-[320px]"
                  >
                    <span className="relative z-10">Try Again</span>
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="group-hover:rotate-180 transition-transform duration-500">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Normalization Review */}
            <AnimatePresence>
              {hasFile && !isProcessing && showNormalizationReview && (
                <NormalizationReview 
                  data={normalizationData} 
                  filename={currentFile?.name || "Uploaded File"} 
                  onContinue={handleMoveToChunking}
                  onCancel={() => { setHasFile(false); setShowNormalizationReview(false); setNormalizationData([]); }}
                />
              )}
            </AnimatePresence>

            {/* Chunking Review */}
            <AnimatePresence>
              {hasFile && !isProcessing && showChunkingReview && (
                <ChunkingReview
                  data={chunkingData}
                  originalCount={normalizationData.length}
                  onContinue={handleStartDetection}
                  onBack={() => { setShowChunkingReview(false); setShowNormalizationReview(true); }}
                />
              )}
            </AnimatePresence>

            {/* 3. Comparison Engine */}
            <AnimatePresence mode="wait">
              {hasFile && !isProcessing && pairs.length > 0 && (
                <motion.div
                  key="engine"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full pt-24 pb-12"
                >
                  <ComparisonEngine
                    pairs={pairs}
                    resolved={resolved}
                    onResolve={handleResolve}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Empty State / No Duplicates */}
            {hasFile && !isProcessing && !showNormalizationReview && !showChunkingReview && pairs.length === 0 && resolved === 0 && !error && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full flex flex-col items-center justify-center gap-12 text-center"
                >
                   {/* Success Icon */}
                   <motion.div 
                     animate={{ y: [0, -10, 0] }} 
                     transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                     className="w-32 h-32 rounded-full bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.15)]"
                   >
                     <svg width="60" height="60" fill="none" viewBox="0 0 24 24" stroke="#10b981">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                   </motion.div>

                   <div className="space-y-4">
                     <h2 className="text-6xl font-extralight text-slate-900 tracking-tight">No Duplicates Found</h2>
                     <p className="text-slate-500 text-xl font-light">Your dataset looks completely clean!</p>
                   </div>

                   <motion.button 
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={() => setHasFile(false)} 
                     className="px-20 py-5 bg-slate-900 text-white rounded-full text-xl font-bold flex items-center justify-center gap-5 hover:bg-black transition-all duration-300 shadow-[0_25px_50px_rgba(0,0,0,0.25)] group border-2 border-white/20 tracking-tight min-w-[320px]"
                   >
                     Upload Another File
                     <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="group-hover:translate-x-2 transition-transform duration-300">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                     </svg>
                   </motion.button>
                </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Ambient glow footer */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/40 to-transparent pointer-events-none z-0" />
    </div>
  );
}

export default App;
