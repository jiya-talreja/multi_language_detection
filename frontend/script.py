import os

content = """import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { type DuplicateCluster } from './DuplicateGroupCard';

interface ComparisonEngineProps {
  clusters: DuplicateCluster[];
  resolved: number;
  resolvedIds: Set<string>;
  onResolve: (clusterId: string, action: 'keep' | 'remove' | 'merge') => void;
  onRedo: (clusterId: string) => void;
}

export default function ComparisonEngine({ clusters, resolved, resolvedIds, onResolve }: ComparisonEngineProps) {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [activeClusterIndex, setActiveClusterIndex] = useState<number | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Refs to store three.js objects for imperative updates
  const resolvedMeshesRef = useRef<{[key: string]: THREE.Mesh}>({});

  const mappedClusters = useMemo(() => {
    return clusters.map((c, i) => {
      // Evenly distribute points on a sphere
      const phi = Math.acos(-1 + (2 * i + 1) / clusters.length);
      const theta = Math.sqrt(clusters.length * Math.PI) * phi;
      const r = 3 + Math.random() * 1.5;
      
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
          pct: Math.round(m.similarity * 100)
        }))
      };
    });
  }, [clusters]);

  const activeCluster = activeClusterIndex !== null ? mappedClusters[activeClusterIndex] : null;

  // Handle Three.js setup and teardown
  useEffect(() => {
    if (viewMode !== '3d' || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x08090d, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 10);

    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const pointLight1 = new THREE.PointLight(0x7c6fff, 2, 20);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);
    const pointLight2 = new THREE.PointLight(0x4fd8b4, 1.5, 20);
    pointLight2.position.set(-5, -3, -5);
    scene.add(pointLight2);

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starPositions = [];
    for (let i = 0; i < 600; i++) {
      starPositions.push((Math.random()-0.5)*60, (Math.random()-0.5)*60, (Math.random()-0.5)*60);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x334455, size: 0.06 });
    scene.add(new THREE.Points(starGeo, starMat));

    const nodeMeshes: THREE.Mesh[] = [];
    const newResolvedMeshes: {[key: string]: THREE.Mesh} = {};

    mappedClusters.forEach((cl) => {
      const r = 0.28 + cl.records.length * 0.045;
      const geo = new THREE.SphereGeometry(r, 48, 48);

      const col = new THREE.Color(cl.color);
      const isRes = resolvedIds.has(cl.id);
      
      const mat = new THREE.MeshPhongMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.18,
        shininess: 80,
        transparent: isRes,
        opacity: isRes ? 0.2 : 1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(cl.pos.x, cl.pos.y, cl.pos.z);
      mesh.userData = { clusterIndex: cl.index, clusterId: cl.id, baseColor: col.clone(), r };
      scene.add(mesh);
      nodeMeshes.push(mesh);
      newResolvedMeshes[cl.id] = mesh;

      if (!isRes) {
        const ringGeo = new THREE.TorusGeometry(r + 0.12, 0.025, 8, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.4 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(mesh.position);
        ring.rotation.x = Math.PI / 2.8 + cl.index * 0.4;
        scene.add(ring);
      }

      const canvas2 = document.createElement('canvas');
      canvas2.width = 256; canvas2.height = 64;
      const ctx = canvas2.getContext('2d')!;
      ctx.clearRect(0,0,256,64);
      ctx.font = 'bold 28px "DM Sans", sans-serif';
      ctx.fillStyle = '#e8eaf0';
      ctx.textAlign = 'center';
      ctx.fillText(cl.name, 128, 38);
      const tex = new THREE.CanvasTexture(canvas2);
      const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: isRes ? 0.4 : 0.9 });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(1.6, 0.4, 1);
      sprite.position.set(cl.pos.x, cl.pos.y + r + 0.35, cl.pos.z);
      scene.add(sprite);
    });

    resolvedMeshesRef.current = newResolvedMeshes;

    for (let a = 0; a < mappedClusters.length; a++) {
      for (let b = a+1; b < mappedClusters.length; b++) {
        if (resolvedIds.has(mappedClusters[a].id) || resolvedIds.has(mappedClusters[b].id)) continue;
        const pa = mappedClusters[a].pos, pb = mappedClusters[b].pos;
        const points = [new THREE.Vector3(pa.x,pa.y,pa.z), new THREE.Vector3(pb.x,pb.y,pb.z)];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({ color: 0x222a3a, transparent: true, opacity: 0.5 });
        const line = new THREE.Line(geo, mat);
        scene.add(line);
      }
    }

    let isDragging = false, prevMouse = { x: 0, y: 0 };
    let spherical = { theta: 0.3, phi: Math.PI/2.2, radius: 10 };

    const handleMouseDown = (e: MouseEvent) => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; };
    const handleMouseUp = () => { isDragging = false; };
    const handleMouseMoveCam = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      spherical.theta -= dx * 0.005;
      spherical.phi = Math.max(0.3, Math.min(Math.PI - 0.3, spherical.phi - dy * 0.005));
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const handleWheel = (e: WheelEvent) => {
      spherical.radius = Math.max(5, Math.min(20, spherical.radius + e.deltaY * 0.01));
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMoveCam);
    canvas.addEventListener('wheel', handleWheel, { passive: true });

    const raycaster = new THREE.Raycaster();
    const mouse2d = new THREE.Vector2();
    let hoveredMesh: THREE.Mesh | null = null;

    const getCanvasMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
        ex: e.clientX, ey: e.clientY
      };
    };

    const handleMouseMoveRay = (e: MouseEvent) => {
      const { x, y, ex, ey } = getCanvasMouse(e);
      mouse2d.set(x, y);
      raycaster.setFromCamera(mouse2d, camera);
      const hits = raycaster.intersectObjects(nodeMeshes);
      
      if (hits.length > 0) {
        const mesh = hits[0].object as THREE.Mesh;
        if (resolvedIds.has(mesh.userData.clusterId)) return; // skip resolved

        const cl = mappedClusters[mesh.userData.clusterIndex];
        if (hoveredMesh !== mesh) {
          if (hoveredMesh) (hoveredMesh.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.18;
          hoveredMesh = mesh;
          (mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.5;
          canvas.style.cursor = 'pointer';
        }
        if (tooltipRef.current) {
          tooltipRef.current.innerHTML = `<div class="tt-name">${cl.name}</div><div class="tt-sub">${cl.records.length} duplicates · ${cl.avgSim}% avg sim</div>`;
          tooltipRef.current.style.left = (ex + 14) + 'px';
          tooltipRef.current.style.top = (ey - 10) + 'px';
          tooltipRef.current.classList.add('show');
        }
      } else {
        if (hoveredMesh) { 
          (hoveredMesh.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.18; 
          hoveredMesh = null; 
        }
        if (tooltipRef.current) tooltipRef.current.classList.remove('show');
        canvas.style.cursor = 'grab';
      }
    };

    const handleClick = (e: MouseEvent) => {
      const { x, y } = getCanvasMouse(e);
      mouse2d.set(x, y);
      raycaster.setFromCamera(mouse2d, camera);
      const hits = raycaster.intersectObjects(nodeMeshes);
      if (hits.length > 0) {
        const mesh = hits[0].object as THREE.Mesh;
        if (!resolvedIds.has(mesh.userData.clusterId)) {
          setActiveClusterIndex(mesh.userData.clusterIndex);
        }
      }
    };

    canvas.addEventListener('mousemove', handleMouseMoveRay);
    canvas.addEventListener('click', handleClick);

    let t = 0;
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      t += 0.006;
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, 0, 0);

      nodeMeshes.forEach((mesh) => {
        const i = mesh.userData.clusterIndex;
        const cl = mappedClusters[i];
        if (!resolvedIds.has(cl.id)) {
            mesh.position.y = cl.pos.y + Math.sin(t + i * 1.1) * 0.08;
            mesh.rotation.y += 0.004;
        }
      });
      pointLight1.intensity = 1.8 + Math.sin(t * 0.7) * 0.4;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!canvasRef.current) return;
      const w = canvasRef.current.clientWidth, h = canvasRef.current.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);
    canvas.style.cursor = 'grab';

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMoveCam);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousemove', handleMouseMoveRay);
      canvas.removeEventListener('click', handleClick);
      renderer.dispose();
    };
  }, [viewMode, mappedClusters, resolvedIds]);

  const handleResolveAction = (action: 'keep' | 'remove' | 'merge') => {
    if (activeCluster) {
      onResolve(activeCluster.id, action);
      setActiveClusterIndex(null);
    }
  };

  const handleResolve2D = (clusterId: string, action: 'keep' | 'remove' | 'merge') => {
    onResolve(clusterId, action);
  };

  return (
    <div className="comparison-engine-root">
      <header className="ce-header">
        <div className="ce-logo">JN<span>.ai</span></div>
        <div className="ce-header-stats">
          <div className="ce-stat"><div className="ce-stat-val">{clusters.length}</div><div className="ce-stat-label">Clusters</div></div>
          <div className="ce-stat"><div className="ce-stat-val">{clusters.reduce((acc, c) => acc + c.members.length, 0)}</div><div className="ce-stat-label">Records</div></div>
          <div className="ce-stat"><div className="ce-stat-val">{clusters.length > 0 ? Math.round(clusters.reduce((a,b) => a+b.avgSimilarity,0)/clusters.length * 100) : 0}%</div><div className="ce-stat-label">Avg Match</div></div>
          <div className="ce-stat"><div className="ce-stat-val">{resolved}</div><div className="ce-stat-label">Resolved</div></div>
        </div>
        <div className="ce-view-toggle">
          <button className={`ce-toggle-btn ${viewMode === '2d' ? 'active' : ''}`} onClick={() => setViewMode('2d')}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/></svg>
            Classic
          </button>
          <button className={`ce-toggle-btn ${viewMode === '3d' ? 'active' : ''}`} onClick={() => setViewMode('3d')}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/><ellipse cx="7" cy="7" rx="2.5" ry="5.5" stroke="currentColor" strokeWidth="1.2"/><line x1="1.5" y1="7" x2="12.5" y2="7" stroke="currentColor" strokeWidth="1.2"/></svg>
            3D Graph
          </button>
        </div>
      </header>

      <div className="ce-main">
        {viewMode === '3d' && (
          <>
            <canvas id="canvas3d" ref={canvasRef} className="ce-canvas3d"></canvas>
            <div id="tooltip" ref={tooltipRef}></div>
            <div className="ce-legend" id="legend3d">
              <div className="ce-legend-title">Node size = duplicate count</div>
              <div className="ce-legend-row"><div className="ce-legend-dot" style={{background:'#4fd8b4'}}></div> 1–6 duplicates</div>
              <div className="ce-legend-row"><div className="ce-legend-dot" style={{background:'#ffaa44'}}></div> 7–9 duplicates</div>
              <div className="ce-legend-row"><div className="ce-legend-dot" style={{background:'#ff7055'}}></div> 10+ duplicates</div>
            </div>
            <div className="ce-hint" id="hint3d">drag to rotate · scroll to zoom · click node to inspect</div>

            <div id="sidebar" className={`ce-sidebar ${activeClusterIndex !== null ? 'open' : ''}`}>
              {activeCluster && (
                <>
                  <div className="ce-sidebar-head">
                    <div>
                      <div className="ce-sidebar-cluster-name">{activeCluster.master}</div>
                      <div className="ce-sidebar-sub">{activeCluster.records.length} duplicates · {activeCluster.avgSim}% avg similarity</div>
                    </div>
                    <button className="ce-close-btn" onClick={() => setActiveClusterIndex(null)}>✕</button>
                  </div>
                  <div className="ce-sidebar-body">
                    {activeCluster.records.map((r, i) => {
                      const pctColor = r.pct >= 95 ? '#4fd8b4' : r.pct >= 90 ? '#ffaa44' : '#ff5f72';
                      return (
                        <div className="ce-sidebar-record" key={i}>
                          <span className="ce-s-num">{i+1}</span>
                          <span className="ce-s-name">{r.name}</span>
                          <span className="ce-s-lang">{r.lang}</span>
                          <span className="ce-s-pct" style={{color: pctColor}}>{r.pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="ce-sidebar-footer">
                    <button className="ce-btn ce-btn-merge" onClick={() => handleResolveAction('merge')}>⊞ Merge into Master</button>
                    <div className="ce-btn-row">
                      <button className="ce-btn ce-btn-keep" onClick={() => handleResolveAction('keep')}>✓ Keep All</button>
                      <button className="ce-btn ce-btn-remove" onClick={() => handleResolveAction('remove')}>✕ Remove Duplicates</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {viewMode === '2d' && (
          <div id="view2d" className="ce-view2d visible">
            {mappedClusters.map((cl) => {
              const isResolved = resolvedIds.has(cl.id);
              const hexColor = '#' + cl.color.toString(16).padStart(6,'0');
              return (
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
              );
            })}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .comparison-engine-root {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 9999;
          font-family: 'DM Sans', sans-serif;
          background: #08090d;
          color: #e8eaf0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .comparison-engine-root * { box-sizing: border-box; }

        .ce-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          height: 56px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          background: #0f1117;
          flex-shrink: 0;
          z-index: 10;
        }

        .ce-logo {
          font-family: 'DM Mono', monospace;
          font-size: 15px;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: #7c6fff;
        }
        .ce-logo span { color: #4fd8b4; }

        .ce-header-stats { display: flex; gap: 28px; align-items: center; }
        .ce-stat { text-align: center; }
        .ce-stat-val { font-size: 18px; font-weight: 600; color: #e8eaf0; line-height: 1; }
        .ce-stat-label { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #6b7080; margin-top: 2px; }

        .ce-view-toggle {
          display: flex; background: #161820; border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px; padding: 3px; gap: 2px;
        }
        .ce-toggle-btn {
          padding: 5px 16px; border-radius: 6px; border: none; background: transparent;
          color: #6b7080; font-family: 'DM Sans', sans-serif; font-size: 13px;
          font-weight: 500; cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; gap: 6px;
        }
        .ce-toggle-btn.active { background: #7c6fff; color: #fff; }
        .ce-toggle-btn:not(.active):hover { color: #e8eaf0; }

        .ce-main { flex: 1; position: relative; overflow: hidden; display: flex; flex-direction: column; }
        .ce-canvas3d { width: 100%; height: 100%; display: block; }

        .ce-view2d {
          display: none; height: 100%; overflow-y: auto; padding: 28px;
          gap: 16px; flex-direction: column; max-width: 900px; margin: 0 auto; width: 100%;
        }
        .ce-view2d.visible { display: flex; }
        .ce-view2d::-webkit-scrollbar { width: 6px; }
        .ce-view2d::-webkit-scrollbar-track { background: transparent; }
        .ce-view2d::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

        .ce-cluster-card {
          background: #0f1117; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 20px 24px; transition: border-color 0.2s;
        }
        .ce-cluster-card:hover { border-color: rgba(255,255,255,0.12); }

        .ce-cluster-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .ce-cluster-name { font-size: 22px; font-weight: 600; color: #e8eaf0; }
        .ce-cluster-meta { display: flex; align-items: center; gap: 12px; }
        .ce-badge { font-size: 12px; font-weight: 500; padding: 4px 10px; border-radius: 20px; font-family: 'DM Mono', monospace; }
        .ce-badge-sim { background: rgba(79,216,180,0.12); color: #4fd8b4; }
        .ce-badge-dup { background: rgba(124,111,255,0.12); color: #7c6fff; }

        .ce-record-list { display: flex; flex-direction: column; gap: 6px; }
        .ce-record-row { display: flex; align-items: center; gap: 12px; padding: 9px 12px; border-radius: 8px; background: #161820; }
        .ce-record-num { font-family: 'DM Mono', monospace; font-size: 11px; color: #6b7080; width: 18px; }
        .ce-record-name { font-size: 15px; font-weight: 500; flex: 1; }
        .ce-lang-badge { font-size: 10px; font-family: 'DM Mono', monospace; padding: 2px 7px; border-radius: 4px; background: rgba(255,255,255,0.05); color: #6b7080; letter-spacing: 0.05em; }
        .ce-match-pct { font-size: 13px; font-weight: 500; color: #4fd8b4; font-family: 'DM Mono', monospace; }

        .ce-card-actions { display: flex; gap: 8px; margin-top: 16px; }
        .ce-btn { flex: 1; padding: 9px; border-radius: 8px; border: none; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
        .ce-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .ce-btn-keep { background: #161820; color: #e8eaf0; border: 1px solid rgba(255,255,255,0.12); }
        .ce-btn-keep:not(:disabled):hover { background: rgba(255,255,255,0.12); }
        .ce-btn-remove { background: rgba(255,95,114,0.1); color: #ff5f72; border: 1px solid rgba(255,95,114,0.2); }
        .ce-btn-remove:not(:disabled):hover { background: rgba(255,95,114,0.18); }
        .ce-btn-merge { background: #7c6fff; color: #fff; }
        .ce-btn-merge:not(:disabled):hover { background: #6a5ef0; }

        .ce-sidebar {
          position: absolute; top: 0; right: 0; bottom: 0; width: 380px;
          background: #0f1117; border-left: 1px solid rgba(255,255,255,0.12);
          transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          z-index: 20; display: flex; flex-direction: column; overflow: hidden;
        }
        .ce-sidebar.open { transform: translateX(0); }
        
        .ce-sidebar-head { padding: 20px 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.07); display: flex; align-items: flex-start; justify-content: space-between; flex-shrink: 0; }
        .ce-sidebar-cluster-name { font-size: 26px; font-weight: 600; letter-spacing: -0.02em; }
        .ce-sidebar-sub { font-size: 12px; color: #6b7080; margin-top: 3px; font-family: 'DM Mono', monospace; }
        .ce-close-btn { background: #161820; border: 1px solid rgba(255,255,255,0.12); color: #6b7080; width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; transition: all 0.15s; flex-shrink: 0; }
        .ce-close-btn:hover { color: #e8eaf0; border-color: rgba(255,255,255,0.12); background: rgba(255,255,255,0.07); }

        .ce-sidebar-body { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 8px; }
        .ce-sidebar-body::-webkit-scrollbar { width: 4px; }
        .ce-sidebar-body::-webkit-scrollbar-track { background: transparent; }
        .ce-sidebar-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }

        .ce-sidebar-record { background: #161820; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 12px 14px; display: flex; align-items: center; gap: 10px; transition: border-color 0.15s; }
        .ce-sidebar-record:hover { border-color: rgba(255,255,255,0.12); }
        .ce-s-num { font-family: 'DM Mono', monospace; font-size: 11px; color: #6b7080; width: 20px; flex-shrink: 0; }
        .ce-s-name { font-size: 16px; font-weight: 500; flex: 1; }
        .ce-s-lang { font-size: 10px; font-family: 'DM Mono', monospace; padding: 3px 7px; background: rgba(255,255,255,0.05); border-radius: 4px; color: #6b7080; }
        .ce-s-pct { font-size: 13px; font-weight: 500; font-family: 'DM Mono', monospace; }

        .ce-sidebar-footer { padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.07); display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; }
        .ce-sidebar-footer .ce-btn { flex: unset; }
        .ce-btn-row { display: flex; gap: 8px; }
        .ce-btn-row .ce-btn { flex: 1; }

        #tooltip { position: absolute; background: #161820; border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 8px 12px; pointer-events: none; font-size: 13px; z-index: 30; opacity: 0; transition: opacity 0.15s; white-space: nowrap; }
        #tooltip.show { opacity: 1; }
        #tooltip .tt-name { font-weight: 600; font-size: 14px; color: #e8eaf0; }
        #tooltip .tt-sub { color: #6b7080; font-size: 12px; font-family: 'DM Mono', monospace; margin-top: 2px; }

        .ce-legend { position: absolute; bottom: 24px; left: 24px; background: rgba(15,17,23,0.85); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 12px 16px; font-size: 12px; backdrop-filter: blur(8px); z-index: 10; }
        .ce-legend-title { color: #6b7080; text-transform: uppercase; letter-spacing: 0.08em; font-size: 10px; margin-bottom: 8px; }
        .ce-legend-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; color: #6b7080; }
        .ce-legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

        .ce-hint { position: absolute; bottom: 24px; right: 24px; color: #6b7080; font-size: 11px; font-family: 'DM Mono', monospace; text-align: right; line-height: 1.8; pointer-events: none; }
      `}} />
    </div>
  );
}
"""

with open("d:\\1. Projects\\GitHub\\multi_language_detection\\frontend\\src\\components\\ComparisonEngine.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully wrote ComparisonEngine.tsx")
