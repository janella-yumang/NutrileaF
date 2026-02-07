"""
Seed users to PostgreSQL.
Creates sample users with one admin.
"""

import os
import sys
from werkzeug.security import generate_password_hash

DATABASE_URL = os.environ.get('DATABASE_URL', 
    'postgresql://nutrileaf_user:D4rXxZMUhfX2eC2nRbSeKxUTaG1bzTzg@dpg-d5uvupchg0os73a3ekdg-a.virginia-postgres.render.com/nutrileaf'
)

try:
    from flask import Flask
    from flask_sqlalchemy import SQLAlchemy
    from app.models import db, User
    
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    
    users_data = [
        {
            'email': 'kylie@nutrilea.com',
            'name': 'Kylie Admin',
            'password_hash': generate_password_hash('Admin@123'),
            'phone': '09123456789',
            'address': 'Manila, Philippines',
            'role': 'admin',
            'status': 'active'
        },
        {
            'email': 'john@example.com',
            'name': 'John Customer',
            'password_hash': generate_password_hash('Pass@123'),
            'phone': '09987654321',
            'address': 'Quezon City, Philippines',
            'role': 'user',
            'status': 'active'
        },
        {
            'email': 'maria@example.com',
            'name': 'Maria Santos',
            'password_hash': generate_password_hash('Maria@123'),
            'phone': '09555555555',
            'address': 'Cebu, Philippines',
            'role': 'user',
            'status': 'active'
        }
    ]
    
    with app.app_context():
        # Check if users already exist
        existing = db.session.query(User).first()
        if existing:
            print("✓ Users already in database. Skipping seed.")
            print("\nExisting users:")
            users = db.session.query(User).all()
            for user in users:
                print(f"  - {user.email} ({user.role})")
        else:
            for u in users_data:
                user = User(**u)
                db.session.add(user)
            db.session.commit()
            print("✓ Seeded 3 users:")
            for u in users_data:
                role_badge = "👑 ADMIN" if u['role'] == 'admin' else "👤 USER"
                print(f"  - {u['email']} ({role_badge})")
            
            print("\nLogin credentials:")
            print("  Admin: kylie@nutrilea.com / Admin@123")
            print("  User 1: john@example.com / Pass@123")
            print("  User 2: maria@example.com / Maria@123")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
