import os

with open("d:\\1. Projects\\GitHub\\multi_language_detection\\frontend\\src\\components\\ComparisonEngine.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add states and search function
states_to_add = """  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchMessage('Searching AI Index...');
    
    try {
      const res = await fetch('http://localhost:8000/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      
      const data = await res.json();
      if (data.match) {
        const matchId = data.match.cluster_id;
        const sim = data.match.similarity;
        setSearchMessage(`Match found! (${Math.round(sim * 100)}% Match)`);
        
        // Find in filtered clusters
        const idx = mappedClusters.findIndex(c => c.id === matchId);
        if (idx !== -1) {
           setActiveClusterIndex(idx);
           if (viewMode === '2d') {
             setExpandedCards(prev => new Set(prev).add(matchId));
             setTimeout(() => {
               const el = document.getElementById(`cluster-${matchId}`);
               if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
             }, 100);
           }
        } else {
           // It might be filtered out
           setSearchMessage(`Match found in hidden category (${Math.round(sim * 100)}% Match). Change filter to view.`);
        }
      } else {
        setSearchMessage('No close match found in database.');
      }
    } catch (err) {
      setSearchMessage('Search failed.');
    } finally {
      setIsSearching(false);
    }
  };
"""

content = content.replace(
    "const canvasRef = useRef<HTMLCanvasElement>(null);",
    states_to_add + "\n  const canvasRef = useRef<HTMLCanvasElement>(null);"
)

# 2. Add search bar UI just below the header
search_ui = """
      {/* Search Bar */}
      <div style={{ padding: '16px 40px', background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px', zIndex: 10 }}>
        <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '600px' }}>
            <svg style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type a sentence to instantly find duplicates via AI Search..."
              style={{ width: '100%', padding: '14px 20px 14px 44px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}
            />
          </div>
          <button type="submit" disabled={isSearching || !searchQuery.trim()} style={{ padding: '14px 28px', borderRadius: '12px', background: '#111', color: '#fff', fontSize: '14px', fontWeight: 600, border: 'none', cursor: isSearching || !searchQuery.trim() ? 'not-allowed' : 'pointer', opacity: isSearching || !searchQuery.trim() ? 0.6 : 1 }}>
            {isSearching ? 'Searching...' : 'Search'}
          </button>
          {searchMessage && (
            <span style={{ fontSize: '13px', fontWeight: 500, color: searchMessage.includes('Match found') ? '#10b981' : '#64748b' }}>
              {searchMessage}
            </span>
          )}
        </form>
      </div>
"""

content = content.replace(
    "<div className=\"ce-content\">",
    search_ui + "\n      <div className=\"ce-content\">"
)

# 3. Add id to cluster cards for scrolling
content = content.replace(
    "<div className=\"ce-cluster-card\" style={{ opacity: isResolved ? 0.45 : 1 }} key={cl.id}>",
    "<div id={`cluster-${cl.id}`} className=\"ce-cluster-card\" style={{ opacity: isResolved ? 0.45 : 1 }} key={cl.id}>"
)

with open("d:\\1. Projects\\GitHub\\multi_language_detection\\frontend\\src\\components\\ComparisonEngine.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Frontend search UI implemented.")
