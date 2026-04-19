import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DuplicatePairCard from './DuplicatePairCard';
import type { DuplicatePair } from './DuplicatePairCard';
import { Layers, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

interface ComparisonEngineProps {
  pairs: DuplicatePair[];
  resolved: number;
  onResolve: (id: string, action: 'keep' | 'remove') => void;
}

const StatBox: React.FC<{ icon: React.ReactNode; label: string; value: string | number; gradient: string }> = ({
  icon, label, value, gradient,
}) => (
  <div className="relative group px-12 py-8 min-w-[200px]">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity`} />
    <div className="relative flex flex-col items-center gap-3">
      <div className="p-2.5 rounded-xl bg-white shadow-sm border border-slate-50 text-slate-400 group-hover:text-slate-600 transition-colors">
        {icon}
      </div>
      <div className="flex flex-col items-center text-center">
        <span className="text-3xl font-bold text-slate-900 tracking-tight leading-none">{value}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 whitespace-nowrap">{label}</span>
      </div>
    </div>
  </div>
);

const ComparisonEngine: React.FC<ComparisonEngineProps> = ({ pairs, resolved, onResolve }) => {
  const total = pairs.length + resolved;
  const avgSimilarity = total > 0
    ? (pairs.reduce((s, p) => s + p.similarity, 0) / total * 100).toFixed(0)
    : 0;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-6xl mx-auto space-y-12 pb-32"
    >
      {/* Header & Stats */}
      <div className="flex flex-col items-center gap-10">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-light text-slate-900 tracking-tight">
            Detected <span className="font-semibold italic">Duplicates</span>
          </h2>
        </div>

        <div className="bg-white/30 backdrop-blur-2xl rounded-[3rem] border border-white/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] flex items-center divide-x divide-white/10 overflow-hidden">
          <StatBox 
            icon={<Layers size={20} />} 
            label="Pairs Detected" 
            value={total} 
            gradient="from-blue-500 to-indigo-500" 
          />
          <StatBox 
            icon={<Zap size={20} />} 
            label="Confidence" 
            value={`${avgSimilarity}%`} 
            gradient="from-amber-500 to-orange-500" 
          />
          <StatBox 
            icon={<CheckCircle2 size={20} />} 
            label="Resolved" 
            value={resolved} 
            gradient="from-emerald-500 to-teal-500" 
          />
          <div className="px-12 py-8 flex items-center justify-center min-w-[160px]">
             <div className="w-20 h-20 rounded-full border-4 border-slate-50 flex items-center justify-center relative overflow-hidden shadow-inner bg-slate-50/30">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${(resolved / total) * 100}%` }}
                  className="absolute bottom-0 inset-x-0 bg-indigo-500/10"
                />
                <span className="text-[13px] font-black text-slate-400 z-10">{Math.round((resolved / total) * 100)}%</span>
             </div>
          </div>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full max-w-4xl mx-auto px-12">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          <span>Analysis Progress</span>
          <span>{resolved} / {total} records cleaned</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(resolved / total) * 100}%` }}
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          />
        </div>
      </div>

      {/* Pairs Feed */}
      <div className="flex flex-col gap-10">
        <AnimatePresence mode="popLayout">
          {pairs.length > 0 ? (
            pairs.map((pair) => (
              <DuplicatePairCard
                key={pair.id}
                pair={pair}
                onResolve={onResolve}
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
                  <h3 className="text-2xl font-medium text-slate-900">Database Sanitized</h3>
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
