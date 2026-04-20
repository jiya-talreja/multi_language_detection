import os

with open("d:\\1. Projects\\GitHub\\multi_language_detection\\frontend\\src\\components\\ComparisonEngine.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Fix potential division by zero in useMemo
content = content.replace(
    "return clusters.map((c, i) => {",
    "if (!clusters || clusters.length === 0) return [];\n    return clusters.map((c, i) => {"
)

# 2. Scale the sphere radius to avoid overlapping for large datasets
content = content.replace(
    "const r = 3 + Math.random() * 1.5;",
    "const r = Math.sqrt(clusters.length) * 1.5 + 2;"
)

# 3. Constant Node Size
content = content.replace(
    "const r = 0.28 + cl.records.length * 0.045;",
    "const r = 0.45;"
)

# 4. Adjust sprite position for constant node size
content = content.replace(
    "sprite.position.set(cl.pos.x, cl.pos.y + r + 0.35, cl.pos.z);",
    "sprite.position.set(cl.pos.x, cl.pos.y + 0.8, cl.pos.z);"
)

# 5. Adjust ring size for constant node size
content = content.replace(
    "const ringGeo = new THREE.TorusGeometry(r + 0.12, 0.025, 8, 64);",
    "const ringGeo = new THREE.TorusGeometry(0.57, 0.025, 8, 64);"
)

with open("d:\\1. Projects\\GitHub\\multi_language_detection\\frontend\\src\\components\\ComparisonEngine.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("3D adjustments applied.")
