import os
import re

with open("d:\\1. Projects\\GitHub\\multi_language_detection\\backend\\server.py", "r", encoding="utf-8") as f:
    content = f.read()

# Add is_cross_lingual calculation
old_code = """
                members.append({
                    "id": str(rec.get("parent_id", rec["id"])),
                    "name": str(rec["name"]),
                    "email": str(rec.get("email", "")),
                    "phone": str(rec.get("phone", "")),
                    "text": str(rec["text"]),
                    "language": str(rec["language"]) if rec["language"] else "Unknown",
                    "similarity": round(float(sim), 3)
                })
            
            if members:
                clusters.append({
                    "id": f"cluster-{cluster_id_counter}",
                    "anchor": {
"""

new_code = """
                members.append({
                    "id": str(rec.get("parent_id", rec["id"])),
                    "name": str(rec["name"]),
                    "email": str(rec.get("email", "")),
                    "phone": str(rec.get("phone", "")),
                    "text": str(rec["text"]),
                    "language": str(rec["language"]) if rec["language"] else "Unknown",
                    "similarity": round(float(sim), 3)
                })
            
            if members:
                anchor_lang = str(anchor_rec["language"]) if anchor_rec["language"] else "Unknown"
                is_cross_lingual = any(m["language"] != anchor_lang for m in members)
                
                clusters.append({
                    "id": f"cluster-{cluster_id_counter}",
                    "isCrossLingual": is_cross_lingual,
                    "anchor": {
"""

content = content.replace(old_code, new_code)

with open("d:\\1. Projects\\GitHub\\multi_language_detection\\backend\\server.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Backend isCrossLingual flag added.")
