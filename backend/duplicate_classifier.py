from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re
import difflib

def is_codemix(text):
    return bool(re.search(r'[a-zA-Z]', text) and re.search(r'[\u0600-\u06FF\u0900-\u097F\u4e00-\u9fff]', text))

def is_typo(text1, text2):
    ratio = difflib.SequenceMatcher(None, text1, text2).ratio()
    return ratio > 0.85 and text1 != text2

def classify_pair(text1, text2, emb1, emb2, lang1="", lang2=""):
    if text1.strip().lower() == text2.strip().lower():
        return "exact"
    if is_typo(text1, text2):
        return "typo"
    if lang1 and lang2 and lang1 != lang2:
        return "cross_lang"
    if is_codemix(text1) or is_codemix(text2):
        return "codemix"
    return "semantic"
