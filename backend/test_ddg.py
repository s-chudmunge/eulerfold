import asyncio
from ddgs import DDGS

def test_duckduckgo_search():
    query = "Quantum mechanics and spacetime"
    print(f"Testing DuckDuckGo search for query: '{query}'\n")
    
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=3))
            
            if not results:
                print("Search succeeded but returned no results.")
                return

            print(f"Found {len(results)} results:\n")
            for i, res in enumerate(results, 1):
                print(f"Result {i}:")
                print(f"Title: {res.get('title')}")
                print(f"Href: {res.get('href')}")
                print(f"Body: {res.get('body')}\n")
                
    except Exception as e:
        print(f"Error during DuckDuckGo search: {e}")

if __name__ == "__main__":
    test_duckduckgo_search()
