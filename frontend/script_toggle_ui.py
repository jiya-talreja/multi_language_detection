import os

with open("d:\\1. Projects\\GitHub\\multi_language_detection\\frontend\\src\\components\\ComparisonEngine.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add langFilter state
content = content.replace(
    "const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());",
    "const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());\n  const [langFilter, setLangFilter] = useState<'all' | 'cross' | 'same'>('all');"
)

# 2. Update mappedClusters to include isCrossLingual and apply filtering
mapped_clusters_orig = """  const mappedClusters = useMemo(() => {
    if (!clusters || clusters.length === 0) return [];
    return clusters.map((c, i) => {
      // Evenly distribute points on a sphere
      const phi = Math.acos(-1 + (2 * i + 1) / clusters.length);
      const theta = Math.sqrt(clusters.length * Math.PI) * phi;
      const r = Math.sqrt(clusters.length) * 1.5 + 2;
      
      const count = c.members.length;
      let colorHex = 0x4fd8b4;
      if (count >= 10) colorHex = 0xff7055;
      else if (count >= 7) colorHex = 0xffaa44;

      return {
        id: c.id,
        index: i,
        name: c.anchor.name.split(' ').slice(0, 2).join(' ') || 'Group',
        master: c.anchor.name,
        masterLang: c.anchor.language,
        masterText: c.anchor.text,
        avgSim: Math.round(c.avgSimilarity * 100),
        color: colorHex,
        pos: {
          x: r * Math.cos(theta) * Math.sin(phi),
          y: r * Math.sin(theta) * Math.sin(phi),
          z: r * Math.cos(phi)
        },
        records: c.members.map(m => ({
          name: m.name,
          lang: m.language,
          text: m.text,
          pct: Math.round(m.similarity * 100)
        }))
      };
    });
  }, [clusters]);"""

mapped_clusters_new = """  const filteredClusters = useMemo(() => {
    if (!clusters) return [];
    if (langFilter === 'cross') return clusters.filter(c => c.isCrossLingual);
    if (langFilter === 'same') return clusters.filter(c => !c.isCrossLingual);
    return clusters;
  }, [clusters, langFilter]);

  const mappedClusters = useMemo(() => {
    if (!filteredClusters || filteredClusters.length === 0) return [];
    return filteredClusters.map((c, i) => {
      const phi = Math.acos(-1 + (2 * i + 1) / filteredClusters.length);
      const theta = Math.sqrt(filteredClusters.length * Math.PI) * phi;
      const r = Math.sqrt(filteredClusters.length) * 1.5 + 2;
      
      const count = c.members.length;
      let colorHex = 0x4fd8b4;
      if (count >= 10) colorHex = 0xff7055;
      else if (count >= 7) colorHex = 0xffaa44;

      return {
        id: c.id,
        isCrossLingual: !!c.isCrossLingual,
        index: i,
        name: c.anchor.name.split(' ').slice(0, 2).join(' ') || 'Group',
        master: c.anchor.name,
        masterLang: c.anchor.language,
        masterText: c.anchor.text,
        avgSim: Math.round(c.avgSimilarity * 100),
        color: colorHex,
        pos: {
          x: r * Math.cos(theta) * Math.sin(phi),
          y: r * Math.sin(theta) * Math.sin(phi),
          z: r * Math.cos(phi)
        },
        records: c.members.map(m => ({
          name: m.name,
          lang: m.language,
          text: m.text,
          pct: Math.round(m.similarity * 100)
        }))
      };
    });
  }, [filteredClusters]);"""

content = content.replace(mapped_clusters_orig, mapped_clusters_new)

# 3. Add counts for badges
badge_counts = """
  const crossCount = useMemo(() => clusters.filter(c => c.isCrossLingual).length, [clusters]);
  const sameCount = useMemo(() => clusters.filter(c => !c.isCrossLingual).length, [clusters]);
"""
content = content.replace(
    "const activeCluster = activeClusterIndex !== null ? mappedClusters[activeClusterIndex] : null;",
    "const activeCluster = activeClusterIndex !== null ? mappedClusters[activeClusterIndex] : null;\n" + badge_counts
)

# 4. Add the toggle UI to the header
toggle_ui = """
        <div className="ce-view-toggle" style={{ marginRight: '12px' }}>
          <button className={`ce-toggle-btn ${langFilter === 'cross' ? 'active' : ''}`} onClick={() => { setLangFilter('cross'); setActiveClusterIndex(null); }} style={langFilter === 'cross' ? { background: '#7c6fff', color: '#fff' } : {}}>
             Cross Lang <span style={{ marginLeft: '4px', opacity: 0.6, fontSize: '10px' }}>{crossCount}</span>
          </button>
          <button className={`ce-toggle-btn ${langFilter === 'same' ? 'active' : ''}`} onClick={() => { setLangFilter('same'); setActiveClusterIndex(null); }}>
             Same Lang <span style={{ marginLeft: '4px', opacity: 0.6, fontSize: '10px' }}>{sameCount}</span>
          </button>
          <button className={`ce-toggle-btn ${langFilter === 'all' ? 'active' : ''}`} onClick={() => { setLangFilter('all'); setActiveClusterIndex(null); }}>
             All
          </button>
        </div>
"""

content = content.replace(
    "<div className=\"ce-logo\">JN<span>.ai</span></div>",
    "<div className=\"ce-logo\">JN<span>.ai</span></div>\n" + toggle_ui
)

with open("d:\\1. Projects\\GitHub\\multi_language_detection\\frontend\\src\\components\\ComparisonEngine.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Frontend toggle UI implemented.")
