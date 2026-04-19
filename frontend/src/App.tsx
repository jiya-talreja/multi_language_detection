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
      
      // Animate pairs in
      data.pairs.forEach((pair: DuplicatePair, i: number) => {
        setTimeout(() => {
          setPairs(prev => [...prev, pair]);
        }, i * 150);
      });
    } catch (error) {
      console.error("Error processing file:", error);
      setError((error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolve = useCallback((id: string, _action: 'keep' | 'remove') => {
    setPairs(prev => prev.filter(p => p.id !== id));
    setResolved(prev => prev + 1);
  }, []);

  return (
    <div className="h-screen w-full relative font-inter text-[#1a1a2e] overflow-hidden">
      <Background />

      {/* Main Container */}
      <div className="relative z-10 h-full w-full flex flex-col">
        <main className={`flex-1 flex flex-col w-full items-center overflow-y-auto ${(!hasFile || error || (isProcessing && !showNormalizationReview && !showChunkingReview && pairs.length === 0)) ? 'justify-center' : ''}`}>
          <div className={`w-full flex flex-col items-center ${(!hasFile || error || (isProcessing && !showNormalizationReview && !showChunkingReview && pairs.length === 0)) ? 'px-8 max-w-4xl' : `${(showNormalizationReview || showChunkingReview) ? 'max-w-none h-full' : 'px-8 max-w-[1240px] mx-auto pt-28 pb-20'}`}`}>

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
                <EmbeddingProgress totalChunks={chunkingData.length} />
            )}

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full flex-1 flex flex-col items-center justify-center"
              >
                <div className="py-16 px-10 bg-white/80 backdrop-blur-3xl border-2 border-white/60 rounded-[4rem] text-center max-w-lg shadow-[0_50px_100px_rgba(0,0,0,0.08)] relative overflow-hidden flex flex-col items-center gap-6">
                  <div className="absolute inset-0 bg-red-500/[0.01] pointer-events-none" />
                  
                  {/* Icon Section */}
                  <motion.div 
                    animate={{ y: [0, -6, 0] }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="text-red-500 text-5xl drop-shadow-xl"
                  >
                    ⚠️
                  </motion.div>
                  
                  {/* Text Section */}
                  <div className="flex flex-col gap-3 px-2 w-full">
                    <h3 className="text-[#1a1a2e] text-3xl font-light tracking-tight">Processing Error</h3>
                    <div className="px-8 py-4 bg-red-50/40 rounded-[2rem] border border-red-100/20 w-full max-w-md mx-auto">
                      <p className="text-red-600/90 text-sm md:text-base leading-relaxed">
                        {error}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Section */}
                  <div className="pt-2">
                    <button 
                      onClick={() => { setHasFile(false); setError(null); }}
                      className="group relative px-24 py-3.5 bg-[#1a1a2e] text-white rounded-full border-2 border-white/10 hover:border-white/30 hover:bg-black transition-all duration-300 text-base font-medium shadow-[0_15px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 active:scale-95"
                    >
                      <span className="relative z-10">Try Again</span>
                    </button>
                  </div>
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
                  className="w-full pt-32 pb-12 text-center"
                >
                   <h2 className="text-3xl font-light mb-4">No Duplicates Found</h2>
                   <p className="text-gray-500 mb-8">Your dataset looks completely clean!</p>
                   <button onClick={() => setHasFile(false)} className="px-6 py-2 bg-violet-100 text-violet-600 rounded-full hover:bg-violet-200 transition-colors">
                     Upload Another File
                   </button>
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
