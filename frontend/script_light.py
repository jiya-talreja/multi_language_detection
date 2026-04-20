import os

# Read the current file
with open("d:\\1. Projects\\GitHub\\multi_language_detection\\frontend\\src\\components\\ComparisonEngine.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace Three.js background and colors
content = content.replace("renderer.setClearColor(0x08090d, 1);", "renderer.setClearColor(0xf8fafc, 1);")
content = content.replace("const starMat = new THREE.PointsMaterial({ color: 0x334455, size: 0.06 });", "const starMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.06 });")
content = content.replace("ctx.fillStyle = '#e8eaf0';", "ctx.fillStyle = '#1e293b';")
content = content.replace("const mat = new THREE.LineBasicMaterial({ color: 0x222a3a, transparent: true, opacity: 0.5 });", "const mat = new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.2 });")

# Replace CSS variables and styles
content = content.replace("background: #08090d;", "background: #f8fafc;")
content = content.replace("color: #e8eaf0;", "color: #0f172a;")
content = content.replace("background: #0f1117;", "background: #ffffff;")
content = content.replace("border-bottom: 1px solid rgba(255,255,255,0.07);", "border-bottom: 1px solid rgba(0,0,0,0.05);")
content = content.replace("background: #161820;", "background: #f1f5f9;")
content = content.replace("border: 1px solid rgba(255,255,255,0.12);", "border: 1px solid rgba(0,0,0,0.1);")
content = content.replace("color: #6b7080;", "color: #64748b;")
content = content.replace("background: rgba(255,255,255,0.05);", "background: rgba(0,0,0,0.03);")
content = content.replace("border: 1px solid rgba(255,255,255,0.07);", "border: 1px solid rgba(0,0,0,0.05);")
content = content.replace("border-color: rgba(255,255,255,0.12);", "border-color: rgba(0,0,0,0.1);")
content = content.replace("border-left: 1px solid rgba(255,255,255,0.12);", "border-left: 1px solid rgba(0,0,0,0.05);")
content = content.replace("border-bottom: 1px solid rgba(255,255,255,0.07);", "border-bottom: 1px solid rgba(0,0,0,0.05);")
content = content.replace("border-top: 1px solid rgba(255,255,255,0.07);", "border-top: 1px solid rgba(0,0,0,0.05);")
content = content.replace("background: rgba(255,255,255,0.07);", "background: rgba(0,0,0,0.03);")
content = content.replace("border-color: rgba(255,255,255,0.12);", "border-color: rgba(0,0,0,0.1);")
content = content.replace("background: rgba(255,255,255,0.12);", "background: rgba(0,0,0,0.05);")
content = content.replace("color: #e8eaf0;", "color: #0f172a;")
content = content.replace("border-y border-slate-50", "border-y border-slate-100")
content = content.replace("border-y border-slate-100", "border-y border-slate-100")

# Write back
with open("d:\\1. Projects\\GitHub\\multi_language_detection\\frontend\\src\\components\\ComparisonEngine.tsx", "w", encoding="utf-8") as f:
    f.write(content)
