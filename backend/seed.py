#!/usr/bin/env python3
"""
Seed data for MongoDB collections
Creates sample data for testing all collections with proper field validation
"""

import os
from dotenv import load_dotenv
from mongoengine import connect, disconnect
from datetime import datetime, timedelta
import random

# Load environment variables
load_dotenv()

# Connect to MongoDB
mongodb_uri = os.environ.get('DATABASE_URL') or os.environ.get('MONGODB_URI')
disconnect()
connect(db='Nutrileaf', host=mongodb_uri)

# Import models after connection
from app.models import Product, User, Order, ForumThread, ForumReply, ProductCategory, Review

def clear_collections():
    """Clear all collections before seeding"""
    print("🗑️  Clearing existing collections...")
    Product.objects.delete()
    User.objects.delete()
    Order.objects.delete()
    ForumThread.objects.delete()
    ForumReply.objects.delete()
    ProductCategory.objects.delete()
    Review.objects.delete()
    print("✅ Collections cleared")

def seed_product_categories():
    """Seed product categories"""
    print("📁 Seeding product categories...")
    categories = [
        {
            "name": "Moringa Products",
            "description": "Pure moringa leaves, powders, and supplements",
            "image": "/images/categories/moringa.jpg",
            "status": "active"
        },
        {
            "name": "Herbal Teas",
            "description": "Organic herbal tea blends and infusions",
            "image": "/images/categories/tea.jpg", 
            "status": "active"
        },
        {
            "name": "Health Supplements",
            "description": "Natural health and wellness supplements",
            "image": "/images/categories/supplements.jpg",
            "status": "active"
        },
        {
            "name": "Natural Remedies",
            "description": "Traditional and natural health remedies",
            "image": "/images/categories/remedies.jpg",
            "status": "active"
        }
    ]
    
    for cat_data in categories:
        category = ProductCategory(**cat_data)
        category.save()
    
    print(f"✅ Created {len(categories)} product categories")

def seed_products():
    """Seed products"""
    print("🛍️  Seeding products...")
    products = [
        {
            "name": "Premium Moringa Powder",
            "category": "Moringa Products",
            "price": 299.99,
            "original_price": 399.99,
            "description": "100% organic moringa oleifera leaf powder, rich in vitamins and antioxidants",
            "image": [
                "/images/products/moringa-powder-1.jpg",
                "/images/products/moringa-powder-2.jpg"
            ],
            "quantity": "250g",
            "benefits": [
                "Rich in vitamins A, C, and E",
                "High in antioxidants",
                "Supports immune system",
                "Natural energy booster"
            ],
            "uses": [
                "Mix into smoothies",
                "Add to tea or water",
                "Sprinkle over food",
                "Take as daily supplement"
            ],
            "how_to_use": [
                "Start with 1 teaspoon daily",
                "Gradually increase to 1 tablespoon",
                "Best taken with meals",
                "Store in cool, dry place"
            ],
            "reviews": []
        },
        {
            "name": "Moringa Capsules",
            "category": "Moringa Products", 
            "price": 449.99,
            "original_price": 599.99,
            "description": "Convenient moringa capsules for daily supplementation",
            "image": [
                "/images/products/moringa-capsules.jpg"
            ],
            "quantity": "60 capsules",
            "benefits": [
                "Easy to swallow",
                "No taste or mess",
                "Precise dosage",
                "Travel friendly"
            ],
            "uses": [
                "Daily supplement",
                "Pre-workout boost",
                "Immune support",
                "Nutritional boost"
            ],
            "how_to_use": [
                "Take 2 capsules daily",
                "With glass of water",
                "Preferably with meals",
                "Consistent use recommended"
            ],
            "reviews": []
        },
        {
            "name": "Detox Herbal Tea",
            "category": "Herbal Teas",
            "price": 199.99,
            "original_price": 249.99,
            "description": "Gentle detoxifying blend of moringa and other herbs",
            "image": [
                "/images/products/detox-tea.jpg"
            ],
            "quantity": "20 tea bags",
            "benefits": [
                "Natural detoxification",
                "Supports liver health",
                "Improves digestion",
                "Calming effect"
            ],
            "uses": [
                "Morning detox routine",
                "After meals",
                "Before bedtime",
                "Weekly cleanse"
            ],
            "how_to_use": [
                "Steep 5-7 minutes",
                "Use hot water (not boiling)",
                "Add honey if desired",
                "Drink 1-2 cups daily"
            ],
            "reviews": []
        }
    ]
    
    for product_data in products:
        product = Product(**product_data)
        product.save()
    
    print(f"✅ Created {len(products)} products")

def seed_users():
    """Seed users including admin"""
    print("👥 Seeding users...")
    users = [
        {
            "email": "admin@nutrilea.com",
            "name": "Admin User",
            "password_hash": "hashed_password_admin",  # In production, use proper hashing
            "phone": "+1234567890",
            "address": "Admin Office, Nutrilea HQ",
            "role": "admin",
            "status": "active"
        },
        {
            "email": "john.doe@example.com",
            "name": "John Doe",
            "password_hash": "hashed_password_user",
            "phone": "+1234567891",
            "address": "123 Main St, City, State",
            "role": "user",
            "status": "active"
        },
        {
            "email": "jane.smith@example.com",
            "name": "Jane Smith",
            "password_hash": "hashed_password_user",
            "phone": "+1234567892",
            "address": "456 Oak Ave, Town, State",
            "role": "user",
            "status": "active"
        }
    ]
    
    for user_data in users:
        user = User(**user_data)
        user.save()
    
    print(f"✅ Created {len(users)} users")

def seed_orders():
    """Seed sample orders"""
    print("📦 Seeding orders...")
    
    # Get users and products for references
    users = list(User.objects(role='user'))
    products = list(Product.objects())
    
    if not users or not products:
        print("⚠️  No users or products found, skipping orders")
        return
    
    orders = []
    for i in range(3):
        user = random.choice(users)
        selected_products = random.sample(products, min(2, len(products)))
        
        order_items = []
        total_amount = 0
        
        for product in selected_products:
            item = {
                "productId": str(product.id),
                "name": product.name,
                "price": product.price,
                "quantity": random.randint(1, 3),
                "image": product.image[0] if product.image else ""
            }
            item["subtotal"] = item["price"] * item["quantity"]
            order_items.append(item)
            total_amount += item["subtotal"]
        
        order = {
            "user_name": user.name,
            "user_phone": user.phone,
            "delivery_address": user.address,
            "payment_method": random.choice(["Cash on Delivery", "GCash", "Bank Transfer"]),
            "total_amount": total_amount,
            "items": order_items,
            "status": random.choice(["pending", "confirmed", "delivered"])
        }
        orders.append(order)
    
    for order_data in orders:
        order = Order(**order_data)
        order.save()
    
    print(f"✅ Created {len(orders)} orders")

def seed_forum_threads():
    """Seed forum threads"""
    print("💬 Seeding forum threads...")
    
    users = list(User.objects())
    if not users:
        print("⚠️  No users found, skipping forum threads")
        return
    
    threads = [
        {
            "title": "Best time to take moringa supplements?",
            "content": "I've been taking moringa powder for a week. When is best time to take it for maximum benefits?",
            "user_name": random.choice(users).name,
            "category": "health-tips",
            "views_count": random.randint(10, 100),
            "replies_count": 0,
            "status": "active"
        },
        {
            "title": "Moringa smoothie recipe sharing",
            "content": "Let's share our favorite moringa smoothie recipes! I'll start with mine: banana, moringa powder, almond milk, and honey.",
            "user_name": random.choice(users).name,
            "category": "recipes",
            "views_count": random.randint(20, 150),
            "replies_count": 0,
            "status": "active"
        },
        {
            "title": "Moringa for weight loss - experiences?",
            "content": "Has anyone here used moringa specifically for weight management? Would love to hear your experiences and results.",
            "user_name": random.choice(users).name,
            "category": "wellness",
            "views_count": random.randint(50, 200),
            "replies_count": 0,
            "status": "active"
        }
    ]
    
    created_threads = []
    for thread_data in threads:
        thread = ForumThread(**thread_data)
        thread.save()
        created_threads.append(thread)
    
    print(f"✅ Created {len(threads)} forum threads")
    return created_threads

def seed_forum_replies(threads):
    """Seed forum replies"""
    print("💬 Seeding forum replies...")
    
    users = list(User.objects())
    if not users or not threads:
        print("⚠️  No users or threads found, skipping replies")
        return
    
    replies_data = [
        {
            "thread_id": threads[0],
            "content": "I find that taking it in morning with breakfast works best for me. Gives me energy throughout day!",
            "user_name": random.choice(users).name
        },
        {
            "thread_id": threads[0],
            "content": "I prefer taking it after lunch. Helps with digestion and doesn't interfere with my sleep.",
            "user_name": random.choice(users).name
        },
        {
            "thread_id": threads[1],
            "content": "Great idea! Here's my recipe: moringa powder, mango, coconut water, and a pinch of turmeric. So refreshing!",
            "user_name": random.choice(users).name
        }
    ]
    
    for reply_data in replies_data:
        reply = ForumReply(**reply_data)
        reply.save()
        
        # Update reply count on thread
        reply_data["thread_id"].replies_count += 1
        reply_data["thread_id"].save()
    
    print(f"✅ Created {len(replies_data)} forum replies")

def seed_reviews():
    """Seed product reviews"""
    print("⭐ Seeding reviews...")
    
    users = list(User.objects(role='user'))
    products = list(Product.objects())
    
    if not users or not products:
        print("⚠️  No users or products found, skipping reviews")
        return
    
    reviews = []
    for product in products[:2]:  # Add reviews to first 2 products
        for _ in range(random.randint(2, 4)):
            user = random.choice(users)
            review = {
                "product_id": product,
                "user_id": user,
                "rating": random.randint(4, 5),
                "title": random.choice(["Great product!", "Very satisfied", "Excellent quality", "Highly recommended"]),
                "content": random.choice([
                    "This product really works well for me. I can feel the difference in my energy levels.",
                    "High quality and fast shipping. Will definitely order again.",
                    "Been using this for a month now and I'm very happy with the results.",
                    "Excellent customer service and product exceeded my expectations."
                ]),
                "status": "active"
            }
            reviews.append(review)
    
    for review_data in reviews:
        review = Review(**review_data)
        review.save()
    
    print(f"✅ Created {len(reviews)} reviews")

def main():
    """Main seeding function"""
    print("🌱 Starting MongoDB database seeding...")
    print("=" * 50)
    
    try:
        # Clear existing data
        clear_collections()
        
        # Seed in correct order (dependencies first)
        seed_product_categories()
        seed_products()
        seed_users()
        seed_orders()
        threads = seed_forum_threads()
        seed_forum_replies(threads)
        seed_reviews()
        
        print("=" * 50)
        print("🎉 Database seeding completed successfully!")
        print("\n📊 Summary:")
        print(f"   Product Categories: {ProductCategory.objects.count()}")
        print(f"   Products: {Product.objects.count()}")
        print(f"   Users: {User.objects.count()}")
        print(f"   Orders: {Order.objects.count()}")
        print(f"   Forum Threads: {ForumThread.objects.count()}")
        print(f"   Forum Replies: {ForumReply.objects.count()}")
        print(f"   Reviews: {Review.objects.count()}")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        disconnect()

if __name__ == "__main__":
    main()
