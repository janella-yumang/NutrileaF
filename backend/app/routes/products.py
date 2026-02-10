"""
Public API routes for products
Accessible to all users for browsing products
"""

from flask import Blueprint, request, jsonify
from app.models import Product, ProductCategory

products_bp = Blueprint('products', __name__, url_prefix='/api/products')

@products_bp.route('/', methods=['GET'])
@products_bp.route('', methods=['GET'])
def get_products():
    """Get all products with optional filtering."""
    try:
        # Query parameters
        category = request.args.get('category')
        search = request.args.get('search')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Build query
        query = Product.query
        
        # Filter by category
        if category and category != 'all':
            query = query.filter(Product.category == category)
        
        # Search functionality
        if search:
            query = query.filter(Product.name.ilike(f'%{search}%'))
        
        # Paginate
        products = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'success': True,
            'products': [p.to_dict() for p in products.items],
            'total': products.total,
            'pages': products.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@products_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all product categories for filtering."""
    try:
        categories = ProductCategory.query.filter_by(status='active').all()
        
        return jsonify({
            'success': True,
            'categories': [c.to_dict() for c in categories]
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a single product by ID."""
    try:
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({'success': False, 'error': 'Product not found'}), 404
        
        return jsonify({
            'success': True,
            'product': product.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
