"""
Test admin login credentials
"""

from app.models import User
from config import Config
from mongoengine import connect
from werkzeug.security import check_password_hash
import sys
import os

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Connect to MongoDB
try:
    connect(db='Nutrileaf', host=Config.MONGODB_URI)
    print(f"Connected to MongoDB: {Config.MONGODB_URI[:50]}...")
except Exception as e:
    print(f"MongoDB connection failed: {e}")
    sys.exit(1)

def test_admin_login():
    """Test admin login credentials"""
    try:
        # Find admin user
        admin_user = User.objects(email='admin@nutrilea.com').first()
        
        if not admin_user:
            print("Admin user not found!")
            return False
        
        print(f"Found admin user: {admin_user.name}")
        print(f"Email: {admin_user.email}")
        print(f"Role: {admin_user.role}")
        print(f"Status: {admin_user.status}")
        
        # Test password
        password = 'admin123'
        is_valid = check_password_hash(admin_user.password_hash, password)
        
        print(f"Password check result: {is_valid}")
        
        if is_valid:
            print("SUCCESS: Admin credentials are correct!")
            return True
        else:
            print("ERROR: Password verification failed!")
            return False
            
    except Exception as e:
        print(f"Error testing login: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    test_admin_login()
