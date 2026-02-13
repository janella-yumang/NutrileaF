from flask import Blueprint, jsonify, request
from app.models import Product, ProductCategory

market_bp = Blueprint('market', __name__)

@market_bp.route('/products', methods=['GET'])
def get_products():
    """Get all products with optional category filtering."""
    try:
    base_url = request.host_url.rstrip('/')
        # Get query parameters
        category = request.args.get('category')
        region = request.args.get('region', 'Luzon')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Build base query using MongoEngine
        query = Product.objects
        
        # Filter by category if provided
        if category and category != 'all':
            query = query.filter(category=category)
        
        # Get products for analysis with pagination
        skip = (page - 1) * per_page
        products = query.skip(skip).limit(per_page)
        total = query.count()
        
        if not products:
            return jsonify({
                'success': False,
                'error': 'No products found for the specified criteria'
            }), 404
        
        # Convert products to dict with proper ObjectId serialization
        products_list = []
        for product in products:
            product_dict = {
                'id': str(product.id),
                'name': product.name,
                'category': product.category,
                'price': product.price,
                'original_price': product.original_price,
                'description': product.description,
                'image': product.get_image_urls(base_url),
                'quantity': product.quantity,
                'benefits': product.benefits,
                'uses': product.uses,
                'how_to_use': product.how_to_use,
                'reviews': product.reviews
            }
            products_list.append(product_dict)
        
        return jsonify({
            'success': True,
            'products': products_list,
            'total': total,
            'pages': (total + per_page - 1) // per_page,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@market_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all available categories for frontend use."""
    try:
        categories = ProductCategory.objects(status='active')
        
        # Convert to dict with proper ObjectId serialization
        categories_list = []
        for category in categories:
            category_dict = {
                'id': str(category.id),
                'name': category.name,
                'description': category.description,
                'image': category.image
            }
            categories_list.append(category_dict)
        
        return jsonify({
            'success': True,
            'categories': categories_list,
            'total': len(categories_list)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@market_bp.route('/track', methods=['GET'])
def track_market():
    """Get market intelligence with optional category filtering."""
    try:
        # Get query parameters
        category = request.args.get('category')
        region = request.args.get('region', 'Luzon')
        
        # Build base query using MongoEngine
        query = Product.objects
        
        # Filter by category if provided
        if category and category != 'all':
            query = query.filter(category=category)
        
        # Get products for analysis
        products = query.all()
        
        if not products:
            return jsonify({
                'success': False,
                'error': 'No products found for the specified criteria'
            }), 404
        
        # Calculate market intelligence
        total_products = len(products)
        avg_price = sum(p.price for p in products) / total_products
        min_price = min(p.price for p in products)
        max_price = max(p.price for p in products)
        
        # Determine demand trend (mock logic based on price distribution)
        if avg_price > 500:
            demand_trend = 'high'
        elif avg_price > 300:
            demand_trend = 'moderate'
        else:
            demand_trend = 'increasing'
        
        # Get category breakdown
        category_breakdown = {}
        for product in products:
            cat = product.category
            if cat not in category_breakdown:
                category_breakdown[cat] = {
                    'count': 0,
                    'avg_price': 0,
                    'total_price': 0
                }
            category_breakdown[cat]['count'] += 1
            category_breakdown[cat]['total_price'] += product.price
        
        # Calculate averages for each category
        for cat in category_breakdown:
            category_breakdown[cat]['avg_price'] = (
                category_breakdown[cat]['total_price'] / category_breakdown[cat]['count']
            )
            del category_breakdown[cat]['total_price']  # Remove temporary field
        
        return jsonify({
            'success': True,
            'market_data': {
                'region': region,
                'total_products': total_products,
                'average_price': round(avg_price, 2),
                'price_range': {
                    'min': min_price,
                    'max': max_price
                },
                'demand_trend': demand_trend,
                'category_breakdown': category_breakdown,
                'category_filter': category or 'all'
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
