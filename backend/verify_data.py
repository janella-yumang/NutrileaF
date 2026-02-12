#!/usr/bin/env python3
"""
Quick verification that MongoDB data is properly stored
"""

import os
from dotenv import load_dotenv
from mongoengine import connect, disconnect

# Load environment variables
load_dotenv()

# Connect to MongoDB
mongodb_uri = os.environ.get('DATABASE_URL') or os.environ.get('MONGODB_URI')
disconnect()
connect(db='nutrilea_db', host=mongodb_uri)

from app.models import User, Product, ProductCategory

def verify_data():
    """Verify data exists in MongoDB"""
    print("🔍 Verifying MongoDB Data...")
    print("=" * 40)
    
    try:
        # Check users
        users = User.objects()
        print(f"👥 Users: {len(users)}")
        for user in users:
            print(f"   - {user.name} ({user.email})")
        
        # Check products
        products = Product.objects()
        print(f"\n🛍️  Products: {len(products)}")
        for product in products:
            print(f"   - {product.name}: ₱{product.price}")
        
        # Check categories
        categories = ProductCategory.objects()
        print(f"\n📁 Categories: {len(categories)}")
        for category in categories:
            print(f"   - {category.name}")
        
        print("\n✅ Data verification complete!")
        print("🌐 Your MongoDB database now contains test data.")
        print("📱 Refresh your application to see the data.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    
    finally:
        disconnect()

if __name__ == "__main__":
    verify_data()
