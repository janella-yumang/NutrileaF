"""
Database models for Nutrilea app.
Used by Flask routes to interact with PostgreSQL.
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True)
    category = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    original_price = db.Column(db.Float)
    description = db.Column(db.Text)
    image = db.Column(db.String(50))
    quantity = db.Column(db.String(100))
    benefits = db.Column(db.JSON)
    uses = db.Column(db.JSON)
    how_to_use = db.Column(db.JSON)
    reviews = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'price': self.price,
            'originalPrice': self.original_price,
            'description': self.description,
            'image': self.image,
            'quantity': self.quantity,
            'benefits': self.benefits,
            'uses': self.uses,
            'howToUse': self.how_to_use,
            'reviews': self.reviews
        }

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(255), nullable=False)
    user_phone = db.Column(db.String(20), nullable=False)
    delivery_address = db.Column(db.Text, nullable=False)
    payment_method = db.Column(db.String(50))
    total_amount = db.Column(db.Float, nullable=False)
    items = db.Column(db.JSON)
    status = db.Column(db.String(50), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'userName': self.user_name,
            'userPhone': self.user_phone,
            'deliveryAddress': self.delivery_address,
            'paymentMethod': self.payment_method,
            'totalAmount': self.total_amount,
            'items': self.items,
            'status': self.status,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    name = db.Column(db.String(255))
    password_hash = db.Column(db.String(255))
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    role = db.Column(db.String(50), default='user')  # 'admin' or 'user'
    status = db.Column(db.String(50), default='active')  # 'active', 'inactive', 'suspended'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'phone': self.phone,
            'address': self.address,
            'role': self.role,
            'status': self.status,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

class ForumThread(db.Model):
    __tablename__ = 'forum_threads'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(500), nullable=False)
    content = db.Column(db.Text, nullable=False)
    user_name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), nullable=False)  # e.g., 'health-tips', 'recipes', 'wellness'
    views_count = db.Column(db.Integer, default=0)
    replies_count = db.Column(db.Integer, default=0)
    status = db.Column(db.String(50), default='active')  # active, closed, pinned
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'userName': self.user_name,
            'category': self.category,
            'viewsCount': self.views_count,
            'repliesCount': self.replies_count,
            'status': self.status,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

class ForumReply(db.Model):
    __tablename__ = 'forum_replies'
    
    id = db.Column(db.Integer, primary_key=True)
    thread_id = db.Column(db.Integer, db.ForeignKey('forum_threads.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    user_name = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'threadId': self.thread_id,
            'content': self.content,
            'userName': self.user_name,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }
