import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Check, X, ArrowRight, Shield, Globe } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DuplicatePair {
  id: string;
  recordA: DuplicateRecord;
  recordB: DuplicateRecord;
  similarity: number;
}

export interface DuplicateRecord {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  text?: string;
  language: string;
  languageCode: string;
}

// ─── Language Badge ────────────────────────────────────────────────────────────
const LanguageBadge: React.FC<{ lang: string }> = ({ lang }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50/80 text-indigo-700 text-[10px] font-semibold tracking-wider uppercase border border-indigo-100/50">
    <Globe size={10} strokeWidth={2.5} />
    {lang}
  </span>
);

// ─── Record Details ────────────────────────────────────────────────────────────
const RecordPanel: React.FC<{ record: DuplicateRecord; side: 'left' | 'right' }> = ({ record, side }) => {
  return (
    <div className={`flex flex-col gap-4 p-8 ${side === 'left' ? 'items-end text-right' : 'items-start text-left'}`}>
      <div className={`flex items-center gap-3 ${side === 'left' ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-mono text-[10px] border border-slate-100">
           ID
        </div>
        <span className="text-slate-400 font-mono text-xs tracking-tight">#{record.id}</span>
        <LanguageBadge lang={record.language} />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-medium text-slate-900 leading-snug tracking-tight">
          {record.name}
        </h3>
        {record.email && (
          <p className="text-sm text-slate-500 font-light">{record.email}</p>
        )}
      </div>

      {record.text && (
        <div className={`max-w-sm p-4 rounded-2xl bg-white/40 border border-white/60 shadow-inner relative group`}>
          <div className={`absolute top-0 ${side === 'left' ? 'right-4' : 'left-4'} -translate-y-1/2 px-2 bg-slate-50 rounded text-[9px] font-bold text-slate-400 uppercase tracking-widest`}>
            Extracted Context
          </div>
          <p className="text-[13px] text-slate-600 leading-relaxed font-light italic">
            "{record.text}"
          </p>
        </div>
      )}

      {(record.phone) && (
        <div className="flex gap-4">
          {record.phone && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-tighter opacity-50">Phone:</span>
              <span className="text-xs font-medium">{record.phone}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Pair Card ───────────────────────────────────────────────────────────
interface DuplicatePairCardProps {
  pair: DuplicatePair;
  onResolve: (id: string, action: 'keep' | 'remove') => void;
}

const DuplicatePairCard: React.FC<DuplicatePairCardProps> = ({ pair, onResolve }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-100, 100], [5, -5]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-5, 5]), { stiffness: 100, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const matchPercent = Math.round(pair.similarity * 100);
  const matchColor = matchPercent > 90 ? '#6366f1' : matchPercent > 70 ? '#f59e0b' : '#10b981';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      className="group relative"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="w-full bg-white/60 backdrop-blur-3xl border border-white/80 rounded-[2.5rem] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08)] overflow-hidden"
      >
        {/* Top Indicator */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur border border-slate-100 shadow-sm">
            <Shield size={12} className="text-indigo-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">High Confidence Match</span>
          </div>
        </div>

        {/* Content Layout */}
        <div className="relative grid grid-cols-[1fr_auto_1fr] items-center">
          <RecordPanel record={pair.recordA} side="left" />

          {/* Central Hub */}
          <div className="relative py-12 flex flex-col items-center justify-center">
             {/* Connection Line */}
             <div className="absolute inset-y-0 left-1/2 w-[1px] bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
             
             <motion.div 
               whileHover={{ scale: 1.1, rotate: 5 }}
               className="relative z-10 w-24 h-24 rounded-full bg-white shadow-2xl border-4 border-slate-50 flex flex-col items-center justify-center cursor-help"
             >
                <div 
                  className="absolute inset-0 rounded-full opacity-10" 
                  style={{ background: matchColor, filter: 'blur(12px)' }} 
                />
                <span className="text-2xl font-bold tracking-tighter" style={{ color: matchColor }}>
                  {matchPercent}%
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Match</span>
                
                {/* SVG Progress ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="48" cy="48" r="44"
                    fill="none"
                    stroke={matchColor}
                    strokeWidth="2"
                    strokeDasharray={276}
                    strokeDashoffset={276 - (276 * pair.similarity)}
                    strokeLinecap="round"
                    className="opacity-20"
                  />
                </svg>
             </motion.div>
          </div>

          <RecordPanel record={pair.recordB} side="right" />
        </div>

        {/* Actions Bar */}
        <div className="bg-slate-50/50 border-t border-slate-100 p-6 flex items-center justify-center gap-4">
           <button 
             onClick={() => onResolve(pair.id, 'keep')}
             className="px-8 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
           >
             Keep Both
           </button>
           
           <div className="w-[1px] h-6 bg-slate-200" />
           
           <button 
             onClick={() => onResolve(pair.id, 'remove')}
             className="px-8 py-3 rounded-2xl bg-white border border-red-100 text-red-500 text-sm font-semibold hover:bg-red-50 transition-all active:scale-95 shadow-sm"
           >
             Remove Duplicate
           </button>

           <button 
             onClick={() => onResolve(pair.id, 'keep')}
             className="group relative px-10 py-3.5 rounded-2xl bg-slate-900 text-white text-sm font-bold overflow-hidden shadow-xl shadow-slate-200 hover:shadow-indigo-500/20 transition-all active:scale-95"
           >
             <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
             <span className="relative z-10 flex items-center gap-2">
                Merge Records <ArrowRight size={16} />
             </span>
           </button>
        </div>
      </motion.div>

      {/* Background Decorative Element */}
      <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/5 via-transparent to-violet-500/5 blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    </motion.div>
  );
};

export default DuplicatePairCard;
