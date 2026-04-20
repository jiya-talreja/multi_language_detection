import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Background from './components/Background';
import DropZone from './components/DropZone';
import ComparisonEngine from './components/ComparisonEngine';
import NormalizationReview from './components/NormalizationReview';
import ChunkingReview from './components/ChunkingReview';
import EmbeddingProgress from './components/EmbeddingProgress';
import type { DuplicateCluster } from './components/DuplicateGroupCard';

function App() {
  const [hasFile, setHasFile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clusters, setClusters] = useState<DuplicateCluster[]>([]);
  const [resolved, setResolved] = useState(0);
  const [normalizationData, setNormalizationData] = useState<any[]>([]);
  const [showNormalizationReview, setShowNormalizationReview] = useState(false);
  const [chunkingData, setChunkingData] = useState<any[]>([]);
  const [showChunkingReview, setShowChunkingReview] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEmbeddingComplete, setIsEmbeddingComplete] = useState(false);
  const [storedClusters, setStoredClusters] = useState<DuplicateCluster[]>([]);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [resolvedDecisions, setResolvedDecisions] = useState<Record<string, {action: string}>>({});

  const handleFileAccepted = useCallback(async (file: File) => {
    setHasFile(true);
    setIsProcessing(true);
    setClusters([]);
    setResolved(0);
    setError(null);
    setCurrentFile(file);

    const formData = new FormData();
    formData.append("file", file);

    try {
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
    setStoredClusters([]);

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
      setStoredClusters(data.clusters);
      setTimeout(() => setIsEmbeddingComplete(true), 500);
    } catch (error) {
      console.error("Error processing file:", error);
      setError((error as Error).message);
      setIsProcessing(false);
    }
  };

  const handleFinalDetection = () => {
    setIsProcessing(false);
    storedClusters.forEach((cluster, i) => {
      setTimeout(() => {
        setClusters(prev => [...prev, cluster]);
      }, i * 150);
    });
  };

  const handleResolve = useCallback((id: string, action: 'keep' | 'remove' | 'merge') => {
    setResolvedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setResolvedDecisions(prev => ({...prev, [id]: {action}}));
    setResolved(prev => prev + 1);
  }, []);

  const handleRedo = useCallback((id: string) => {
    setResolvedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setResolvedDecisions(prev => {
      const next = {...prev};
      delete next[id];
      return next;
    });
    setResolved(prev => Math.max(0, prev - 1));
  }, []);

  const showResults = hasFile && !isProcessing && (clusters.length > 0 || resolved > 0) && !showNormalizationReview && !showChunkingReview;

  return (
    <div className={`h-screen w-full relative font-inter text-[#1a1a2e] overflow-hidden transition-colors duration-1000 ${showResults ? 'bg-grid' : ''}`}>
      {!showResults && <Background />}

      <div className="relative z-10 h-full w-full overflow-y-auto">
        <main className="min-h-full w-full flex flex-col items-center justify-center py-12">
          <div className={`w-full flex flex-col items-center ${(!hasFile || error || (isProcessing && !showNormalizationReview && !showChunkingReview && clusters.length === 0)) ? 'px-8 max-w-4xl' : `${(showNormalizationReview || showChunkingReview) ? 'max-w-none w-full h-full' : 'px-8 max-w-[1240px] mx-auto pt-28 pb-20'}`}`}>

            <AnimatePresence mode="wait">
              {!hasFile && (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }} className="w-full flex flex-col items-center">
                  <div className="text-center mb-56">
                    <h1 className="text-5xl md:text-7xl font-extralight tracking-tight mb-6 leading-[1.05]">
                      Detect Duplicates<br />
                      <span className="font-medium bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">Across Many Languages</span>
                    </h1>
                  </div>
                  <div className="w-full max-w-2xl">
                    <DropZone onFileAccepted={handleFileAccepted} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {hasFile && isProcessing && !showNormalizationReview && !showChunkingReview && clusters.length === 0 && chunkingData.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-6">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-violet-200/20"></div>
                    <div className="absolute inset-0 rounded-full border-t-2 border-violet-500 animate-spin"></div>
                    <span className="text-violet-500 font-bold text-lg">AI</span>
                  </div>
                  <p className="text-[#1a1a2e]/60 tracking-widest text-sm uppercase">Standardizing your data format...</p>
                </div>
            )}

            {hasFile && isProcessing && !showChunkingReview && clusters.length === 0 && chunkingData.length > 0 && (
                <EmbeddingProgress totalChunks={chunkingData.length} isComplete={isEmbeddingComplete} onDetectionStart={handleFinalDetection} />
            )}

            {error && (
              <div className="w-full flex flex-col items-center justify-center gap-12">
                <h3 className="text-6xl font-extralight text-slate-900 tracking-tight">Processing Error</h3>
                <div className="px-20 py-7 bg-red-500/5 rounded-full border border-red-500/10 min-w-[600px] text-center">
                  <p className="text-red-600 text-xl font-medium">{error}</p>
                </div>
                <button onClick={() => { setHasFile(false); setError(null); }} className="px-20 py-5 bg-slate-900 text-white rounded-full text-xl font-bold">Try Again</button>
              </div>
            )}

            <AnimatePresence>
              {hasFile && !isProcessing && showNormalizationReview && (
                <NormalizationReview data={normalizationData} filename={currentFile?.name || "Uploaded File"} onContinue={handleMoveToChunking} onCancel={() => { setHasFile(false); setShowNormalizationReview(false); }} />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {hasFile && !isProcessing && showChunkingReview && (
                <ChunkingReview data={chunkingData} originalCount={normalizationData.length} onContinue={handleStartDetection} onBack={() => { setShowChunkingReview(false); setShowNormalizationReview(true); }} />
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {hasFile && !isProcessing && (clusters.length > 0 || resolved > 0) && (
                <motion.div key="engine" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="w-full pt-24 pb-12">
                  <ComparisonEngine 
                    clusters={clusters} 
                    resolved={resolved} 
                    resolvedIds={resolvedIds}
                    resolvedDecisions={resolvedDecisions}
                    onResolve={handleResolve} 
                    onRedo={handleRedo}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            {hasFile && !isProcessing && !showNormalizationReview && !showChunkingReview && clusters.length === 0 && resolved > 0 && (
                <div className="flex flex-col items-center justify-center gap-6 text-center py-20">
                   <h2 className="text-6xl font-extralight text-slate-900 tracking-tight">Database Sanitized</h2>
                   <p className="text-slate-500 text-xl font-light">All detected duplicate groups resolved.</p>
                   <button onClick={() => setHasFile(false)} className="px-12 py-4 bg-slate-900 text-white rounded-full font-bold">Upload Another File</button>
                </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
