"""
Fix product images by replacing broken placeholder URLs with emojis
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.models import Product

def fix_product_images():
    """Update all product images with emoji-based defaults"""
    app = create_app()
    
    with app.app_context():
        products = Product.objects()
        
        image_map = {
            'capsules': '💊',
            'tea': '🍵',
            'powder': '✨',
            'soap': '🧼',
            'leaves': '🌿',
            'oil': '🫧',
            'honey': '🍯',
            'fresh': '🥬',
            'supplement': '💊',
            'skincare': '🧴',
            'default': '🌱'
        }
        
        for product in products:
            # Determine emoji based on name or category
            name_lower = product.name.lower() if product.name else ''
            category = product.category.lower() if product.category else ''
            
            emoji = image_map.get('default')
            
            # Check name first
            if 'capsule' in name_lower:
                emoji = '💊'
            elif 'tea' in name_lower:
                emoji = '🍵'
            elif 'powder' in name_lower:
                emoji = '✨'
            elif 'soap' in name_lower:
                emoji = '🧼'
            elif 'leaf' in name_lower or 'leaves' in name_lower:
                emoji = '🌿'
            elif 'oil' in name_lower:
                emoji = '🫧'
            elif 'honey' in name_lower:
                emoji = '🍯'
            elif 'fresh' in name_lower:
                emoji = '🥬'
            else:
                emoji = image_map.get(category, image_map.get('default'))
            
            # Only update if image URL is broken
            if product.image and ('placeholder' in product.image or 'via.' in product.image):
                product.image = emoji
                product.save()
                print(f"Updated: {product.name} -> {emoji}")
        
        print("Product images fixed!")

if __name__ == '__main__':
    fix_product_images()
