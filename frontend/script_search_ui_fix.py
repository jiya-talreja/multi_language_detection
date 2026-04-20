import os

with open("d:\\1. Projects\\GitHub\\multi_language_detection\\frontend\\src\\components\\ComparisonEngine.tsx", "r", encoding="utf-8") as f:
    content = f.read()

search_ui = """      {/* Search Bar */}
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

      <div className="ce-main">"""

content = content.replace("      </header>\n\n      <div className=\"ce-main\">", "      </header>\n\n" + search_ui)

with open("d:\\1. Projects\\GitHub\\multi_language_detection\\frontend\\src\\components\\ComparisonEngine.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Frontend search UI correctly inserted.")
