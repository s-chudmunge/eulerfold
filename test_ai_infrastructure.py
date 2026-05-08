import requests
import time
import json
import sys

BASE_URL = "http://localhost:8080"

def test_endpoint(name, method, path, payload=None, headers=None):
    print(f"\n[TESTING] {name}...")
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{path}", headers=headers)
        else:
            response = requests.post(f"{BASE_URL}{path}", json=payload, headers=headers)
        
        print(f"Status: {response.status_code}")
        if response.status_code < 300:
            print(f"Success! Response: {json.dumps(response.json(), indent=2)[:200]}...")
            return True
        else:
            print(f"Failed! Error: {response.text}")
            return False
    except Exception as e:
        print(f"Connection Error: {e}")
        return False

def test_rate_limiter():
    print("\n[TESTING] Rate Limiter (Burst Protection)...")
    print("Spamming the health-check to trigger global monitor...")
    
    blocked = False
    for i in range(10):
        res = requests.get(f"{BASE_URL}/health/warm")
        if res.status_code == 429:
            print(f"Success! Rate limiter kicked in at request {i+1}")
            blocked = True
            break
        sys.stdout.write(".")
        sys.stdout.flush()
        time.sleep(0.05)
    
    if not blocked:
        print("\nNote: Global limit not reached yet (limit is 60/min). Local user limit is tighter (20/min).")

def main():
    print("=== EulerFold AI Infrastructure Validation ===")
    
    # 1. Check if backend is alive
    if not test_endpoint("Backend Heartbeat", "GET", "/health"):
        print("Backend is not running on 8080. Please run ./run-backend.sh first.")
        return

    # 2. Test the new Google GenAI initialization via Deep Health
    # (Deep health tests Supabase and Redis connectivity)
    test_endpoint("Deep System Health", "GET", "/health/deep")

    # 3. Test Public Explore (High Traffic Endpoint)
    test_endpoint("Explore Roadmaps (Public)", "GET", "/explore?limit=1")

    # 4. Instructions for Auth-Protected AI Tests
    print("\n" + "="*50)
    print("AUTH-PROTECTED AI TESTS")
    print("="*50)
    print("To test Roadmap Generation and the Audit Senate, you need a Bearer token.")
    print("1. Open EulerFold in your browser.")
    print("2. Open DevTools (F12) -> Network tab.")
    print("3. Refresh and find a request to /api/roadmaps.")
    print("4. Copy the 'Authorization' header value.")
    print("\nThen run this script again with the token:")
    print("python3 test_ai_infrastructure.py <YOUR_TOKEN>")
    
    if len(sys.argv) > 1:
        token = sys.argv[1]
        headers = {"Authorization": f"Bearer {token}" if not token.startswith("Bearer") else token}
        
        # Test 5: Manual Build (Uses new Rate Limiter @monitor_query)
        test_endpoint("Manual Build Project (Rate Limited)", "POST", "/roadmaps/manual-build", 
                      payload={
                          "title": "Scaling Test",
                          "subject": "Infrastructure",
                          "depth": "High",
                          "description": "Validating the viral-ready infrastructure."
                      }, headers=headers)

        # Test 6: Audit Senate (Uses Parallel AI Gathering)
        # Note: Requires a roadmap_id. Adjust as needed.
        print("\n[INFO] Skipping Audit Senate test (requires valid roadmap_id).")
    
    # 5. Rate Limiter Test
    test_rate_limiter()

if __name__ == "__main__":
    main()
