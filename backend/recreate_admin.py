"""
Recreate admin user with correct password
"""

from app.models import User
from config import Config
from mongoengine import connect
from werkzeug.security import generate_password_hash
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

def recreate_admin():
    """Recreate admin user with correct password"""
    try:
        # Delete existing admin user if exists
        existing_admin = User.objects(email='admin@nutrilea.com').first()
        if existing_admin:
            print("Deleting existing admin user...")
            existing_admin.delete()
        
        # Create new admin user
        password = 'admin123'
        password_hash = generate_password_hash(password)
        
        admin_user = User(
            name='Admin User',
            email='admin@nutrilea.com',
            phone='+63 912 345 6789',
            address='Admin Office, Nutrilea HQ',
            password_hash=password_hash,
            role='admin',
            status='active'
        )
        
        admin_user.save()
        
        print("Admin user recreated successfully!")
        print("=" * 50)
        print("ADMIN LOGIN CREDENTIALS:")
        print(f"Email: admin@nutrilea.com")
        print(f"Password: {password}")
        print("=" * 50)
        
        # Test the new credentials
        from werkzeug.security import check_password_hash
        test_result = check_password_hash(admin_user.password_hash, password)
        print(f"Password verification test: {test_result}")
        
        if test_result:
            print("SUCCESS: Admin credentials are working!")
        else:
            print("ERROR: Password verification still failed!")
        
    except Exception as e:
        print(f"Error recreating admin: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    recreate_admin()
