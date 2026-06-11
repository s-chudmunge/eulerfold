from ddgs import DDGS
import json

def test_duckduckgo_search():
    print("Initializing DuckDuckGo Search...")
    search_query = "FastAPI React tutorial"
    print(f"Testing Query: '{search_query}'\n")
    
    try:
        with DDGS() as ddgs:
            # max_results=3 just like in the backend logic
            results = list(ddgs.text(search_query, max_results=3))
            
        if results:
            print("✅ Search Successful! Found the following references:")
            for i, result in enumerate(results, 1):
                print(f"\n[{i}] Title: {result['title']}")
                print(f"    URL: {result['href']}")
        else:
            print("❌ Search completed but returned 0 results.")
            
    except Exception as e:
        print(f"❌ Search Failed with error: {e}")

if __name__ == "__main__":
    test_duckduckgo_search()
