"""
Helper script to initialize database and create tables.
Run this once to set up your PostgreSQL schema.

Usage:
    python models_setup.py
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config
from datetime import datetime

db = SQLAlchemy()

# Models
class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True)
    category = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    original_price = db.Column(db.Float)
    description = db.Column(db.Text)
    image = db.Column(db.String(50))  # emoji or url
    quantity = db.Column(db.String(100))  # e.g., "250g"
    benefits = db.Column(db.JSON)  # list of benefits
    uses = db.Column(db.JSON)  # list of uses
    how_to_use = db.Column(db.JSON)  # step-by-step instructions
    reviews = db.Column(db.JSON)  # list of reviews
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(255), nullable=False)
    user_phone = db.Column(db.String(20), nullable=False)
    delivery_address = db.Column(db.Text, nullable=False)
    payment_method = db.Column(db.String(50))  # cod, gcash, card
    total_amount = db.Column(db.Float, nullable=False)
    items = db.Column(db.JSON)  # cart items
    status = db.Column(db.String(50), default='pending')  # pending, confirmed, delivered, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    name = db.Column(db.String(255))
    password_hash = db.Column(db.String(255))
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

def init_db():
    """Initialize the database and create all tables."""
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Use DATABASE_URL from environment if set, otherwise use config value
    db_uri = os.environ.get('DATABASE_URL') or app.config['DATABASE_URI']
    app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    
    with app.app_context():
        print(f"Connecting to: {app.config['SQLALCHEMY_DATABASE_URI']}")
        db.create_all()
        print("✓ Database tables created successfully!")
        print("\nTables created:")
        print("  - products")
        print("  - orders")
        print("  - users")

if __name__ == '__main__':
    init_db()
