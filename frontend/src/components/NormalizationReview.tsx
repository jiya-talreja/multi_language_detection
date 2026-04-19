import React, { useState } from 'react';

interface NormalizedRecord {
  id: string | number;
  name: string;
  description: string;
  language: string;
  text: string;
}

interface NormalizationReviewProps {
  data: NormalizedRecord[];
  filename: string;
  onContinue: () => void;
  onCancel: () => void;
}

const PAGE_SIZE = 10;

const LANG_PILL: Record<string, React.CSSProperties> = {
  en: { background: '#E6F1FB', color: '#0C447C', borderColor: '#85B7EB' },
  hi: { background: '#FAEEDA', color: '#633806', borderColor: '#EF9F27' },
  mr: { background: '#FAECE7', color: '#712B13', borderColor: '#F0997B' },
  ar: { background: '#EAF3DE', color: '#27500A', borderColor: '#97C459' },
  fr: { background: '#EEEDFE', color: '#3C3489', borderColor: '#AFA9EC' },
  es: { background: '#FAEEDA', color: '#854F0B', borderColor: '#EF9F27' },
  ru: { background: '#E1F5EE', color: '#085041', borderColor: '#5DCAA5' },
  de: { background: '#F1EFE8', color: '#444441', borderColor: '#B4B2A9' },
  zh: { background: '#FBEAF0', color: '#72243E', borderColor: '#ED93B1' },
};

function getLangStyle(lang: string): React.CSSProperties {
  return LANG_PILL[lang?.toLowerCase()] ?? {
    background: '#EEEDFE',
    color: '#3C3489',
    borderColor: '#AFA9EC',
  };
}

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
    background: '#1D9E75',
    flexShrink: 0,
  } as React.CSSProperties,

  statusLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: '#0F6E56',
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
    color: '#999',
    marginTop: 8,
    letterSpacing: '0.01em',
  } as React.CSSProperties,

  btnRow: {
    display: 'flex',
    gap: 8,
    flexShrink: 0,
    paddingTop: 2,
  } as React.CSSProperties,

  btnCancel: {
    fontFamily: 'inherit',
    fontSize: 13,
    fontWeight: 500,
    padding: '7px 16px',
    borderRadius: 8,
    border: '0.5px solid rgba(0,0,0,0.18)',
    background: 'transparent',
    color: '#444',
    cursor: 'pointer',
  } as React.CSSProperties,

  btnPrimary: {
    fontFamily: 'inherit',
    fontSize: 13,
    fontWeight: 500,
    padding: '7px 16px',
    borderRadius: 8,
    border: '0.5px solid transparent',
    background: '#111',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  } as React.CSSProperties,

  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    borderBottom: '0.5px solid rgba(0,0,0,0.08)',
  } as React.CSSProperties,

  stat: {
    padding: '24px 36px',
  } as React.CSSProperties,

  statBorder: {
    borderLeft: '0.5px solid rgba(0,0,0,0.1)',
  } as React.CSSProperties,

  statVal: {
    fontSize: 36,
    fontWeight: 300,
    color: '#111',
    lineHeight: 1.1,
  } as React.CSSProperties,

  statValSm: {
    fontSize: 14,
    fontWeight: 500,
    marginTop: 4,
    lineHeight: 1.3,
  } as React.CSSProperties,

  statLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: '#999',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    marginTop: 4,
  },
  
  statValAi: {
    fontSize: 11,
    fontWeight: 600,
    color: '#6366F1',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  } as React.CSSProperties,

  langPills: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 5,
    marginTop: 2,
  } as React.CSSProperties,

  pill: {
    fontSize: 11,
    fontWeight: 500,
    padding: '3px 8px',
    borderRadius: 6,
    border: '0.5px solid',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
  } as React.CSSProperties,

  warnBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '12px 28px',
    background: '#FAEEDA',
    borderBottom: '0.5px solid #EF9F27',
  } as React.CSSProperties,

  warnText: {
    fontSize: 13,
    color: '#633806',
    lineHeight: 1.5,
  } as React.CSSProperties,

  tableWrap: {
    overflowX: 'auto' as const,
    flex: 1,
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 13,
  } as React.CSSProperties,

  th: {
    padding: '10px 16px',
    textAlign: 'left' as const,
    fontSize: 11,
    fontWeight: 500,
    color: '#999',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    background: '#f9f9f8',
    borderBottom: '0.5px solid rgba(0,0,0,0.08)',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,

  badge: {
    fontSize: 10,
    fontWeight: 500,
    padding: '2px 6px',
    borderRadius: 4,
    border: '0.5px solid',
    marginLeft: 6,
    verticalAlign: 'middle',
  } as React.CSSProperties,

  badgeMapped: {
    background: '#EEEDFE',
    color: '#3C3489',
    borderColor: '#AFA9EC',
  } as React.CSSProperties,

  badgeMirrored: {
    background: '#FAEEDA',
    color: '#854F0B',
    borderColor: '#EF9F27',
  } as React.CSSProperties,

  tr: {
    borderBottom: '0.5px solid rgba(0,0,0,0.06)',
  } as React.CSSProperties,

  td: {
    padding: '16px 24px',
    color: '#111',
    verticalAlign: 'middle' as const,
  } as React.CSSProperties,

  tdId: {
    fontFamily: 'ui-monospace, monospace',
    fontSize: 12,
    color: '#bbb',
    width: 56,
  } as React.CSSProperties,

  tdName: {
    fontWeight: 500,
    maxWidth: 260,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,

  tdDesc: {
    maxWidth: 280,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    color: '#888',
  } as React.CSSProperties,

  tdDescMirrored: {
    color: '#854F0B',
    fontStyle: 'italic' as const,
  } as React.CSSProperties,
  tdEmpty: {
    color: '#ccc',
    fontStyle: 'italic' as const,
  } as React.CSSProperties,

  tdAi: {
    maxWidth: 320,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    color: '#4338CA',
    background: 'rgba(99, 102, 241, 0.03)',
    fontWeight: 450,
  } as React.CSSProperties,

  footer: {
    padding: '12px 28px',
    borderTop: '0.5px solid rgba(0,0,0,0.08)',
    background: '#f9f9f8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as React.CSSProperties,

  footerText: {
    fontSize: 13,
    color: '#888',
  } as React.CSSProperties,

  pageControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  } as React.CSSProperties,

  pageBtn: {
    fontFamily: 'inherit',
    fontSize: 12,
    fontWeight: 500,
    padding: '5px 12px',
    borderRadius: 8,
    border: '0.5px solid rgba(0,0,0,0.15)',
    background: 'transparent',
    color: '#444',
    cursor: 'pointer',
  } as React.CSSProperties,

  pageInfo: {
    fontSize: 12,
    color: '#999',
    minWidth: 52,
    textAlign: 'center' as const,
  } as React.CSSProperties,
};

const NormalizationReview: React.FC<NormalizationReviewProps> = ({
  data,
  filename,
  onContinue,
  onCancel,
}) => {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const pageData = data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const distinctLangs = [...new Set(data.map(r => r.language).filter(Boolean))];
  const isMirrored = data.length > 0 && data.every(r => r.description === r.name);

  return (
    <div style={s.root}>

      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.statusRow}>
            <span style={s.statusDot} />
            <span style={s.statusLabel}>Normalization complete</span>
          </div>
          <div style={s.title}>Data standardization review</div>
          <div style={s.subtitle}>
            Parsed from <strong style={{ color: '#333', fontWeight: 500 }}>{filename}</strong>
          </div>
        </div>
        <div style={s.btnRow}>
          <button style={s.btnCancel} onClick={onCancel}>Cancel</button>
          <button style={s.btnPrimary} onClick={onContinue}>
            Move to chunking
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5-5 5M6 12h12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{...s.stats, gridTemplateColumns: 'repeat(5, 1fr)'}}>
        <div style={s.stat}>
          <div style={s.statVal}>{data.length.toLocaleString()}</div>
          <div style={s.statLabel}>Total rows</div>
        </div>
        <div style={{ ...s.stat, ...s.statBorder }}>
          <div style={s.statVal}>{distinctLangs.length}</div>
          <div style={s.statLabel}>Languages</div>
        </div>
        <div style={{ ...s.stat, ...s.statBorder }}>
          <div style={s.statValAi}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#6366F1' }} />
            Ready for AI
          </div>
          <div style={s.statVal}>{data.filter(r => r.text?.trim()).length.toLocaleString()}</div>
          <div style={s.statLabel}>Semantic Units</div>
        </div>
        <div style={{ ...s.stat, ...s.statBorder }}>
          <div style={{
            ...s.statValSm,
            color: isMirrored ? '#854F0B' : '#0F6E56',
          }}>
            {isMirrored ? 'Mirrored' : 'Distinct'}
          </div>
          <div style={s.statLabel}>Description</div>
        </div>
        <div style={{ ...s.stat, ...s.statBorder }}>
          <div style={s.langPills}>
            {distinctLangs.slice(0, 3).map(lang => (
              <span key={lang} style={{ ...s.pill, ...getLangStyle(lang) }}>
                {lang}
              </span>
            ))}
            {distinctLangs.length > 3 && (
              <span style={{
                ...s.pill,
                background: '#f1efe8',
                color: '#888',
                borderColor: '#ccc',
              }}>
                +{distinctLangs.length - 3}
              </span>
            )}
          </div>
          <div style={{ ...s.statLabel, marginTop: 8 }}>Detected</div>
        </div>
      </div>

      {/* Warning banner */}
      {isMirrored && (
        <div style={s.warnBanner}>
          <svg width="14" height="14" fill="none" stroke="#854F0B" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p style={s.warnText}>
            <strong style={{ fontWeight: 500 }}>Single-text dataset detected.</strong>{' '}
            No separate description column found — the name text has been copied into description so the embedding layer has content. Shown in amber below.
          </p>
        </div>
      )}

      {/* Table */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>ID</th>
              <th style={s.th}>
                Name
                <span style={{ ...s.badge, ...s.badgeMapped }}>mapped</span>
              </th>
              <th style={s.th}>
                Description
                {isMirrored && (
                  <span style={{ ...s.badge, ...s.badgeMirrored }}>mirrored</span>
                )}
              </th>
              <th style={{ ...s.th, color: '#4338CA', background: 'rgba(99, 102, 241, 0.05)' }}>
                AI Combined Text
                <span style={{ ...s.badge, background: '#EEEDFE', color: '#3C3489', borderColor: '#AFA9EC' }}>AI-Ready</span>
              </th>
              <th style={s.th}>Language</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, idx) => {
              const isRowMirrored = row.description === row.name && row.description !== '';
              return (
                <tr key={`${page}-${idx}`} style={s.tr}>
                  <td style={{ ...s.td, ...s.tdId }}>{String(row.id)}</td>
                  <td style={s.td}>
                    <div style={s.tdName}>
                      {row.name || <span style={s.tdEmpty}>—</span>}
                    </div>
                  </td>
                  <td style={s.td}>
                    {row.description?.trim() ? (
                      <div style={{ ...s.tdDesc, ...(isRowMirrored ? s.tdDescMirrored : {}) }}>
                        {row.description}
                      </div>
                    ) : (
                      <span style={s.tdEmpty}>—</span>
                    )}
                  </td>
                  <td style={{ ...s.td, ...s.tdAi }}>
                    {row.text || <span style={s.tdEmpty}>—</span>}
                  </td>
                  <td style={s.td}>
                    {row.language ? (
                      <span style={{ ...s.pill, ...getLangStyle(row.language) }}>
                        {row.language}
                      </span>
                    ) : (
                      <span style={s.tdEmpty}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div style={s.footer}>
        <div style={s.footerText}>
          Showing rows{' '}
          <strong style={{ color: '#333', fontWeight: 500 }}>{page * PAGE_SIZE + 1}</strong>
          {' – '}
          <strong style={{ color: '#333', fontWeight: 500 }}>{Math.min((page + 1) * PAGE_SIZE, data.length)}</strong>
          {' of '}
          <strong style={{ color: '#333', fontWeight: 500 }}>{data.length.toLocaleString()}</strong>
        </div>
        <div style={s.pageControls}>
          <button
            style={{ ...s.pageBtn, opacity: page === 0 ? 0.35 : 1, cursor: page === 0 ? 'not-allowed' : 'pointer' }}
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            ← Prev
          </button>
          <span style={s.pageInfo}>{page + 1} / {totalPages}</span>
          <button
            style={{ ...s.pageBtn, opacity: page >= totalPages - 1 ? 0.35 : 1, cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Next →
          </button>
        </div>
      </div>

    </div>
  );
};

export default NormalizationReview;