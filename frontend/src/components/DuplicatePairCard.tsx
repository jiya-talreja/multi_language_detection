import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

export interface DuplicateRecord {
  id: string;
  name: string;
  text?: string;
  language: string;
}

export interface DuplicatePair {
  id: string;
  recordA: DuplicateRecord;
  recordB: DuplicateRecord;
  similarity: number;
}

interface DuplicatePairCardProps {
  pair: DuplicatePair;
  isResolved?: boolean;
  onResolve: (id: string, action: 'keep' | 'remove') => void;
  onRedo?: (id: string) => void;
}

const s: Record<string, React.CSSProperties> = {
  wrapper: {
    width: '100%',
    maxWidth: 920,
    margin: '0 auto 28px',
  },
  card: {
    background: '#fff',
    border: '0.5px solid rgba(0,0,0,0.1)',
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative' as const,
  },
  body: {
    display: 'grid',
    gridTemplateColumns: '1fr 108px 1fr',
    alignItems: 'center',
    padding: '28px 28px 20px',
    gap: 0,
  },
  side: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  sideRight: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    alignItems: 'flex-end',
    textAlign: 'right',
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '3px 9px',
    background: '#f4f4f2',
    border: '0.5px solid rgba(0,0,0,0.1)',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 500,
    color: '#555',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.07em',
    width: 'fit-content',
  },
  tagDot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: '#bbb',
    flexShrink: 0,
  },
  name: {
    fontSize: 20,
    fontWeight: 500,
    color: '#111',
    lineHeight: 1.35,
    margin: 0,
  },
  text: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic' as const,
    lineHeight: 1.6,
    margin: 0,
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
  },
  simBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    padding: '12px 16px',
    background: '#f7f7f5',
    border: '0.5px solid rgba(0,0,0,0.08)',
    borderRadius: 10,
    zIndex: 1,
    position: 'relative' as const,
  },
  simNum: {
    fontSize: 26,
    fontWeight: 500,
    color: '#111',
    lineHeight: 1,
    letterSpacing: '-0.02em',
  },
  simLabel: {
    fontSize: 10,
    fontWeight: 500,
    color: '#aaa',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
  },
  lineLeft: {
    position: 'absolute' as const,
    top: '50%',
    right: '50%',
    width: '50%',
    height: '0.5px',
    background: 'rgba(0,0,0,0.07)',
    transform: 'translateY(-50%)',
    zIndex: 0,
  },
  lineRight: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    width: '50%',
    height: '0.5px',
    background: 'rgba(0,0,0,0.07)',
    transform: 'translateY(-50%)',
    zIndex: 0,
  },
  divider: {
    height: '0.5px',
    background: 'rgba(0,0,0,0.07)',
    margin: '0 28px',
  },
  footer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 8,
    padding: '16px 28px 24px',
  },
  btnKeep: {
    fontFamily: 'inherit',
    fontSize: 13,
    fontWeight: 500,
    padding: '10px 0',
    borderRadius: 9,
    border: '0.5px solid rgba(0,0,0,0.14)',
    background: '#fff',
    color: '#444',
    cursor: 'pointer',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRemove: {
    fontFamily: 'inherit',
    fontSize: 13,
    fontWeight: 500,
    padding: '10px 0',
    borderRadius: 9,
    border: '0.5px solid rgba(200,50,50,0.22)',
    background: 'rgba(200,50,50,0.04)',
    color: '#b03030',
    cursor: 'pointer',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnMerge: {
    fontFamily: 'inherit',
    fontSize: 13,
    fontWeight: 500,
    padding: '10px 0',
    borderRadius: 9,
    border: '0.5px solid transparent',
    background: '#111',
    color: '#fff',
    cursor: 'pointer',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  resolvedOverlay: {
    position: 'absolute' as const,
    inset: 0,
    background: '#fff',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    zIndex: 10,
  },
  resolvedText: {
    fontSize: 18,
    fontWeight: 400,
    color: '#111',
    letterSpacing: '-0.01em',
  },
  btnRedo: {
    fontFamily: 'inherit',
    fontSize: 12,
    fontWeight: 600,
    padding: '8px 20px',
    borderRadius: 6,
    border: '0.5px solid rgba(0,0,0,0.1)',
    background: '#f7f7f5',
    color: '#666',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  },
};

const DuplicatePairCard: React.FC<DuplicatePairCardProps> = ({ pair, isResolved, onResolve, onRedo }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-100, 100], [3, -3]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-3, 3]), { stiffness: 100, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isResolved || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set(e.clientX - (rect.left + rect.width / 2));
    y.set(e.clientY - (rect.top + rect.height / 2));
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
      style={s.wrapper}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ ...s.card, rotateX, rotateY, transformStyle: 'preserve-3d' } as React.CSSProperties}
      >
        <AnimatePresence>
          {isResolved && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={s.resolvedOverlay}
            >
              <span style={s.resolvedText}>Resolved</span>
              <motion.button
                whileHover={{ background: '#eee' }}
                whileTap={{ scale: 0.95 }}
                style={s.btnRedo}
                onClick={() => onRedo?.(pair.id)}
              >
                Re-do
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ ...s.body, opacity: isResolved ? 0 : 1, transition: 'opacity 0.3s' }}>
          {/* Record A */}
          <div style={s.side}>
            <span style={s.tag}>
              <span style={s.tagDot} />
              Source A · {pair.recordA.language}
            </span>
            <p style={s.name}>{pair.recordA.name}</p>
            {pair.recordA.text && (
              <p style={s.text}>"{pair.recordA.text}"</p>
            )}
          </div>

          {/* Similarity center */}
          <div style={s.center}>
            <span style={s.lineLeft} />
            <span style={s.lineRight} />
            <div style={s.simBox}>
              <span style={s.simNum}>{Math.round(pair.similarity * 100)}%</span>
              <span style={s.simLabel}>match</span>
            </div>
          </div>

          {/* Record B */}
          <div style={s.sideRight}>
            <span style={{ ...s.tag, alignSelf: 'flex-end' }}>
              Source B · {pair.recordB.language}
              <span style={s.tagDot} />
            </span>
            <p style={s.name}>{pair.recordB.name}</p>
            {pair.recordB.text && (
              <p style={s.text}>"{pair.recordB.text}"</p>
            )}
          </div>
        </div>

        <div style={{ ...s.divider, opacity: isResolved ? 0 : 1 }} />

        {/* Footer */}
        <div style={{ ...s.footer, opacity: isResolved ? 0 : 1, pointerEvents: isResolved ? 'none' : 'auto' }}>
          <motion.button
            whileHover={{ opacity: 0.7 }}
            whileTap={{ scale: 0.97 }}
            style={s.btnKeep}
            onClick={() => onResolve(pair.id, 'keep')}
          >
            Keep both
          </motion.button>

          <motion.button
            whileHover={{ opacity: 0.7 }}
            whileTap={{ scale: 0.97 }}
            style={s.btnRemove}
            onClick={() => onResolve(pair.id, 'remove')}
          >
            Remove duplicate
          </motion.button>

          <motion.button
            whileHover={{ opacity: 0.85 }}
            whileTap={{ scale: 0.97 }}
            style={s.btnMerge}
            onClick={() => onResolve(pair.id, 'keep')}
          >
            Merge records
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
            </svg>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DuplicatePairCard;
