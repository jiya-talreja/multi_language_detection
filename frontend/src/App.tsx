import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Background from './components/Background';
import Header from './components/Header';
import DropZone from './components/DropZone';
import ComparisonEngine from './components/ComparisonEngine';
import NormalizationReview from './components/NormalizationReview';
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

  const handleStartDetection = async () => {
    if (!currentFile) return;
    
    setIsProcessing(true);
    setShowNormalizationReview(false);

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
        {!showNormalizationReview && <Header />}

        <main className={`flex-1 flex flex-col w-full overflow-y-auto ${!hasFile ? 'justify-center items-center' : ''}`}>
          <div className={`w-full flex flex-col items-center ${!hasFile ? 'px-8 max-w-4xl' : `${showNormalizationReview ? 'max-w-none h-full' : 'px-8 max-w-[1240px] mx-auto pt-28 pb-20'}`}`}>

            {/* 1 & 2. Hero and Upload (Hidden during processing) */}
            <AnimatePresence mode="wait">
              {!hasFile && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                  className="w-full flex flex-col items-center"
                >
                  <div className="text-center mb-56 pt-20">
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

            {/* Loading State */}
            {hasFile && isProcessing && !showNormalizationReview && pairs.length === 0 && (
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="flex flex-col items-center justify-center mt-32 gap-6"
               >
                 <div className="relative w-16 h-16 flex items-center justify-center">
                   <div className="absolute inset-0 rounded-full border-2 border-violet-200/20"></div>
                   <div className="absolute inset-0 rounded-full border-t-2 border-violet-500 animate-spin"></div>
                   <span className="text-violet-500 font-bold text-lg">AI</span>
                 </div>
                 <p className="text-[#1a1a2e]/60 tracking-widest text-sm uppercase">
                    {normalizationData.length > 0 ? "Analyzing semantics across languages..." : "Standardizing your data format..."}
                 </p>
               </motion.div>
            )}

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-20 p-6 bg-red-50 border border-red-100 rounded-2xl text-center max-w-lg"
              >
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <h3 className="text-red-800 font-semibold mb-2">Processing Error</h3>
                <p className="text-red-600/70 text-sm mb-6">{error}</p>
                <button 
                  onClick={() => { setHasFile(false); setError(null); }}
                  className="px-6 py-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  Try Again
                </button>
              </motion.div>
            )}

            {/* Normalization Review */}
            <AnimatePresence>
              {hasFile && !isProcessing && showNormalizationReview && (
                <NormalizationReview 
                  data={normalizationData} 
                  filename={currentFile?.name || "Uploaded File"} 
                  onContinue={handleStartDetection}
                  onCancel={() => { setHasFile(false); setShowNormalizationReview(false); setNormalizationData([]); }}
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
            {hasFile && !isProcessing && !showNormalizationReview && pairs.length === 0 && resolved === 0 && !error && (
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
