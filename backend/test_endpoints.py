#!/usr/bin/env python3
"""
Test script to verify all API endpoints are working correctly
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_endpoint(endpoint, method="GET", data=None, headers=None):
    """Test a single endpoint"""
    try:
        url = f"{BASE_URL}{endpoint}"
        print(f"\nTesting {method} {endpoint}")
        
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers)
        elif method == "OPTIONS":
            response = requests.options(url, headers=headers)
        
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        # Try to parse JSON
        try:
            json_data = response.json()
            print(f"Response: {json.dumps(json_data, indent=2)}")
        except:
            print(f"Response (raw): {response.text[:200]}...")
            
        return response.status_code == 200
        
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection failed - server not running on {BASE_URL}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("🧪 Testing NutriLeaf API Endpoints")
    print("=" * 50)
    
    # Test basic endpoints
    tests = [
        ("/", "GET"),
        ("/auth/login", "OPTIONS"),
        ("/auth/verify", "OPTIONS"), 
        ("/api/products/", "OPTIONS"),
        ("/api/products/categories", "OPTIONS"),
        ("/api/products/", "GET"),
        ("/api/products/categories", "GET"),
    ]
    
    results = []
    
    for endpoint, method in tests:
        success = test_endpoint(endpoint, method)
        results.append((endpoint, method, success))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    passed = 0
    for endpoint, method, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {method} {endpoint}")
        if success:
            passed += 1
    
    print(f"\nResults: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("🎉 All tests passed! Your API is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the server logs above.")

if __name__ == "__main__":
    main()
