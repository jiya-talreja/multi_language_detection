import React, { useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';

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
const langClassMap: Record<string, string> = {
  ar: 'lang-arabic',
  ru: 'lang-russian',
  fr: 'lang-french',
  es: 'lang-spanish',
  de: 'lang-german',
  zh: 'lang-chinese',
  ja: 'lang-japanese',
  en: 'lang-english',
};

const LanguageBadge: React.FC<{ lang: string; code: string }> = ({ lang, code }) => (
  <span
    className={`${langClassMap[code] ?? 'lang-default'} text-xs font-medium px-2.5 py-0.5 rounded-full backdrop-blur-sm`}
    style={{ fontSize: '0.64rem', fontWeight: 500, letterSpacing: '0.06em', border: '1px solid rgba(255,255,255,0.5)' }}
  >
    {lang}
  </span>
);

// ─── Tiltable Glass Record Card ───────────────────────────────────────────────
interface RecordCardProps {
  record: DuplicateRecord;
  side: 'left' | 'right';
}

const RecordCard: React.FC<RecordCardProps> = ({ record, side }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 200, damping: 22 };
  const rotateX = useSpring(useTransform(y, [-60, 60], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(x, [-60, 60], [side === 'left' ? -8 : 8, side === 'left' ? 8 : -8]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="perspective-wrapper flex-1" style={{ minWidth: 0 }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        whileHover={{ scale: 1.015, zIndex: 10 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        className="bg-white/50 backdrop-blur-sm border border-white/70 rounded-[1.5rem] p-6 h-full shadow-sm relative overflow-hidden"
        role="article"
        aria-label={`Record ${record.id}`}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{
              fontWeight: 200,
              fontSize: '0.62rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#9ca3af',
            }}>
              ID #{record.id}
            </span>
            <LanguageBadge lang={record.language} code={record.languageCode} />
          </div>
          {/* Shine dot */}
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'rgba(167,139,250,0.4)',
            boxShadow: '0 0 6px rgba(167,139,250,0.4)',
            flexShrink: 0,
          }} />
        </div>

        {/* Name */}
        <p style={{
          fontWeight: 500,
          fontSize: '1.0rem',
          color: '#111827',
          marginBottom: 6,
          lineHeight: 1.3,
        }}>
          {record.name}
        </p>

        {/* Fields */}
        <div className="flex flex-col gap-2 mt-3">
          {record.email && (
            <div>
              <span style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.12em', color: '#9ca3af', textTransform: 'uppercase' }}>Email</span>
              <p style={{ fontWeight: 300, fontSize: '0.8rem', color: '#374151', marginTop: 1 }}>{record.email}</p>
            </div>
          )}
          {record.phone && (
            <div>
              <span style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.12em', color: '#9ca3af', textTransform: 'uppercase' }}>Phone</span>
              <p style={{ fontWeight: 300, fontSize: '0.8rem', color: '#374151', marginTop: 1 }}>{record.phone}</p>
            </div>
          )}
          {record.text && (
            <div>
              <span style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.12em', color: '#9ca3af', textTransform: 'uppercase' }}>Note</span>
              <p style={{
                fontWeight: 300, fontSize: '0.78rem', color: '#4b5563', marginTop: 2,
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {record.text}
              </p>
            </div>
          )}
        </div>

        {/* 3D shine layer */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%)',
          pointerEvents: 'none',
          borderRadius: 'inherit',
        }} />
      </motion.div>
    </div>
  );
};

// ─── Similarity Connector ──────────────────────────────────────────────────────
const SimilarityBubble: React.FC<{ similarity: number }> = ({ similarity }) => {
  const pct = Math.round(similarity * 100);
  const hue = pct > 85 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#22c55e';

  return (
    <div className="flex items-center justify-center relative px-2" style={{ zIndex: 5 }}>
      {/* horizontal line connector */}
      <div className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2" style={{
        background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.4), transparent)'
      }} />

      {/* bubble */}
      <motion.div
        className="similarity-bubble rounded-full flex flex-col items-center justify-center relative bg-white/80 backdrop-blur-md shadow-xl border border-white/60"
        style={{ width: 72, height: 72 }}
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <span style={{ fontWeight: 700, fontSize: '1.25rem', color: hue, lineHeight: 1 }}>
          {pct}%
        </span>
        <span style={{ fontWeight: 500, fontSize: '0.6rem', color: '#6b7280', letterSpacing: '0.05em', marginTop: 2 }}>
          MATCH
        </span>
        {/* inner ring */}
        <div style={{
          position: 'absolute',
          inset: 3,
          borderRadius: '50%',
          border: `1.5px solid ${hue}40`,
        }} />
      </motion.div>
    </div>
  );
};

// ─── Full Pair Card ────────────────────────────────────────────────────────────
interface DuplicatePairCardProps {
  pair: DuplicatePair;
  onResolve: (id: string, action: 'keep' | 'remove') => void;
}

const DuplicatePairCard: React.FC<DuplicatePairCardProps> = ({ pair, onResolve }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        scale: 0.88,
        y: -16,
        filter: 'blur(8px)',
        transition: { type: 'spring', stiffness: 400, damping: 30, duration: 0.4 }
      }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-[2rem] p-6 w-full flex flex-col gap-6 relative overflow-hidden"
      style={{
        boxShadow: '0 12px 40px rgba(150,140,200,0.15), inset 0 2px 10px rgba(255,255,255,0.8)',
      }}
    >
      {/* Top row — pair index */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-600/10 border border-violet-600/20">
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
        </div>
        <span className="font-semibold text-xs tracking-widest uppercase text-violet-600">
          Potential Duplicate
        </span>
      </div>

      {/* Records row */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center relative">
        <RecordCard record={pair.recordA} side="left" />
        <SimilarityBubble similarity={pair.similarity} />
        <RecordCard record={pair.recordB} side="right" />
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3 pt-5 border-t border-violet-200/30">
        <motion.button
          onClick={() => onResolve(pair.id, 'keep')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all"
          style={{
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.2)',
            color: '#15803d',
          }}
          whileHover={{ scale: 1.02, background: 'rgba(34,197,94,0.15)' }}
          whileTap={{ scale: 0.98 }}
        >
          <Check size={16} strokeWidth={2.5} /> Keep Both
        </motion.button>
        <motion.button
          onClick={() => onResolve(pair.id, 'remove')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#b91c1c',
          }}
          whileHover={{ scale: 1.02, background: 'rgba(239,68,68,0.15)' }}
          whileTap={{ scale: 0.98 }}
        >
          <X size={16} strokeWidth={2.5} /> Remove Duplicate
        </motion.button>
        <motion.button
          onClick={() => onResolve(pair.id, 'keep')}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white shadow-lg shadow-violet-500/20 transition-all"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          }}
          whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(139,92,246,0.4)' }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowRight size={16} strokeWidth={2.5} /> Merge Records
        </motion.button>
      </div>
    </motion.div>
  );
};

export default DuplicatePairCard;
