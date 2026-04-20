from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re
import difflib

def is_codemix(text):
    # simple heuristic: multiple scripts
    return bool(re.search(r'[a-zA-Z]', text) and re.search(r'[\u0600-\u06FF\u0900-\u097F\u4e00-\u9fff]', text))

def is_typo(text1, text2):
    # Use SequenceMatcher to find actual character-level similarity
    # A ratio > 0.85 means the strings are very similar character-by-character (like a typo)
    ratio = difflib.SequenceMatcher(None, text1, text2).ratio()
    return ratio > 0.85 and text1 != text2

def classify_pair(text1, text2, emb1, emb2):
    sim = cosine_similarity([emb1], [emb2])[0][0]

    if text1 == text2:
        return "exact"

    if is_typo(text1, text2):
        return "typo"

    if sim > 0.85:
        return "cross_lang"

    if sim > 0.75:
        return "cross_lang"

    if is_codemix(text1) or is_codemix(text2):
        return "codemix"

    return "noise"
