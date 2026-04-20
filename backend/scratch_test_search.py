import requests
import json
import os

BASE_URL = "http://localhost:8000"

def test_search():
    print("1. Uploading file to /detect...")
    files = {'file': open('test_data.csv', 'rb')}
    data = {'eps': '0.3'}
    
    try:
        response = requests.post(f"{BASE_URL}/detect", files=files, data=data)
        if response.status_code != 200:
            print(f"Error in /detect: {response.status_code}")
            print(response.text)
            return
        
        detect_results = response.json()
        print(f"Success! Found {len(detect_results.get('clusters', []))} clusters.")
        
        # 2. Search
        query = "Greetings"
        print(f"\n2. Searching for '{query}'...")
        search_payload = {"query": query}
        search_response = requests.post(f"{BASE_URL}/search", json=search_payload)
        
        if search_response.status_code != 200:
            print(f"Error in /search: {search_response.status_code}")
            print(search_response.text)
            return
        
        search_results = search_response.json()
        print(f"Search results: {json.dumps(search_results, indent=2)}")
        
        if search_results.get("match"):
            print("SUCCESS: Search button functionality verified.")
        else:
            print("FAILURE: Search returned no match.")
            
    except Exception as e:
        print(f"Exception: {str(e)}")

if __name__ == "__main__":
    test_search()
