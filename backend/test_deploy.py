import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app import create_app
    app = create_app()
    print("✅ App created successfully!")
    
    # Test basic route
    with app.test_client() as client:
        response = client.get('/')
        print(f"✅ Root route works: {response.status_code}")
        
    # Test auth route
    with app.test_client() as client:
        response = client.get('/api/auth')
        print(f"✅ Auth route works: {response.status_code}")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
