import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Background from './components/Background';
import Header from './components/Header';
import DropZone from './components/DropZone';
import ComparisonEngine from './components/ComparisonEngine';
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
  const [pairs, setPairs] = useState<DuplicatePair[]>([]);
  const [resolved, setResolved] = useState(0);

  const handleFileAccepted = useCallback((_file: File) => {
    setHasFile(true);
    // Animate pairs in
    DEMO_PAIRS.forEach((pair, i) => {
      setTimeout(() => {
        setPairs(prev => [...prev, pair]);
      }, i * 300);
    });
  }, []);

  const handleResolve = useCallback((id: string, _action: 'keep' | 'remove') => {
    setPairs(prev => prev.filter(p => p.id !== id));
    setResolved(prev => prev + 1);
  }, []);

  return (
    <div className="h-screen w-full relative font-inter text-[#1a1a2e] overflow-hidden">
      <Background />

      {/* Main Container */}
      <div className="relative z-10 h-full w-full flex flex-col">
        <Header />

        <main className={`flex-1 flex flex-col w-full overflow-y-auto ${!hasFile ? 'justify-center items-center' : 'pt-20 pb-24'}`}>
          <div className={`w-full px-6 flex flex-col items-center ${!hasFile ? 'max-w-4xl' : 'max-w-[1200px] mx-auto'}`}>

            {/* 1. Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-16 pt-16"
            >
              <h1 className="text-3xl md:text-5xl font-extralight tracking-tight mb-7 leading-tight">
                <span className="block">Detect Duplicates</span>
                <span className="block font-medium bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                  Across Many Languages
                </span>
              </h1>
            </motion.div>

            {/* 2. Upload Section */}
            <div className="w-full max-w-2xl">
              <DropZone onFileAccepted={handleFileAccepted} />
            </div>

            {/* 3. Comparison Engine */}
            <AnimatePresence mode="wait">
              {hasFile && (
                <motion.div
                  key="engine"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full mt-12"
                >
                  <ComparisonEngine
                    pairs={pairs}
                    resolved={resolved}
                    onResolve={handleResolve}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Ambient glow footer */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/40 to-transparent pointer-events-none z-0" />
    </div>
  );
}

export default App;
