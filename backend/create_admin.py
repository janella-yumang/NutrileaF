"""
Create admin user for Nutrilea app.
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
    print(f"✅ Connected to MongoDB: {Config.MONGODB_URI[:50]}...")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    sys.exit(1)

def create_admin_user():
    """Create an admin user."""
    try:
        # Check if admin user already exists
        existing_admin = User.objects(email='admin@nutrilea.com').first()
        if existing_admin:
            print("❌ Admin user already exists!")
            print(f"Email: admin@nutrilea.com")
            print("Password: admin123")
            return
        
        # Create admin user
        admin_user = User(
            name='Admin User',
            email='admin@nutrilea.com',
            phone='+63 912 345 6789',
            address='Admin Office, Nutrilea HQ',
            password_hash=generate_password_hash('admin123'),
            role='admin',
            status='active'
        )
        
        admin_user.save()
        
        print("✅ Admin user created successfully!")
        print("=" * 50)
        print("ADMIN LOGIN CREDENTIALS:")
        print(f"Email: admin@nutrilea.com")
        print(f"Password: admin123")
        print("=" * 50)
        print("⚠️  Please change the password after first login!")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    create_admin_user()
