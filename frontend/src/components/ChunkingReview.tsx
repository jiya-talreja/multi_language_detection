import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ChunkedRecord {
  id: string | number;
  parent_id: string | number;
  chunk_id: number;
  name: string;
  text: string;
  language: string;
  is_chunked: boolean;
}

interface ChunkingReviewProps {
  data: ChunkedRecord[];
  originalCount: number;
  onContinue: () => void;
  onBack: () => void;
}

const PAGE_SIZE = 12;

const s = {
  root: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background: '#fff',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,

  header: {
    padding: '32px 40px',
    borderBottom: '0.5px solid rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 32,
    background: 'linear-gradient(to right, #f8fafc, #fff)',
  } as React.CSSProperties,

  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  } as React.CSSProperties,

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#6366F1',
    flexShrink: 0,
    boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)',
  } as React.CSSProperties,

  statusLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#4F46E5',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
  },

  title: {
    fontSize: 32,
    fontWeight: 300,
    color: '#111',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  } as React.CSSProperties,

  subtitle: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 8,
    letterSpacing: '0.01em',
  } as React.CSSProperties,

  btnRow: {
    display: 'flex',
    gap: 12,
    flexShrink: 0,
    paddingTop: 2,
  } as React.CSSProperties,

  btnBack: {
    fontFamily: 'inherit',
    fontSize: 13,
    fontWeight: 500,
    padding: '9px 20px',
    borderRadius: 10,
    border: '1.5px solid #e2e8f0',
    background: '#fff',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  btnPrimary: {
    fontFamily: 'inherit',
    fontSize: 13,
    fontWeight: 600,
    padding: '9px 24px',
    borderRadius: 10,
    border: 'none',
    background: '#111',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  } as React.CSSProperties,

  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    background: '#f8fafc',
    borderBottom: '0.5px solid rgba(0,0,0,0.08)',
  } as React.CSSProperties,

  stat: {
    padding: '24px 40px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  } as React.CSSProperties,

  statBorder: {
    borderLeft: '0.5px solid #e2e8f0',
  } as React.CSSProperties,

  statVal: {
    fontSize: 32,
    fontWeight: 300,
    color: '#0f172a',
    lineHeight: 1,
  } as React.CSSProperties,

  statLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  },

  tableWrap: {
    overflowY: 'auto' as const,
    flex: 1,
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  } as React.CSSProperties,

  th: {
    padding: '14px 24px',
    textAlign: 'left' as const,
    fontSize: 11,
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    background: '#fff',
    borderBottom: '1px solid #f1f5f9',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  } as React.CSSProperties,

  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background 0.2s ease',
  } as React.CSSProperties,

  td: {
    padding: '16px 24px',
    fontSize: 13,
    color: '#334155',
  } as React.CSSProperties,

  parentBadge: {
    fontSize: 11,
    fontWeight: 500,
    color: '#94a3b8',
    background: '#f1f5f9',
    padding: '2px 6px',
    borderRadius: 4,
    fontFamily: 'ui-monospace, monospace',
  } as React.CSSProperties,

  chunkBadge: {
    fontSize: 11,
    fontWeight: 600,
    color: '#6366f1',
    background: '#eef2ff',
    padding: '2px 8px',
    borderRadius: 4,
    marginLeft: 8,
  } as React.CSSProperties,

  textPreview: {
    maxWidth: 600,
    color: '#1e293b',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  } as React.CSSProperties,

  footer: {
    padding: '16px 40px',
    background: '#fff',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as React.CSSProperties,

  pageBtn: {
    padding: '6px 16px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#fff',
    fontSize: 12,
    fontWeight: 500,
    color: '#475569',
    cursor: 'pointer',
  } as React.CSSProperties,
};

const ChunkingReview: React.FC<ChunkingReviewProps> = ({ data, originalCount, onContinue, onBack }) => {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const pageData = data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const chunkedCount = data.filter(d => d.is_chunked).length;
  const explosionRatio = (data.length / originalCount).toFixed(1);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={s.root}
    >
      <div style={s.header}>
        <div>
          <div style={s.statusRow}>
            <span style={s.statusDot} />
            <span style={s.statusLabel}>Semantic Chunking Active</span>
          </div>
          <div style={s.title}>Context Window Optimization</div>
          <div style={s.subtitle}>
            Data expanded into overlapping windows to prevent AI model truncation.
          </div>
        </div>
        <div style={s.btnRow}>
          <button style={s.btnBack} onClick={onBack}>Back to Norm</button>
          <button style={s.btnPrimary} onClick={onContinue}>
            Run embedding & detection
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5-5 5M6 12h12" />
            </svg>
          </button>
        </div>
      </div>

      <div style={s.stats}>
        <div style={s.stat}>
          <div style={s.statLabel}>Original Rows</div>
          <div style={s.statVal}>{originalCount}</div>
        </div>
        <div style={{ ...s.stat, ...s.statBorder }}>
          <div style={s.statLabel}>Optimized Chunks</div>
          <div style={s.statVal}>{data.length}</div>
        </div>
        <div style={{ ...s.stat, ...s.statBorder }}>
          <div style={s.statLabel}>Expansion Ratio</div>
          <div style={{ ...s.statVal, color: '#6366f1' }}>{explosionRatio}x</div>
        </div>
        <div style={{ ...s.stat, ...s.statBorder }}>
          <div style={s.statLabel}>Avg Chunks/Record</div>
          <div style={s.statVal}>{(data.length / originalCount).toFixed(2)}</div>
        </div>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={{ ...s.th, width: 140 }}>Source ID</th>
              <th style={{ ...s.th, width: 100 }}>Chunk</th>
              <th style={s.th}>Optimized Content</th>
              <th style={{ ...s.th, width: 120 }}>Language</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, idx) => (
              <tr key={idx} style={s.tr}>
                <td style={s.td}>
                  <span style={s.parentBadge}>{row.parent_id}</span>
                </td>
                <td style={s.td}>
                  <span style={s.chunkBadge}>#{row.chunk_id + 1}</span>
                </td>
                <td style={s.td}>
                  <div style={s.textPreview}>{row.text}</div>
                </td>
                <td style={s.td}>
                   <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{row.language}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={s.footer}>
        <div style={{ fontSize: 13, color: '#64748b' }}>
          Showing <strong>{page * PAGE_SIZE + 1}</strong> - <strong>{Math.min((page + 1) * PAGE_SIZE, data.length)}</strong> of <strong>{data.length}</strong> chunks
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button 
            style={{ ...s.pageBtn, opacity: page === 0 ? 0.5 : 1 }} 
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Previous
          </button>
          <span style={{ fontSize: 12, color: '#94a3b8', minWidth: 60, textAlign: 'center' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button 
            style={{ ...s.pageBtn, opacity: page >= totalPages - 1 ? 0.5 : 1 }} 
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Next
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChunkingReview;
