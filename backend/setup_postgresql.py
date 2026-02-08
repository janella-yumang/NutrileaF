"""
Setup PostgreSQL database with all tables and seed data.
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.models import db, Product, ProductCategory, User, Order, ForumThread, ForumReply, Review

def setup_database():
    """Create all tables and seed initial data."""
    app = create_app()
    
    with app.app_context():
        print("=== Setting up PostgreSQL Database ===")
        
        # Create all tables
        db.create_all()
        print("✓ All tables created successfully")
        
        # Seed categories
        if ProductCategory.query.count() == 0:
            categories_data = [
                {'name': 'Fresh Leaves', 'description': 'Fresh organic moringa leaves', 'status': 'active'},
                {'name': 'Powder', 'description': 'Finely ground moringa leaf powder', 'status': 'active'},
                {'name': 'Tea', 'description': 'Moringa tea blends and infusions', 'status': 'active'},
                {'name': 'Supplements', 'description': 'Moringa capsules and dietary supplements', 'status': 'active'},
                {'name': 'Oils', 'description': 'Cold-pressed moringa seed oils', 'status': 'active'},
                {'name': 'Specialty', 'description': 'Unique moringa products and blends', 'status': 'active'},
                {'name': 'Mixes', 'description': 'Ready-to-blend moringa mixes', 'status': 'active'}
            ]
            
            for cat_data in categories_data:
                category = ProductCategory(**cat_data)
                db.session.add(category)
            
            db.session.commit()
            print(f"✓ {len(categories_data)} categories seeded")
        
        # Seed products
        if Product.query.count() == 0:
            products_data = [
                {
                    'name': 'Fresh Moringa Leaves Bundle',
                    'category': 'Fresh Leaves',
                    'price': 349.0,
                    'original_price': 450.0,
                    'image': ['🌿'],
                    'description': 'Fresh, organic moringa leaves harvested daily. Perfect for salads, smoothies, and traditional cooking.',
                    'benefits': ['100% Organic', 'Rich in Iron', 'Fresh Picked', 'No Pesticides'],
                    'quantity': '250g',
                    'uses': [],
                    'how_to_use': [],
                    'reviews': []
                },
                {
                    'name': 'Moringa Powder',
                    'category': 'Powder',
                    'price': 599.0,
                    'original_price': None,
                    'image': ['✨'],
                    'description': 'Pure moringa leaf powder, finely ground. Easy to mix into smoothies, soups, and beverages.',
                    'benefits': ['High in Protein', 'Energy Boost', 'Easy to Use', 'Long Shelf Life'],
                    'quantity': '200g',
                    'uses': [],
                    'how_to_use': [],
                    'reviews': []
                },
                {
                    'name': 'Moringa Tea Blend',
                    'category': 'Tea',
                    'price': 279.0,
                    'original_price': 350.0,
                    'image': ['🍵'],
                    'description': 'Premium moringa tea blend with natural herbs. Smooth, earthy flavor with wellness benefits.',
                    'benefits': ['Detox Support', 'Antioxidants', 'Calming', 'Great Taste'],
                    'quantity': '20 Tea Bags',
                    'uses': ['Daily detox', 'Gentle digestion support', 'Relaxation in evenings'],
                    'how_to_use': ['Steep 1 tea bag in hot water for 5-7 minutes', 'Optional: add honey or lemon'],
                    'reviews': [
                        {'author': 'Ari', 'rating': 5, 'comment': 'Great flavor and very calming.'},
                        {'author': 'Ben', 'rating': 4, 'comment': 'Helps with digestion, mild taste.'}
                    ]
                }
            ]
            
            for prod_data in products_data:
                product = Product(**prod_data)
                db.session.add(product)
            
            db.session.commit()
            print(f"✓ {len(products_data)} products seeded")
        
        # Create admin user
        if User.query.count() == 0:
            from werkzeug.security import generate_password_hash
            admin_user = User(
                email='admin@nutrilea.com',
                name='Admin User',
                password_hash=generate_password_hash('admin123'),
                role='admin',
                status='active'
            )
            db.session.add(admin_user)
            db.session.commit()
            print("✓ Admin user created (admin@nutrilea.com / admin123)")
        
        # Show final counts
        print("\n=== Database Summary ===")
        print(f"Categories: {ProductCategory.query.count()}")
        print(f"Products: {Product.query.count()}")
        print(f"Users: {User.query.count()}")
        print(f"Orders: {Order.query.count()}")
        print(f"Forum Threads: {ForumThread.query.count()}")
        print(f"Reviews: {Review.query.count()}")
        
        print("\n✅ PostgreSQL database setup complete!")

if __name__ == '__main__':
    setup_database()
