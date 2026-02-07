#!/usr/bin/env python
"""
Complete setup script for PostgreSQL on Render.
Runs all initialization steps in one go.

Usage:
    python setup_all.py
"""

import os
import sys
import subprocess

# Render PostgreSQL credentials
DATABASE_URL = 'postgresql://nutrileaf_user:D4rXxZMUhfX2eC2nRbSeKxUTaG1bzTzg@dpg-d5uvupchg0os73a3ekdg-a.virginia-postgres.render.com/nutrileaf'

# Set environment variable
os.environ['DATABASE_URL'] = DATABASE_URL

print("=" * 60)
print("NUTRILEA - PostgreSQL Setup")
print("=" * 60)

# Step 1: Test connection
print("\n[1/3] Testing PostgreSQL connection...")
print(f"Database: nutrileaf")
print(f"Host: dpg-d5uvupchg0os73a3ekdg-a.virginia-postgres.render.com")

try:
    from flask import Flask
    from flask_sqlalchemy import SQLAlchemy
    
    db = SQLAlchemy()
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    
    with app.app_context():
        db.session.execute(db.text('SELECT 1'))
    print("✓ Connection successful!\n")
except Exception as e:
    print(f"✗ Connection failed: {e}")
    print("\nTroubleshooting:")
    print("  - Check your internet connection")
    print("  - Verify Render PostgreSQL service is running")
    print("  - Try connecting with psql:")
    print(f"    psql '{DATABASE_URL}'")
    sys.exit(1)

# Step 2: Create tables
print("[2/3] Creating database tables...")
try:
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from flask import Flask
    from app.models import db, Product, Order, User, ForumThread, ForumReply
    
    # Create a minimal Flask app just for setup
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    
    with app.app_context():
        db.create_all()
    print("✓ Tables created: products, orders, users, forum_threads, forum_replies\n")
except Exception as e:
    print(f"✗ Failed to create tables: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Step 3: Seed products
print("[3/3] Seeding products...")
try:
    products_data = [
        {'name': 'Fresh Moringa Leaves Bundle', 'category': 'fresh', 'price': 349, 'original_price': 450, 'image': '🌿', 'description': 'Fresh, organic moringa leaves harvested daily.', 'benefits': ['100% Organic', 'Rich in Iron', 'Fresh Picked', 'No Pesticides'], 'quantity': '250g'},
        {'name': 'Moringa Powder', 'category': 'powder', 'price': 599, 'original_price': None, 'image': '✨', 'description': 'Pure moringa leaf powder, finely ground.', 'benefits': ['High in Protein', 'Energy Boost', 'Easy to Use', 'Long Shelf Life'], 'quantity': '200g'},
        {'name': 'Moringa Tea Blend', 'category': 'tea', 'price': 279, 'original_price': 350, 'image': '🍵', 'description': 'Premium moringa tea blend with natural herbs.', 'benefits': ['Detox Support', 'Antioxidants', 'Calming', 'Great Taste'], 'quantity': '20 Tea Bags', 'uses': ['Daily detox', 'Gentle digestion support', 'Relaxation in evenings'], 'how_to_use': ['Steep 1 tea bag in hot water for 5-7 minutes', 'Optional: add honey or lemon'], 'reviews': [{'author': 'Ari', 'rating': 5, 'comment': 'Great flavor and very calming.'}, {'author': 'Ben', 'rating': 4, 'comment': 'Helps with digestion, mild taste.'}]},
        {'name': 'Organic Moringa Capsules', 'category': 'supplements', 'price': 699, 'original_price': None, 'image': '💊', 'description': 'Convenient daily supplement. Each capsule contains pure moringa leaf extract.', 'benefits': ['Nutrient Dense', 'Convenient', 'Vegan', 'Daily Wellness'], 'quantity': '90 Capsules'},
        {'name': 'Moringa Oil', 'category': 'oils', 'price': 899, 'original_price': None, 'image': '🫧', 'description': 'Cold-pressed moringa seed oil. Perfect for skincare, haircare, and culinary use.', 'benefits': ['Skin Care', 'Hair Health', 'Pure Extract', 'Multi-Use'], 'quantity': '100ml'},
        {'name': 'Moringa Honey Blend', 'category': 'specialty', 'price': 449, 'original_price': 550, 'image': '🍯', 'description': 'Raw honey infused with moringa.', 'benefits': ['Natural Sweetener', 'Energy Rich', 'Immune Support', 'Raw & Unpasteurized'], 'quantity': '250g', 'uses': ['Natural sweetener', 'Spread on toast', 'Add to tea for energy'], 'how_to_use': ['Use 1–2 teaspoons in beverages or spread as desired'], 'reviews': [{'author': 'Clara', 'rating': 5, 'comment': 'Lovely blend, very natural.'}]},
        {'name': 'Moringa Smoothie Mix', 'category': 'mixes', 'price': 549, 'original_price': None, 'image': '🥤', 'description': 'Ready-to-blend moringa mix with fruits and superfoods.', 'benefits': ['Complete Nutrition', 'Easy to Use', 'Tasty', 'Convenient'], 'quantity': '400g'},
        {'name': 'Dried Moringa Leaves', 'category': 'fresh', 'price': 399, 'original_price': None, 'image': '🌱', 'description': 'Air-dried moringa leaves. Ideal for making tea, soups, or adding to cooking.', 'benefits': ['Long Lasting', 'Full Nutrition', 'No Processing', 'Eco-Friendly'], 'quantity': '200g'}
    ]
    
    with app.app_context():
        # Check if products already exist
        existing = db.session.query(Product).first()
        if existing:
            print("ℹ️  Products already in database. Skipping seed.")
        else:
            for p in products_data:
                product = Product(**p)
                db.session.add(product)
            db.session.commit()
            print(f"✓ Seeded {len(products_data)} products")
            for p in products_data:
                print(f"  - {p['name']}")

except Exception as e:
    print(f"✗ Failed to seed products: {e}")
    sys.exit(1)

print("\n" + "=" * 60)
print("✓ Setup Complete!")
print("=" * 60)
print("\nYou can now:")
print("1. Run your backend: python server.py")
print("2. Run your frontend: npm start (in frontend directory)")
print("3. Test checkout on http://localhost:3002")
print("\nDatabase info:")
print("  - Host: dpg-d5uvupchg0os73a3ekdg-a.virginia-postgres.render.com")
print("  - Database: nutrileaf")
print("  - Tables: products, orders, users")
print("\nTo view data with psql:")
print(f"  psql '{DATABASE_URL}'")
print("  SELECT * FROM products;")
print("=" * 60)
