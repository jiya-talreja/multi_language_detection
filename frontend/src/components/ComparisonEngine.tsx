import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DuplicatePairCard from './DuplicatePairCard';
import type { DuplicatePair } from './DuplicatePairCard';
import { Layers, TrendingUp, CheckCircle } from 'lucide-react';

interface ComparisonEngineProps {
  pairs: DuplicatePair[];
  resolved: number;
  onResolve: (id: string, action: 'keep' | 'remove') => void;
}

const StatPill: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({
  icon, label, value, color,
}) => (
  <div className="glass-card flex items-center gap-3 px-4 py-2.5 rounded-2xl">
    <div style={{
      width: 32, height: 32, borderRadius: 10,
      background: `${color}18`,
      border: `1px solid ${color}28`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <p style={{ fontWeight: 600, fontSize: '1.0rem', color: '#111827', lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ fontWeight: 300, fontSize: '0.62rem', color: '#9ca3af', letterSpacing: '0.08em', marginTop: 2 }}>
        {label}
      </p>
    </div>
  </div>
);

const ComparisonEngine: React.FC<ComparisonEngineProps> = ({ pairs, resolved, onResolve }) => {
  const avgSimilarity = pairs.length > 0
    ? (pairs.reduce((s, p) => s + p.similarity, 0) / pairs.length * 100).toFixed(0)
    : 0;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      style={{ position: 'relative', zIndex: 5 }}
      className="w-full max-w-5xl mx-auto"
      aria-label="Comparison Engine"
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-3">
          <div style={{ width: 1, height: 20, background: 'linear-gradient(to bottom, transparent, #a78bfa, transparent)' }} />
          <span style={{ fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9ca3af' }}>
            Comparison Engine
          </span>
        </div>
        {/* Stats row */}
        <div className="hidden sm:flex items-center gap-3">
          <StatPill
            icon={<Layers size={14} color="#7c3aed" strokeWidth={1.5} />}
            label="Pairs Found"
            value={pairs.length + resolved}
            color="#7c3aed"
          />
          <StatPill
            icon={<TrendingUp size={14} color="#f59e0b" strokeWidth={1.5} />}
            label="Avg. Match"
            value={`${avgSimilarity}%`}
            color="#f59e0b"
          />
          <StatPill
            icon={<CheckCircle size={14} color="#22c55e" strokeWidth={1.5} />}
            label="Resolved"
            value={resolved}
            color="#22c55e"
          />
        </div>
      </div>

      {/* Progress bar */}
      {(pairs.length + resolved) > 0 && (
        <div className="w-full mb-6 px-1">
          <div style={{
            height: 3,
            borderRadius: 99,
            background: 'rgba(200,190,240,0.2)',
            overflow: 'hidden',
          }}>
            <motion.div
              style={{
                height: '100%',
                borderRadius: 99,
                background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${(resolved / (pairs.length + resolved)) * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span style={{ fontWeight: 300, fontSize: '0.6rem', color: '#c4b5fd', letterSpacing: '0.08em' }}>
              {resolved} resolved
            </span>
            <span style={{ fontWeight: 300, fontSize: '0.6rem', color: '#9ca3af', letterSpacing: '0.08em' }}>
              {pairs.length} remaining
            </span>
          </div>
        </div>
      )}

      {/* Pairs list */}
      <div className="flex flex-col gap-5">
        <AnimatePresence mode="popLayout">
          {pairs.map((pair) => (
            <DuplicatePairCard
              key={pair.id}
              pair={pair}
              onResolve={onResolve}
            />
          ))}
        </AnimatePresence>

        {/* Empty state */}
        <AnimatePresence>
          {pairs.length === 0 && resolved === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card rounded-3xl flex flex-col items-center justify-center py-16 gap-4"
            >
              <div style={{
                width: 56, height: 56, borderRadius: 18,
                background: 'linear-gradient(135deg, rgba(167,139,250,0.12), rgba(147,197,253,0.12))',
                border: '1px solid rgba(167,139,250,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Layers size={22} color="#c4b5fd" strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <p style={{ fontWeight: 400, fontSize: '0.9rem', color: '#6b7280' }}>
                  No duplicates detected
                </p>
                <p style={{ fontWeight: 300, fontSize: '0.72rem', color: '#d1d5db', marginTop: 4 }}>
                  Upload a dataset above to begin analysis
                </p>
              </div>
            </motion.div>
          )}

          {pairs.length === 0 && resolved > 0 && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-3xl flex flex-col items-center justify-center py-16 gap-4"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  width: 56, height: 56, borderRadius: 18,
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(74,222,128,0.1))',
                  border: '1px solid rgba(34,197,94,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <CheckCircle size={22} color="#22c55e" strokeWidth={1.5} />
              </motion.div>
              <div className="text-center">
                <p style={{ fontWeight: 400, fontSize: '0.9rem', color: '#16a34a' }}>
                  All duplicates resolved!
                </p>
                <p style={{ fontWeight: 300, fontSize: '0.72rem', color: '#9ca3af', marginTop: 4 }}>
                  {resolved} pair{resolved !== 1 ? 's' : ''} processed · Dataset is clean
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default ComparisonEngine;
