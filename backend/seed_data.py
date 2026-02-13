"""
Seed script to populate MongoDB with initial data for Nutrilea app.
"""

from app.models import Product, ProductCategory, ForumThread, User
from config import Config
from mongoengine import connect
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Connect to MongoDB
try:
    connect(db='Nutrileaf', host=Config.MONGODB_URI)
    print(f"✅ Connected to MongoDB: {Config.MONGODB_URI[:50]}...")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    sys.exit(1)

def seed_categories():
    """Create product categories."""
    categories = [
        {
            'name': 'Malunggay Products',
            'description': 'Nutritious malunggay-based products and supplements',
            'status': 'active'
        },
        {
            'name': 'Herbal Teas',
            'description': 'Organic herbal tea blends for wellness',
            'status': 'active'
        },
        {
            'name': 'Natural Supplements',
            'description': 'Vitamins and natural health supplements',
            'status': 'active'
        },
        {
            'name': 'Organic Foods',
            'description': 'Fresh and organic food products',
            'status': 'active'
        }
    ]
    
    for cat_data in categories:
        if not ProductCategory.objects(name=cat_data['name']).first():
            category = ProductCategory(**cat_data)
            category.save()
            print(f"Created category: {cat_data['name']}")

def seed_products():
    """Create sample products."""
    products = [
        {
            'name': 'Malunggay Capsules 500mg',
            'category': 'Malunggay Products',
            'price': 299.99,
            'original_price': 399.99,
            'description': 'Premium malunggay capsules packed with essential vitamins and minerals.',
            'image': ['https://via.placeholder.com/300x300/4CAF50/FFFFFF?text=Malunggay+Capsules'],
            'quantity': '60 capsules',
            'benefits': ['Rich in vitamins A, C, and E', 'High in calcium and iron', 'Boosts immune system', 'Natural antioxidant'],
            'uses': ['Daily supplement', 'Nutritional boost', 'Immune support'],
            'how_to_use': ['Take 1-2 capsules daily with meals', 'Consult doctor before use if pregnant']
        },
        {
            'name': 'Malunggay Tea Bags',
            'category': 'Herbal Teas',
            'price': 189.99,
            'original_price': 249.99,
            'description': 'Organic malunggay leaves tea bags for daily wellness.',
            'image': ['https://via.placeholder.com/300x300/8BC34A/FFFFFF?text=Malunggay+Tea'],
            'quantity': '20 tea bags',
            'benefits': ['Detoxifying', 'Anti-inflammatory', 'Rich in antioxidants', 'Supports digestion'],
            'uses': ['Daily tea', 'After meals', 'Before bedtime'],
            'how_to_use': ['Steep 1 tea bag in hot water for 3-5 minutes', 'Enjoy hot or cold']
        },
        {
            'name': 'Malunggay Powder',
            'category': 'Malunggay Products',
            'price': 399.99,
            'original_price': 499.99,
            'description': 'Pure malunggay leaf powder for smoothies and cooking.',
            'image': ['https://via.placeholder.com/300x300/689F38/FFFFFF?text=Malunggay+Powder'],
            'quantity': '250g',
            'benefits': ['Nutrient-dense', 'Versatile ingredient', 'High protein content', 'Gluten-free'],
            'uses': ['Smoothies', 'Baking', 'Soups', 'Seasoning'],
            'how_to_use': ['Add 1 teaspoon to smoothies', 'Mix into soups and stews', 'Use in baking']
        },
        {
            'name': 'Malunggay Soap',
            'category': 'Natural Supplements',
            'price': 149.99,
            'original_price': 199.99,
            'description': 'Natural malunggay soap for healthy skin.',
            'image': ['https://via.placeholder.com/300x300/7CB342/FFFFFF?text=Malunggay+Soap'],
            'quantity': '100g bar',
            'benefits': ['Antibacterial', 'Moisturizing', 'Natural ingredients', 'Gentle on skin'],
            'uses': ['Daily bathing', 'Face wash', 'Hand soap'],
            'how_to_use': ['Lather and apply to wet skin', 'Rinse thoroughly', 'Use daily for best results']
        },
        {
            'name': 'Organic Malunggay Leaves',
            'category': 'Organic Foods',
            'price': 259.99,
            'original_price': 329.99,
            'description': 'Fresh organic malunggay leaves ready for cooking.',
            'image': ['https://via.placeholder.com/300x300/558B2F/FFFFFF?text=Fresh+Leaves'],
            'quantity': '500g',
            'benefits': ['100% organic', 'Fresh', 'High nutritional value', 'No pesticides'],
            'uses': ['Cooking', 'Soups', 'Stir-fry', 'Salads'],
            'how_to_use': ['Wash thoroughly before use', 'Add to soups and stews', 'Steam or stir-fry']
        }
    ]
    
    for prod_data in products:
        if not Product.objects(name=prod_data['name']).first():
            product = Product(**prod_data)
            product.save()
            print(f"Created product: {prod_data['name']}")

def seed_forum_threads():
    """Create sample forum threads."""
    threads = [
        {
            'title': 'Best time to take malunggay supplements?',
            'content': 'I recently started taking malunggay capsules and I was wondering what the best time of day to take them is. Should I take them in the morning with breakfast or at night before bed? Also, should I take them with food or on an empty stomach? Would love to hear from others who have been taking malunggay supplements for a while.',
            'user_name': 'HealthEnthusiast'
        },
        {
            'title': 'Delicious malunggay smoothie recipe',
            'content': 'I wanted to share this amazing smoothie recipe I discovered! Ingredients: 1 banana, 1 cup spinach, 1 teaspoon malunggay powder, 1 cup almond milk, and 1 tablespoon honey. Blend everything together and you get a nutritious green smoothie that tastes great! The malunggay powder doesn\'t affect the taste much but adds so many nutrients. Has anyone else tried similar combinations?',
            'user_name': 'GreenSmoothieLover'
        },
        {
            'title': 'Growing malunggay at home tips',
            'content': 'I\'m thinking about growing my own malunggay tree at home. For those who have experience with this, what tips can you share? I live in an apartment with a small balcony, so I\'m wondering if it\'s possible to grow it in a container. How much sun does it need? How often should I water it? Any advice would be greatly appreciated!',
            'user_name': 'UrbanGardener'
        },
        {
            'title': 'Malunggay benefits for skin health',
            'content': 'I\'ve been using malunggay soap for about a month now and I\'ve noticed significant improvements in my skin. My acne has reduced and my skin feels smoother. I also started taking the capsules internally. Has anyone else experienced skin benefits from malunggay? I\'m curious about the science behind it and how long it took others to see results.',
            'user_name': 'SkincareJunkie'
        }
    ]
    
    for thread_data in threads:
        if not ForumThread.objects(title=thread_data['title']).first():
            thread = ForumThread(**thread_data)
            thread.save()
            print(f"Created forum thread: {thread_data['title']}")

def main():
    """Main seeding function."""
    print("Starting database seeding...")
    
    try:
        seed_categories()
        seed_products()
        seed_forum_threads()
        
        print("\n✅ Database seeding completed successfully!")
        print(f"Products: {Product.objects.count()}")
        print(f"Categories: {ProductCategory.objects.count()}")
        print(f"Forum Threads: {ForumThread.objects.count()}")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
