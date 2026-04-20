import os

with open("d:\\1. Projects\\GitHub\\multi_language_detection\\frontend\\src\\components\\ComparisonEngine.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update 2D view actions to include Redo button
old_2d_actions = """                  <div className="ce-card-actions" style={{ marginTop: expandedCards.has(cl.id) ? '16px' : '20px' }}>
                    <button className="ce-btn ce-btn-keep" disabled={isResolved} onClick={() => handleResolve2D(cl.id, 'keep')}>✓ Keep All</button>
                    <button className="ce-btn ce-btn-remove" disabled={isResolved} onClick={() => handleResolve2D(cl.id, 'remove')}>✕ Remove</button>
                    <button className="ce-btn ce-btn-merge" disabled={isResolved} onClick={() => handleResolve2D(cl.id, 'merge')}>⊞ Merge</button>
                  </div>"""

new_2d_actions = """                  <div className="ce-card-actions" style={{ marginTop: expandedCards.has(cl.id) ? '16px' : '20px' }}>
                    {isResolved ? (
                      <button className="ce-btn" style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', width: '100%', fontWeight: 600 }} onClick={() => onRedo(cl.id)}>
                        ↺ Redo Decision
                      </button>
                    ) : (
                      <>
                        <button className="ce-btn ce-btn-keep" onClick={() => handleResolve2D(cl.id, 'keep')}>✓ Keep All</button>
                        <button className="ce-btn ce-btn-remove" onClick={() => handleResolve2D(cl.id, 'remove')}>✕ Remove</button>
                        <button className="ce-btn ce-btn-merge" onClick={() => handleResolve2D(cl.id, 'merge')}>⊞ Merge</button>
                      </>
                    )}
                  </div>"""

content = content.replace(old_2d_actions, new_2d_actions)

# 2. Update 3D view sidebar to handle resolved state and Redo
old_3d_sidebar = """                  <div className="ce-sidebar-footer">
                    <button className="ce-btn ce-btn-merge" onClick={() => handleResolveAction('merge')}>⊞ Merge into Master</button>
                    <div className="ce-btn-row">
                      <button className="ce-btn ce-btn-keep" onClick={() => handleResolveAction('keep')}>✓ Keep All</button>
                      <button className="ce-btn ce-btn-remove" onClick={() => handleResolveAction('remove')}>✕ Remove Duplicates</button>
                    </div>
                  </div>"""

new_3d_sidebar = """                  <div className="ce-sidebar-footer">
                    {resolvedIds.has(activeCluster.id) ? (
                      <button className="ce-btn" style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', width: '100%', fontWeight: 600 }} onClick={() => onRedo(activeCluster.id)}>
                        ↺ Redo Decision
                      </button>
                    ) : (
                      <>
                        <button className="ce-btn ce-btn-merge" onClick={() => handleResolveAction('merge')}>⊞ Merge into Master</button>
                        <div className="ce-btn-row">
                          <button className="ce-btn ce-btn-keep" onClick={() => handleResolveAction('keep')}>✓ Keep All</button>
                          <button className="ce-btn ce-btn-remove" onClick={() => handleResolveAction('remove')}>✕ Remove Duplicates</button>
                        </div>
                      </>
                    )}
                  </div>"""

content = content.replace(old_3d_sidebar, new_3d_sidebar)

with open("d:\\1. Projects\\GitHub\\multi_language_detection\\frontend\\src\\components\\ComparisonEngine.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Redo functionality added to UI.")
