import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DuplicatePairCard from './DuplicatePairCard';
import type { DuplicatePair } from './DuplicatePairCard';
import { Layers, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

interface ComparisonEngineProps {
  pairs: DuplicatePair[];
  resolved: number;
  resolvedIds: Set<string>;
  onResolve: (id: string, action: 'keep' | 'remove') => void;
  onRedo: (id: string) => void;
}

const StatBox: React.FC<{ label: string; value: string | number }> = ({
  label, value
}) => (
  <div className="relative px-20 py-12 flex flex-col items-center gap-4">
    <span className="text-6xl font-extralight text-slate-900 tracking-tighter leading-none">{value}</span>
    <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] whitespace-nowrap">{label}</span>
  </div>
);

const ComparisonEngine: React.FC<ComparisonEngineProps> = ({ pairs, resolved, resolvedIds, onResolve, onRedo }) => {
  const total = pairs.length;
  const avgSimilarity = total > 0
    ? (pairs.reduce((s, p) => s + p.similarity, 0) / total * 100).toFixed(0)
    : 0;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-6xl mx-auto space-y-24 pb-32"
    >
      {/* Header & Stats */}
      <div className="flex flex-col items-center gap-16 pt-12">
        <div className="text-center">
          <h2 className="text-6xl font-extralight text-slate-900 tracking-tighter">
            Detected <span className="font-semibold italic">Duplicates</span>
          </h2>
        </div>

        <div className="flex items-center justify-center gap-8 bg-slate-900/[0.02] backdrop-blur-sm rounded-full border border-slate-900/5 px-8">
          <StatBox 
            label="Pairs Detected" 
            value={total} 
          />
          <div className="w-px h-12 bg-slate-900/10" />
          <StatBox 
            label="Confidence" 
            value={`${avgSimilarity}%`} 
          />
          <div className="w-px h-12 bg-slate-900/10" />
          <StatBox 
            label="Resolved" 
            value={resolved} 
          />
          <div className="w-px h-12 bg-slate-900/10" />
          <div className="px-12 py-10 flex items-center justify-center">
             <div className="w-16 h-16 rounded-full border-2 border-slate-200 flex items-center justify-center relative overflow-hidden bg-white shadow-sm">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${(resolved / total) * 100}%` }}
                  className="absolute bottom-0 inset-x-0 bg-emerald-500/10"
                />
                <span className="text-[11px] font-black text-emerald-600 z-10">{Math.round((resolved / total) * 100)}%</span>
             </div>
          </div>
        </div>
      </div>

      {/* Pairs Feed */}
      <div className="flex flex-col gap-12">
        <AnimatePresence mode="popLayout">
          {pairs.length > 0 ? (
            pairs.map((pair) => (
              <DuplicatePairCard
                key={pair.id}
                pair={pair}
                isResolved={resolvedIds.has(pair.id)}
                onResolve={onResolve}
                onRedo={onRedo}
              />
            ))
          ) : (
            resolved > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-32 flex flex-col items-center justify-center gap-6"
              >
                <div className="w-24 h-24 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <Sparkles className="text-emerald-500" size={40} />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-3xl font-light text-slate-900">Database Sanitized</h3>
                  <p className="text-slate-500 font-light">All detected duplicates have been successfully resolved.</p>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default ComparisonEngine;
