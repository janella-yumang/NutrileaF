#!/usr/bin/env python3
"""
Database initialization script for Render deployment
This script creates tables and seeds initial data
"""

import os
import sys
from app import create_app, db
from app.models import User, Product, ProductCategory

def init_database():
    """Initialize database with tables and seed data"""
    app = create_app()
    
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        
        # Check if products already exist
        existing_products = Product.query.count()
        if existing_products > 0:
            print(f"Database already has {existing_products} products. Skipping seed.")
            return
        
        print("Seeding initial data...")
        
        # Create categories
        categories = [
            ProductCategory(name="Moringa Powder", description="Pure moringa leaf powder", status="active"),
            ProductCategory(name="Moringa Tea", description="Organic moringa tea bags", status="active"),
            ProductCategory(name="Moringa Capsules", description="Moringa supplements in capsule form", status="active"),
            ProductCategory(name="Moringa Oil", description="Cold-pressed moringa oil", status="active")
        ]
        
        for category in categories:
            db.session.add(category)
        
        db.session.commit()
        
        # Create products
        products = [
            Product(
                name="Premium Moringa Powder",
                category="Moringa Powder",
                price=299,
                originalPrice=399,
                quantity="250g",
                image="🌿",
                description="100% organic moringa leaf powder, rich in vitamins and antioxidants",
                benefits=["Boosts immunity", "Improves digestion", "Natural energy boost", "Rich in nutrients"],
                uses=["Smoothies", "Tea", "Cooking", "Face masks"],
                howToUse=["Mix 1 teaspoon in warm water", "Add to smoothies", "Sprinkle over food"]
            ),
            Product(
                name="Organic Moringa Tea Bags",
                category="Moringa Tea", 
                price=199,
                quantity="20 tea bags",
                image="🍵",
                description="Premium quality moringa tea bags for daily wellness",
                benefits=["Relaxing", "Antioxidant-rich", "Caffeine-free", "Supports metabolism"],
                uses=["Daily tea", "Evening relaxation", "After meals"],
                howToUse=["Steep for 3-5 minutes", "Enjoy hot or cold", "Add honey if desired"]
            ),
            Product(
                name="Moringa Capsules 60s",
                category="Moringa Capsules",
                price=399,
                originalPrice=499,
                quantity="60 capsules",
                image="💊",
                description="Convenient moringa supplements for daily nutrition",
                benefits=["Easy to take", "Standardized dosage", "No taste", "Quick absorption"],
                uses=["Daily supplement", "Travel convenience", "Post-workout recovery"],
                howToUse=["Take 2 capsules daily", "With meals", "Consistent timing recommended"]
            )
        ]
        
        for product in products:
            db.session.add(product)
        
        db.session.commit()
        
        print(f"Successfully created {len(categories)} categories and {len(products)} products")

if __name__ == "__main__":
    init_database()
