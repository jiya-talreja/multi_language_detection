import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText } from 'lucide-react';

interface DropZoneProps {
  onFileAccepted: (file: File) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ onFileAccepted }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        onFileAccepted(dropped);
      }, 1400);
    }
  }, [onFileAccepted]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) {
      setFile(picked);
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        onFileAccepted(picked);
      }, 1400);
    }
  }, [onFileAccepted]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Drop Slot */}
      <motion.label
        htmlFor="file-input"
        className={`drop-slot glass-heavy rounded-3xl flex flex-col items-center justify-center cursor-pointer relative overflow-hidden w-full ${isDragging ? 'dragging' : ''}`}
        style={{ minHeight: 420 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.99 }}
      >
        <input id="file-input" type="file" className="hidden" onChange={handleFileInput} accept=".csv,.tsv,.xlsx,.xls,.json,.xml" />

        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-10 px-12 text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-violet-500/5 border border-violet-500/10 flex items-center justify-center shadow-inner">
                <Upload size={32} className="text-violet-500" strokeWidth={1} />
              </div>

              <div>
                <p className="text-2xl font-light text-gray-700 tracking-tight">
                  {isDragging ? 'Release to upload' : <><span className="font-medium text-violet-600">Drop your file here</span><br /><span className="text-lg opacity-60">or click to browse your system</span></>}
                </p>
                <p className="text-sm text-gray-400 mt-4 tracking-widest font-light uppercase">
                  XLSX, CSV, JSON, TSV • Up to 50MB
                </p>
              </div>

              <div className="flex gap-3 flex-wrap justify-center mt-4">
                {['CSV', 'TSV', 'XLSX', 'JSON', 'XML'].map(fmt => (
                  <span key={fmt} className="text-[0.7rem] font-semibold tracking-widest px-4 py-1.5 rounded-lg bg-white/50 border border-white/80 shadow-sm text-gray-500 uppercase">
                    {fmt}
                  </span>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 px-10"
            >
              <div className="w-14 h-14 rounded-2xl bg-violet-600/10 border border-violet-600/20 flex items-center justify-center">
                <FileText size={24} className="text-violet-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-800">{file.name}</p>
                <p className="text-[0.7rem] text-gray-400 mt-1 uppercase tracking-tight">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              
              {isProcessing && (
                <div className="flex gap-1.5 mt-2">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-violet-500"
                      animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gloss overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      </motion.label>
    </div>
  );
};

export default DropZone;
