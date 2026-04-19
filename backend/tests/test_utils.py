import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from utils import clean_text

def test_clean_text_basic():
    assert clean_text("Hello World") == "hello world"

def test_clean_text_unicode():
    assert clean_text("Héllo  World") == "héllo world"

def test_clean_text_html():
    assert clean_text("<b>Hello</b> <i>World</i>!") == "hello world !"

def test_clean_text_whitespace():
    assert clean_text("  Hello \t\n World  ") == "hello world"

def test_clean_text_empty():
    assert clean_text(None) == ""
    assert clean_text("") == ""
