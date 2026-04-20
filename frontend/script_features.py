import os
import re

with open("d:\\1. Projects\\GitHub\\multi_language_detection\\frontend\\src\\components\\ComparisonEngine.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add state for accordion
content = content.replace(
    "const [activeClusterIndex, setActiveClusterIndex] = useState<number | null>(null);",
    "const [activeClusterIndex, setActiveClusterIndex] = useState<number | null>(null);\n  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());"
)

# 2. Add masterText and record text to mappedClusters
content = content.replace(
    "masterLang: c.anchor.language,",
    "masterLang: c.anchor.language,\n        masterText: c.anchor.text,"
)
content = content.replace(
    "lang: m.language,",
    "lang: m.language,\n          text: m.text,"
)

# 3. Add CSV download function
csv_func = """
  const handleDownloadCSV = () => {
    let csv = 'Cluster ID,Is Master,Record ID,Name,Language,Similarity,Text\\n';
    clusters.forEach((c, idx) => {
      const cId = `Group-${idx + 1}`;
      csv += `"${cId}","Yes","${c.anchor.id}","${c.anchor.name.replace(/"/g, '""')}","${c.anchor.language}","1.0","${(c.anchor.text || '').replace(/"/g, '""')}"\\n`;
      c.members.forEach(m => {
        csv += `"${cId}","No","${m.id}","${m.name.replace(/"/g, '""')}","${m.language}","${m.similarity}","${(m.text || '').replace(/"/g, '""')}"\\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'jn_ai_duplicates.csv';
    link.click();
  };
"""
content = content.replace(
    "const handleResolve2D = (clusterId: string, action: 'keep' | 'remove' | 'merge') => {\n    onResolve(clusterId, action);\n  };",
    "const handleResolve2D = (clusterId: string, action: 'keep' | 'remove' | 'merge') => {\n    onResolve(clusterId, action);\n  };\n" + csv_func
)

# 4. Add Download button to header
download_btn = """
          <button className="ce-toggle-btn" onClick={handleDownloadCSV} style={{ color: '#4fd8b4' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Download CSV
          </button>
          <div style={{ width: '1px', background: 'rgba(0,0,0,0.1)', margin: '0 4px' }}></div>
"""
content = content.replace(
    "<div className=\"ce-view-toggle\">",
    "<div className=\"ce-view-toggle\">\n" + download_btn
)

# 5. Add descriptions to sidebar records
sidebar_record_orig = """
                        <div className="ce-sidebar-record" key={i}>
                          <span className="ce-s-num">{i+1}</span>
                          <span className="ce-s-name">{r.name}</span>
                          <span className="ce-s-lang">{r.lang}</span>
                          <span className="ce-s-pct" style={{color: pctColor}}>{r.pct}%</span>
                        </div>
"""
sidebar_record_new = """
                        <div className="ce-sidebar-record-wrapper" key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: '#f1f5f9', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '10px', padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="ce-s-num">{i+1}</span>
                            <span className="ce-s-name">{r.name}</span>
                            <span className="ce-s-lang">{r.lang}</span>
                            <span className="ce-s-pct" style={{color: pctColor, marginLeft: 'auto'}}>{r.pct}%</span>
                          </div>
                          {r.text && <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', paddingLeft: '30px' }}>"{r.text}"</div>}
                        </div>
"""
content = content.replace(sidebar_record_orig, sidebar_record_new)

# 6. Update 2D view header with accordion and description
view2d_card_orig = """
                <div className="ce-cluster-card" style={{ opacity: isResolved ? 0.45 : 1 }} key={cl.id}>
                  <div className="ce-cluster-header">
                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                      <div style={{width:'10px', height:'10px', borderRadius:'50%', background: hexColor, flexShrink:0}}></div>
                      <div className="ce-cluster-name">{cl.master}</div>
                      <span className="ce-lang-badge">{cl.masterLang}</span>
                    </div>
                    <div className="ce-cluster-meta">
                      <span className="ce-badge ce-badge-sim">{cl.avgSim}% SIM</span>
                      <span className="ce-badge ce-badge-dup">{cl.records.length} DUPES</span>
                    </div>
                  </div>
                  <div className="ce-record-list">
                    {cl.records.map((r, i) => (
                      <div className="ce-record-row" key={i}>
                        <span className="ce-record-num">{i+1}</span>
                        <span className="ce-record-name">{r.name}</span>
                        <span className="ce-lang-badge">{r.lang}</span>
                        <span className="ce-match-pct">{r.pct}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="ce-card-actions">
                    <button className="ce-btn ce-btn-keep" disabled={isResolved} onClick={() => handleResolve2D(cl.id, 'keep')}>✓ Keep All</button>
                    <button className="ce-btn ce-btn-remove" disabled={isResolved} onClick={() => handleResolve2D(cl.id, 'remove')}>✕ Remove</button>
                    <button className="ce-btn ce-btn-merge" disabled={isResolved} onClick={() => handleResolve2D(cl.id, 'merge')}>⊞ Merge</button>
                  </div>
                </div>
"""

view2d_card_new = """
                <div className="ce-cluster-card" style={{ opacity: isResolved ? 0.45 : 1 }} key={cl.id}>
                  <div className="ce-cluster-header" style={{ cursor: 'pointer', marginBottom: expandedCards.has(cl.id) ? '14px' : '0' }} onClick={() => {
                    setExpandedCards(prev => {
                      const next = new Set(prev);
                      if (next.has(cl.id)) next.delete(cl.id);
                      else next.add(cl.id);
                      return next;
                    });
                  }}>
                    <div style={{flex: 1}}>
                      <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom: cl.masterText ? '8px' : '0'}}>
                        <div style={{width:'10px', height:'10px', borderRadius:'50%', background: hexColor, flexShrink:0}}></div>
                        <div className="ce-cluster-name">{cl.master}</div>
                        <span className="ce-lang-badge">{cl.masterLang}</span>
                        <div className="ce-cluster-meta" style={{marginLeft: 'auto', marginRight: '12px'}}>
                          <span className="ce-badge ce-badge-sim">{cl.avgSim}% SIM</span>
                          <span className="ce-badge ce-badge-dup">{cl.records.length} DUPES</span>
                        </div>
                        <svg style={{ transform: expandedCards.has(cl.id) ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: '#64748b' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                      {cl.masterText && <div style={{ fontSize: '14px', color: '#64748b', fontStyle: 'italic', paddingLeft: '22px' }}>"{cl.masterText}"</div>}
                    </div>
                  </div>
                  
                  {expandedCards.has(cl.id) && (
                    <div className="ce-record-list">
                      {cl.records.map((r, i) => (
                        <div className="ce-record-row" key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                            <span className="ce-record-num">{i+1}</span>
                            <span className="ce-record-name">{r.name}</span>
                            <span className="ce-lang-badge">{r.lang}</span>
                            <span className="ce-match-pct" style={{marginLeft: 'auto'}}>{r.pct}%</span>
                          </div>
                          {r.text && <div style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', paddingLeft: '30px', marginTop: '4px' }}>"{r.text}"</div>}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="ce-card-actions" style={{ marginTop: expandedCards.has(cl.id) ? '16px' : '20px' }}>
                    <button className="ce-btn ce-btn-keep" disabled={isResolved} onClick={() => handleResolve2D(cl.id, 'keep')}>✓ Keep All</button>
                    <button className="ce-btn ce-btn-remove" disabled={isResolved} onClick={() => handleResolve2D(cl.id, 'remove')}>✕ Remove</button>
                    <button className="ce-btn ce-btn-merge" disabled={isResolved} onClick={() => handleResolve2D(cl.id, 'merge')}>⊞ Merge</button>
                  </div>
                </div>
"""
content = content.replace(view2d_card_orig, view2d_card_new)

with open("d:\\1. Projects\\GitHub\\multi_language_detection\\frontend\\src\\components\\ComparisonEngine.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Modifications complete.")
