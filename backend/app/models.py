"""
Database models for Nutrilea app.
Used by Flask routes to interact with MongoDB.
"""

from datetime import datetime
from mongoengine import Document, EmbeddedDocument, fields
from config import Config

# Connection will be established in the app initialization
# from mongoengine import connect
# connect(db='nutrilea_db', host=Config.MONGODB_URI)

class Product(Document):
    meta = {'collection': 'products'}
    
    name = fields.StringField(required=True, unique=True, max_length=255)
    category = fields.StringField(required=True, max_length=100)
    price = fields.FloatField(required=True)
    original_price = fields.FloatField()
    description = fields.StringField()
    image = fields.ListField(fields.StringField())  # Array of image URLs
    quantity = fields.StringField(max_length=100)
    benefits = fields.ListField(fields.StringField())
    uses = fields.ListField(fields.StringField())
    how_to_use = fields.ListField(fields.StringField())
    reviews = fields.ListField(fields.DictField())
    created_at = fields.DateTimeField(default=datetime.utcnow)

    def get_image_urls(self, base_url='https://nutrilea-backend.onrender.com'):
        """Convert relative image paths to full URLs."""
        if not self.image:
            return ['🌿']  # Default emoji
        
        urls = []
        for img in self.image:
            if not img:
                continue
            # If it's already a full URL, use as-is
            if img.startswith('http') or img.startswith('https'):
                urls.append(img)
            # If it's an emoji, keep as-is
            elif len(img) <= 2:
                urls.append(img)
            # If it's already an uploads path, prefix base URL
            elif img.startswith('/uploads/'):
                urls.append(f"{base_url}{img}")
            elif img.startswith('uploads/'):
                urls.append(f"{base_url}/{img}")
            # Otherwise, construct full URL
            else:
                urls.append(f"{base_url}/uploads/{img.lstrip('/')}")
        
        return urls if urls else ['🌿']
    
    def to_dict(self, base_url='https://nutrilea-backend.onrender.com'):
        return {
            'id': str(self.id),
            'name': self.name,
            'category': self.category,
            'price': self.price,
            'originalPrice': self.original_price,
            'description': self.description,
            'image': self.get_image_urls(base_url),
            'quantity': self.quantity,
            'benefits': self.benefits,
            'uses': self.uses,
            'howToUse': self.how_to_use,
            'reviews': self.reviews
        }

class Order(Document):
    meta = {'collection': 'orders'}
    
    user_id = fields.StringField()  # Store authenticated user ID for linking orders to users
    user_name = fields.StringField(required=True)
    user_phone = fields.StringField(required=True)
    delivery_address = fields.StringField(required=True)
    payment_method = fields.StringField()
    total_amount = fields.FloatField(required=True)
    items = fields.ListField(fields.DictField())
    status = fields.StringField(default='pending')  # pending, processing, shipped, delivered, cancelled
    created_at = fields.DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': str(self.id),
            'userId': self.user_id,
            'userName': self.user_name,
            'userPhone': self.user_phone,
            'deliveryAddress': self.delivery_address,
            'paymentMethod': self.payment_method,
            'totalAmount': self.total_amount,
            'items': self.items,
            'status': self.status,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

class User(Document):
    meta = {
        'collection': 'users',
        'indexes': [
            'email',  # Index for fast email lookup during login
            'status',  # Index for status filtering
            ('email', 'status')  # Compound index for active user lookups
        ]
    }
    
    email = fields.StringField(required=True, unique=True)
    name = fields.StringField()
    password_hash = fields.StringField()
    phone = fields.StringField()
    address = fields.StringField()
    image = fields.StringField()
    role = fields.StringField(default='user')  # 'admin' or 'user'
    status = fields.StringField(default='active')  # 'active', 'inactive', 'suspended'
    created_at = fields.DateTimeField(default=datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': str(self.id),
            'email': self.email,
            'name': self.name,
            'phone': self.phone,
            'address': self.address,
            'image': self.image,
            'role': self.role,
            'status': self.status,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

class ForumThread(Document):
    meta = {'collection': 'forum_threads'}
    
    title = fields.StringField(required=True)
    content = fields.StringField(required=True)
    user_name = fields.StringField(required=True)
    views_count = fields.IntField(default=0)
    replies_count = fields.IntField(default=0)
    likes_count = fields.IntField(default=0)  # Track number of likes
    status = fields.StringField(default='active')  # active, closed, pinned
    attachments = fields.ListField(fields.DictField(), default=[])
    created_at = fields.DateTimeField(default=datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'content': self.content,
            'userName': self.user_name,
            'viewsCount': self.views_count,
            'repliesCount': self.replies_count,
            'likeCount': self.likes_count,
            'status': self.status,
            'attachments': self.attachments or [],
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

class ForumReply(Document):
    meta = {'collection': 'forum_replies'}
    
    thread_id = fields.ReferenceField(ForumThread, required=True)
    content = fields.StringField(required=True)
    user_name = fields.StringField(required=True)
    created_at = fields.DateTimeField(default=datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': str(self.id),
            'threadId': str(self.thread_id.id) if self.thread_id else None,
            'content': self.content,
            'userName': self.user_name,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

class ProductCategory(Document):
    meta = {'collection': 'product_categories'}
    
    name = fields.StringField(required=True, unique=True)
    description = fields.StringField()
    image = fields.StringField()
    status = fields.StringField(default='active')  # active, inactive
    created_at = fields.DateTimeField(default=datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'image': self.image,
            'status': self.status,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

class Review(Document):
    meta = {'collection': 'reviews'}
    
    product_id = fields.ReferenceField(Product, required=True)
    user_id = fields.ReferenceField(User, required=True)
    rating = fields.IntField(required=True)  # 1-5 stars
    title = fields.StringField()
    content = fields.StringField(required=True)
    verified_purchase = fields.BooleanField(default=False)  # True if user completed order with this product
    status = fields.StringField(default='active')  # active, hidden, reported
    created_at = fields.DateTimeField(default=datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': str(self.id),
            'productId': str(self.product_id.id) if self.product_id else None,
            'userId': str(self.user_id.id) if self.user_id else None,
            'rating': self.rating,
            'title': self.title,
            'content': self.content,
            'verifiedPurchase': self.verified_purchase,
            'status': self.status,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            'productName': self.product_id.name if self.product_id else None,
            'userName': self.user_id.name if self.user_id else None
        }
