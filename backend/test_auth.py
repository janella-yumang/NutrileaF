import requests
import json

BASE_URL = "http://127.0.0.1:5000/api"

# Test 1: Register a new user
print("=" * 50)
print("TEST 1: Register a new user")
print("=" * 50)

register_data = {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "09123456789",
    "address": "123 Main Street",
    "password": "password123"
}

response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

if response.status_code == 201:
    token = response.json().get("token")
    print("\n✓ Registration successful!")
    
    # Test 2: Login with the same user
    print("\n" + "=" * 50)
    print("TEST 2: Login with registered user")
    print("=" * 50)
    
    login_data = {
        "email": "john@example.com",
        "password": "password123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        login_token = response.json().get("token")
        print("\n✓ Login successful!")
        
        # Test 3: Verify token
        print("\n" + "=" * 50)
        print("TEST 3: Verify JWT token")
        print("=" * 50)
        
        headers = {"Authorization": f"Bearer {login_token}"}
        response = requests.get(f"{BASE_URL}/auth/verify", headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("\n✓ Token verification successful!")
        else:
            print("\n✗ Token verification failed!")
    else:
        print("\n✗ Login failed!")
else:
    print("\n✗ Registration failed!")

# Test 4: Try to register with same email (should fail)
print("\n" + "=" * 50)
print("TEST 4: Register duplicate email (should fail)")
print("=" * 50)

response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

# Test 5: Try to login with wrong password
print("\n" + "=" * 50)
print("TEST 5: Login with wrong password (should fail)")
print("=" * 50)

wrong_login = {
    "email": "john@example.com",
    "password": "wrongpassword"
}

response = requests.post(f"{BASE_URL}/auth/login", json=wrong_login)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

print("\n" + "=" * 50)
print("All tests completed!")
print("=" * 50)
