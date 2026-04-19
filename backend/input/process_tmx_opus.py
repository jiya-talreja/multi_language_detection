import xml.etree.ElementTree as ET
import pandas as pd
import argparse
import pathlib

def process_tmx(file_path, target_lang, id_counter, group_id_counter, english_to_group, records):
    try:
        tree = ET.parse(file_path)
    except FileNotFoundError:
        print(f"Warning: File {file_path} not found.")
        return id_counter, group_id_counter

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
                    "name": en_text,
                    "description": "",
                    "language": "en",
                    "group_id": group_id,
                    "source":"opus"
                })
                id_counter += 1
                group_id_counter += 1
            records.append({
                "id": id_counter,
                "name": other_text,
                "description": "",
                "language": target_lang,
                "group_id": group_id,
                "source":"opus"
            })
            id_counter += 1
            
    return id_counter, group_id_counter

def main():
    parser = argparse.ArgumentParser(description="Parse TMX files to CSV")
    parser.add_argument("--files", nargs="+", help="Format: file.tmx,lang file2.tmx,lang2", default=["en-ja.tmx,ja", "en-hi.tmx,hi"])
    parser.add_argument("--output", type=str, default="tatoeba_merged.csv", help="Output CSV file path")
    args = parser.parse_args()

    records = []
    id_counter = 1
    group_id_counter = 1
    english_to_group = {}

    for file_info in args.files:
        if "," not in file_info:
            print(f"Skipping {file_info}, format should be filename.tmx,lang")
            continue
        file_path, lang = file_info.split(",", 1)
        
        # We assume the files might be in the same dir or input/
        if not pathlib.Path(file_path).exists() and pathlib.Path("input") / file_path:
            file_path = str(pathlib.Path("input") / file_path)

        print(f"Processing {file_path} for language {lang}...")
        id_counter, group_id_counter = process_tmx(file_path, lang, id_counter, group_id_counter, english_to_group, records)

    if records:
        df = pd.DataFrame(records)
        df.to_csv(args.output, index=False)
        print(f"Done. Combined dataset created: {args.output} with {len(df)} records.")
    else:
        print("No records found to output.")

if __name__ == "__main__":
    main()
