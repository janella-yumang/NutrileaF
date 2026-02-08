from app import create_app
from app.models import db, Product, ProductCategory, User, Order, ForumThread, ForumReply, Review

app = create_app()

with app.app_context():
    print("=== Checking Database Tables ===")
    
    # Create all tables
    db.create_all()
    print("✓ Tables created/verified")
    
    # Check each table
    print(f"\nProducts: {Product.query.count()} records")
    print(f"Categories: {ProductCategory.query.count()} records")
    print(f"Users: {User.query.count()} records")
    print(f"Orders: {Order.query.count()} records")
    print(f"Forum Threads: {ForumThread.query.count()} records")
    print(f"Forum Replies: {ForumReply.query.count()} records")
    print(f"Reviews: {Review.query.count()} records")
    
    # Show categories
    print("\n=== Categories ===")
    categories = ProductCategory.query.all()
    for cat in categories:
        print(f"ID: {cat.id}, Name: {cat.name}, Status: {cat.status}")
    
    # Show products
    print("\n=== Products ===")
    products = Product.query.all()
    for prod in products:
        print(f"ID: {prod.id}, Name: {prod.name}, Category: {prod.category}, Price: {prod.price}")
