"""
Seed the products table with sample Moringa Store products.

Usage:
    python seed_products.py
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config
from app.models import db, Product

def seed_products():
    """Insert sample products into the database."""
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config['SQLALCHEMY_DATABASE_URI'] = app.config.get('DATABASE_URI', 'sqlite:///data/database.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)

    products_data = [
        {
            'name': 'Fresh Moringa Leaves Bundle',
            'category': 'fresh',
            'price': 349,
            'original_price': 450,
            'image': '🌿',
            'description': 'Fresh, organic moringa leaves harvested daily. Perfect for salads, smoothies, and traditional cooking.',
            'benefits': ['100% Organic', 'Rich in Iron', 'Fresh Picked', 'No Pesticides'],
            'quantity': '250g',
            'uses': None,
            'how_to_use': None,
            'reviews': None
        },
        {
            'name': 'Moringa Powder',
            'category': 'powder',
            'price': 599,
            'original_price': None,
            'image': '✨',
            'description': 'Pure moringa leaf powder, finely ground. Easy to mix into smoothies, soups, and beverages.',
            'benefits': ['High in Protein', 'Energy Boost', 'Easy to Use', 'Long Shelf Life'],
            'quantity': '200g',
            'uses': None,
            'how_to_use': None,
            'reviews': None
        },
        {
            'name': 'Moringa Tea Blend',
            'category': 'tea',
            'price': 279,
            'original_price': 350,
            'image': '🍵',
            'description': 'Premium moringa tea blend with natural herbs. Smooth, earthy flavor with wellness benefits.',
            'benefits': ['Detox Support', 'Antioxidants', 'Calming', 'Great Taste'],
            'quantity': '20 Tea Bags',
            'uses': ['Daily detox', 'Gentle digestion support', 'Relaxation in evenings'],
            'how_to_use': ['Steep 1 tea bag in hot water for 5-7 minutes', 'Optional: add honey or lemon'],
            'reviews': [
                {'author': 'Ari', 'rating': 5, 'comment': 'Great flavor and very calming.'},
                {'author': 'Ben', 'rating': 4, 'comment': 'Helps with digestion, mild taste.'}
            ]
        },
        {
            'name': 'Organic Moringa Capsules',
            'category': 'supplements',
            'price': 699,
            'original_price': None,
            'image': '💊',
            'description': 'Convenient daily supplement. Each capsule contains pure moringa leaf extract.',
            'benefits': ['Nutrient Dense', 'Convenient', 'Vegan', 'Daily Wellness'],
            'quantity': '90 Capsules',
            'uses': None,
            'how_to_use': None,
            'reviews': None
        },
        {
            'name': 'Moringa Oil',
            'category': 'oils',
            'price': 899,
            'original_price': None,
            'image': '🫧',
            'description': 'Cold-pressed moringa seed oil. Perfect for skincare, haircare, and culinary use.',
            'benefits': ['Skin Care', 'Hair Health', 'Pure Extract', 'Multi-Use'],
            'quantity': '100ml',
            'uses': None,
            'how_to_use': None,
            'reviews': None
        },
        {
            'name': 'Moringa Honey Blend',
            'category': 'specialty',
            'price': 449,
            'original_price': 550,
            'image': '🍯',
            'description': 'Raw honey infused with moringa. Perfect sweetener for tea or as a natural energy boost.',
            'benefits': ['Natural Sweetener', 'Energy Rich', 'Immune Support', 'Raw & Unpasteurized'],
            'quantity': '250g',
            'uses': ['Natural sweetener', 'Spread on toast', 'Add to tea for energy'],
            'how_to_use': ['Use 1–2 teaspoons in beverages or spread as desired'],
            'reviews': [{'author': 'Clara', 'rating': 5, 'comment': 'Lovely blend, very natural.'}]
        },
        {
            'name': 'Moringa Smoothie Mix',
            'category': 'mixes',
            'price': 549,
            'original_price': None,
            'image': '🥤',
            'description': 'Ready-to-blend moringa mix with fruits and superfoods. Quick nutritious smoothies anytime.',
            'benefits': ['Complete Nutrition', 'Easy to Use', 'Tasty', 'Convenient'],
            'quantity': '400g',
            'uses': None,
            'how_to_use': None,
            'reviews': None
        },
        {
            'name': 'Dried Moringa Leaves',
            'category': 'fresh',
            'price': 399,
            'original_price': None,
            'image': '🌱',
            'description': 'Air-dried moringa leaves. Ideal for making tea, soups, or adding to cooking.',
            'benefits': ['Long Lasting', 'Full Nutrition', 'No Processing', 'Eco-Friendly'],
            'quantity': '200g',
            'uses': None,
            'how_to_use': None,
            'reviews': None
        }
    ]

    with app.app_context():
        try:
            # Check if products already exist
            existing_count = Product.query.count()
            if existing_count > 0:
                print(f"ℹ️  Database already has {existing_count} products. Skipping seed.")
                return

            for p in products_data:
                product = Product(**p)
                db.session.add(product)

            db.session.commit()
            print(f"✓ {len(products_data)} products seeded successfully!")
            print("\nProducts added:")
            for p in products_data:
                print(f"  - {p['name']} (₱{p['price']})")

        except Exception as e:
            db.session.rollback()
            print(f"✗ Error seeding products: {e}")

if __name__ == '__main__':
    seed_products()
