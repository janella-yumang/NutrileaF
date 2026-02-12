"""
Inspect database contents - show all tables and data
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.models import db, Product, ProductCategory, User, Order, ForumThread, ForumReply, Review

def inspect_database():
    """Show all database contents."""
    app = create_app()
    
    with app.app_context():
        print("=" * 60)
        print("🔍 DATABASE INSPECTION")
        print("=" * 60)
        print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI'][:50]}...")
        print()
        
        # Check each table
        print("📊 TABLE COUNTS:")
        print(f"  Products: {Product.query.count()}")
        print(f"  Categories: {ProductCategory.query.count()}")
        print(f"  Users: {User.query.count()}")
        print(f"  Orders: {Order.query.count()}")
        print(f"  Forum Threads: {ForumThread.query.count()}")
        print(f"  Forum Replies: {ForumReply.query.count()}")
        print(f"  Reviews: {Review.query.count()}")
        print()
        
        # Show Categories
        print("📂 CATEGORIES:")
        categories = ProductCategory.query.all()
        if categories:
            for cat in categories:
                print(f"  ID: {cat.id} | Name: {cat.name} | Status: {cat.status}")
                if cat.description:
                    print(f"    └─ Description: {cat.description}")
                if cat.image:
                    print(f"    └─ Image: {cat.image}")
        else:
            print("  ❌ No categories found")
        print()
        
        # Show Products
        print("🛍️  PRODUCTS:")
        products = Product.query.all()
        if products:
            for prod in products:
                print(f"  ID: {prod.id} | Name: {prod.name}")
                print(f"    └─ Category: {prod.category} | Price: ₱{prod.price}")
                if prod.original_price:
                    print(f"    └─ Original Price: ₱{prod.original_price}")
                if prod.quantity:
                    print(f"    └─ Quantity: {prod.quantity}")
                if prod.image:
                    print(f"    └─ Images: {prod.image}")
                if prod.description:
                    desc = prod.description[:100] + "..." if len(prod.description) > 100 else prod.description
                    print(f"    └─ Description: {desc}")
                if prod.benefits:
                    print(f"    └─ Benefits: {prod.benefits}")
                print()
        else:
            print("  ❌ No products found")
        print()
        
        # Show Users
        print("👥 USERS:")
        users = User.query.all()
        if users:
            for user in users:
                print(f"  ID: {user.id} | Email: {user.email}")
                print(f"    └─ Name: {user.name} | Role: {user.role} | Status: {user.status}")
        else:
            print("  ❌ No users found")
        print()
        
        # Show Orders
        print("📦 ORDERS:")
        orders = Order.query.all()
        if orders:
            for order in orders:
                print(f"  ID: {order.id} | User: {order.user_name}")
                print(f"    └─ Status: {order.status} | Total: ₱{order.total_amount}")
        else:
            print("  ❌ No orders found")
        print()
        
        print("=" * 60)
        print("✅ Database inspection complete!")
        print("=" * 60)

if __name__ == '__main__':
    inspect_database()
