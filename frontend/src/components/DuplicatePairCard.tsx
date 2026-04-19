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
        className="glass-card rounded-2xl p-5 h-full"
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
    <div className="flex flex-col items-center gap-2 flex-shrink-0" style={{ zIndex: 5 }}>
      {/* top line */}
      <div className="connection-line" style={{ height: 28 }} />

      {/* bubble */}
      <motion.div
        className="similarity-bubble rounded-full flex flex-col items-center justify-center"
        style={{ width: 68, height: 68, position: 'relative' }}
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <span style={{ fontWeight: 600, fontSize: '1.15rem', color: hue, lineHeight: 1 }}>
          {pct}%
        </span>
        <span style={{ fontWeight: 300, fontSize: '0.55rem', color: '#9ca3af', letterSpacing: '0.08em', marginTop: 2 }}>
          MATCH
        </span>
        {/* inner ring */}
        <div style={{
          position: 'absolute',
          inset: 4,
          borderRadius: '50%',
          border: `1.5px solid ${hue}28`,
        }} />
      </motion.div>

      {/* bottom line */}
      <div className="connection-line" style={{ height: 28 }} />

      {/* label */}
      <span style={{
        fontWeight: 300, fontSize: '0.6rem',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: '#c4b5fd',
      }}>
        Duplicate
      </span>
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
      className="glass rounded-3xl p-5 w-full"
      style={{
        boxShadow: '0 8px 40px rgba(150,140,200,0.1), 0 2px 8px rgba(150,140,200,0.08)',
      }}
    >
      {/* Top row — pair index */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <div style={{
          width: 4, height: 4, borderRadius: '50%',
          background: 'rgba(167,139,250,0.5)',
        }} />
        <span style={{
          fontWeight: 300, fontSize: '0.62rem',
          letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c4b5fd',
        }}>
          Potential Duplicate
        </span>
      </div>

      {/* Records row */}
      <div className="flex items-center gap-3">
        <RecordCard record={pair.recordA} side="left" />
        <SimilarityBubble similarity={pair.similarity} />
        <RecordCard record={pair.recordB} side="right" />
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3 mt-4 pt-4" style={{
        borderTop: '1px solid rgba(200,190,240,0.2)',
      }}>
        <motion.button
          id={`keep-${pair.id}`}
          onClick={() => onResolve(pair.id, 'keep')}
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.2)',
            color: '#16a34a',
            fontWeight: 400, fontSize: '0.72rem',
            letterSpacing: '0.06em', cursor: 'pointer',
          }}
          whileHover={{ scale: 1.04, background: 'rgba(34,197,94,0.14)' }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        >
          <Check size={12} strokeWidth={2.5} /> Keep Both
        </motion.button>
        <motion.button
          id={`remove-${pair.id}`}
          onClick={() => onResolve(pair.id, 'remove')}
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.18)',
            color: '#dc2626',
            fontWeight: 400, fontSize: '0.72rem',
            letterSpacing: '0.06em', cursor: 'pointer',
          }}
          whileHover={{ scale: 1.04, background: 'rgba(239,68,68,0.13)' }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        >
          <X size={12} strokeWidth={2.5} /> Remove Duplicate
        </motion.button>
        <motion.button
          id={`merge-${pair.id}`}
          onClick={() => onResolve(pair.id, 'keep')}
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            background: 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(147,197,253,0.15))',
            border: '1px solid rgba(167,139,250,0.25)',
            color: '#7c3aed',
            fontWeight: 400, fontSize: '0.72rem',
            letterSpacing: '0.06em', cursor: 'pointer',
          }}
          whileHover={{ scale: 1.04, background: 'linear-gradient(135deg, rgba(167,139,250,0.25), rgba(147,197,253,0.25))' }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        >
          <ArrowRight size={12} strokeWidth={2.5} /> Merge Records
        </motion.button>
      </div>
    </motion.div>
  );
};

export default DuplicatePairCard;
