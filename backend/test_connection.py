"""
Test PostgreSQL connection to Render.
Run this to verify your database is accessible.

Usage:
    python test_connection.py
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set the DATABASE_URL before importing Config
os.environ['DATABASE_URL'] = 'postgresql://nutrileaf_user:D4rXxZMUhfX2eC2nRbSeKxUTaG1bzTzg@dpg-d5uvupchg0os73a3ekdg-a.virginia-postgres.render.com/nutrileaf'

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config

db = SQLAlchemy()

app = Flask(__name__)
app.config.from_object(Config)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

print(f"Testing connection to: {app.config['SQLALCHEMY_DATABASE_URI'][:50]}...")

try:
    db.init_app(app)
    with app.app_context():
        # Try to create a simple connection by executing a query
        result = db.session.execute(db.text('SELECT 1'))
        print("✓ Successfully connected to PostgreSQL on Render!")
        print(f"   Database: nutrileaf")
        print(f"   Host: dpg-d5uvupchg0os73a3ekdg-a.virginia-postgres.render.com")
        
except Exception as e:
    print(f"✗ Connection failed: {e}")
    print("\nTroubleshooting:")
    print("1. Check your internet connection")
    print("2. Verify DATABASE_URL is correct")
    print("3. Ensure Render PostgreSQL service is running")
    print("4. Try connecting with psql directly:")
    print("   psql 'postgresql://nutrileaf_user:PASSWORD@dpg-d5uvupchg0os73a3ekdg-a.virginia-postgres.render.com/nutrileaf'")
    sys.exit(1)
