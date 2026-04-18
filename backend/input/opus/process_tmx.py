import xml.etree.ElementTree as ET
import pandas as pd # pyright: ignore[reportMissingModuleSource]
files = [
    ("en-ja.tmx", "ja"),
    ("en-hi.tmx", "hi")
]
records = []
id_counter = 1
group_id_counter = 1
english_to_group = {}
def process_tmx(file_path, target_lang):
    global id_counter, group_id_counter
    tree = ET.parse(file_path)
    root = tree.getroot()
    for tu in root.iter("tu"):
        texts = {}
        for tuv in tu.findall("tuv"):
            lang = tuv.attrib.get("{http://www.w3.org/XML/1998/namespace}lang")
            seg = tuv.find("seg")
            if seg is not None and seg.text:
                texts[lang] = seg.text.strip()
        if "en" in texts and target_lang in texts:
            en_text = texts["en"]
            other_text = texts[target_lang]
            if en_text in english_to_group:
                group_id = english_to_group[en_text]
            else:
                group_id = group_id_counter
                english_to_group[en_text] = group_id
                records.append({
                    "id": id_counter,
                    "text": en_text,
                    "language": "en",
                    "group_id": group_id,
                    "source":"opus"
                })
                id_counter += 1
                group_id_counter += 1
            records.append({
                "id": id_counter,
                "text": other_text,
                "language": target_lang,
                "group_id": group_id,
                "source":"opus"
            })
            id_counter += 1
for file_path, lang in files:
    process_tmx(file_path, lang)
df = pd.DataFrame(records)
df.to_csv("tatoeba_merged.csv", index=False)


print("Done. Combined dataset created: tatoeba_merged.csv")
