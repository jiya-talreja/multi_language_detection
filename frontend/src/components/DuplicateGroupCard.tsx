import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Mail, Phone, Globe, Check, X, Combine } from 'lucide-react';

export interface ClusterMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  text?: string;
  language: string;
  similarity: number;
}

export interface DuplicateCluster {
  id: string;
  anchor: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    text?: string;
    language: string;
  };
  members: ClusterMember[];
  avgSimilarity: number;
}

interface DuplicateGroupCardProps {
  cluster: DuplicateCluster;
  isResolved?: boolean;
  onResolve: (id: string, action: 'keep' | 'remove') => void;
  onRedo?: (id: string) => void;
}

const DuplicateGroupCard: React.FC<DuplicateGroupCardProps> = ({ cluster, isResolved, onResolve, onRedo }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, filter: 'blur(12px)' }}
      className="w-full max-w-6xl mx-auto mb-12 relative"
    >
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] transition-all duration-700">
        <AnimatePresence>
          {isResolved && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-6"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Check className="text-white" size={32} />
              </div>
              <div className="text-center">
                <h4 className="text-2xl font-semibold text-slate-900 tracking-tight">Cluster Resolved</h4>
                <p className="text-slate-500 mt-1">Data has been cleaned and unified.</p>
              </div>
              <button
                onClick={() => onRedo?.(cluster.id)}
                className="px-8 py-3 rounded-full border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all active:scale-95"
              >
                Undo Resolution
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header - Master Record */}
        <div className="p-10 pb-8 flex items-start justify-between gap-12 bg-gradient-to-b from-slate-50/50 to-transparent">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
              <div className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                Master Record
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200 shadow-sm">
                 <Globe size={12} className="text-indigo-500" />
                 <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{cluster.anchor.language}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-4xl font-light text-slate-900 tracking-tight leading-tight">{cluster.anchor.name}</h3>
              <div className="flex flex-wrap gap-6 text-slate-400">
                {cluster.anchor.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={16} strokeWidth={1.5} className="text-slate-300" />
                    <span className="font-medium text-slate-500">{cluster.anchor.email}</span>
                  </div>
                )}
                {cluster.anchor.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={16} strokeWidth={1.5} className="text-slate-300" />
                    <span className="font-medium text-slate-500">{cluster.anchor.phone}</span>
                  </div>
                )}
              </div>
            </div>
            
            {cluster.anchor.text && (
               <div className="relative">
                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/20 rounded-full" />
                 <p className="pl-6 text-slate-500 text-lg font-light italic leading-relaxed">
                   "{cluster.anchor.text}"
                 </p>
               </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-6 shrink-0">
             <div className="flex flex-col items-center gap-1 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm min-w-[140px]">
                <span className="text-4xl font-light text-slate-900 tracking-tighter">{Math.round(cluster.avgSimilarity * 100)}%</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Group Confidence</span>
             </div>
             <div className="px-5 py-2 bg-violet-50 text-violet-600 text-[11px] font-black uppercase tracking-[0.15em] rounded-full border border-violet-100 shadow-sm">
                {cluster.members.length} Detected Matches
             </div>
          </div>
        </div>

        {/* Member List Toggle */}
        <div className="px-10">
           <button 
             onClick={() => setIsExpanded(!isExpanded)}
             className="w-full flex items-center justify-center gap-3 py-4 border-y border-slate-100 text-slate-400 hover:text-slate-900 transition-all group"
           >
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">{isExpanded ? 'Collapse Cluster Details' : 'Expand All Member Records'}</span>
             <div className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
               <ChevronDown size={18} />
             </div>
           </button>
           
           <AnimatePresence>
             {isExpanded && (
               <motion.div
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: 'auto', opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 className="overflow-hidden"
               >
                 <div className="py-10 space-y-12">
                    {cluster.members.map((member, idx) => (
                      <div key={member.id} className="flex items-start gap-10 group/member">
                        <div className="mt-1 w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400 group-hover/member:bg-slate-900 group-hover/member:text-white transition-colors duration-500">
                          {idx + 1}
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-4">
                            <h4 className="text-2xl font-light text-slate-800 tracking-tight">{member.name}</h4>
                            <div className="h-1 w-1 rounded-full bg-slate-300" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{member.language}</span>
                            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-md border border-emerald-100">
                              {Math.round(member.similarity * 100)}% Match
                            </div>
                          </div>
                          {member.text && (
                            <p className="text-base text-slate-500 italic font-light leading-relaxed border-l-2 border-slate-100 pl-6">"{member.text}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Actions Bar - Re-engineered for space */}
        <div className="p-10 pt-6 flex items-center gap-6">
          <button
            onClick={() => onResolve(cluster.id, 'keep')}
            className="flex-1 flex items-center justify-center gap-3 px-8 py-5 rounded-[1.5rem] border-2 border-slate-100 text-slate-500 font-bold text-sm hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-[0.98]"
          >
            <Check size={18} />
            Keep All
          </button>
          
          <button
            onClick={() => onResolve(cluster.id, 'remove')}
            className="flex-1 flex items-center justify-center gap-3 px-8 py-5 rounded-[1.5rem] border-2 border-red-50 text-red-500 font-bold text-sm hover:bg-red-50 hover:border-red-100 transition-all active:scale-[0.98]"
          >
            <X size={18} />
            Discard Matches
          </button>

          <button
            onClick={() => onResolve(cluster.id, 'keep')}
            className="flex-[1.5] flex items-center justify-center gap-4 px-8 py-5 rounded-[1.5rem] bg-slate-900 text-white font-bold text-sm hover:bg-black transition-all shadow-[0_15px_30px_rgba(0,0,0,0.15)] active:scale-[0.98] group"
          >
            <Combine size={20} className="group-hover:rotate-12 transition-transform" />
            Merge Into Master Record
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DuplicateGroupCard;
