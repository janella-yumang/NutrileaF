"""
Review API routes - handle review submission and retrieval
"""

import jwt
from flask import Blueprint, request, jsonify, current_app
from app.models import Review, Product, User, Order
from datetime import datetime

reviews_bp = Blueprint('reviews', __name__)

def get_user_from_token():
    """Extract user from JWT token in Authorization header."""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    try:
        token = auth_header.split(' ')[1]
        secret_key = current_app.config.get('SECRET_KEY', 'supersecretkey')
        payload = jwt.decode(token, secret_key, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        if user_id:
            user = User.objects(id=user_id).first()
            return user
    except:
        pass
    
    return None

def user_has_purchased_product(user_id, product_id):
    """Check if user has completed an order containing this product."""
    try:
        # Find all orders for this user
        orders = Order.objects(user_id=user_id, status='completed')
        
        for order in orders:
            # Check if any item in the order matches this product
            if order.items:
                for item in order.items:
                    # item.id might be string or int
                    if str(item.get('id')) == str(product_id):
                        return True
        
        return False
    except:
        return False

@reviews_bp.route('/submit', methods=['POST'])
def submit_review():
    """
    Submit a review for a product (user-facing endpoint).
    Verifies that user has completed an order with this product.
    
    Request body:
    {
        "productId": "product_mongo_id",
        "rating": 5,
        "title": "Great product!",
        "content": "This product changed my life..."
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required = ['productId', 'rating', 'title', 'content']
        if not all(k in data for k in required):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Get authenticated user
        user = get_user_from_token()
        if not user:
            return jsonify({'error': 'Unauthorized - please log in to submit a review'}), 401
        
        # Get product
        product = Product.objects(id=data['productId']).first()
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        # Check if user has already reviewed this product
        existing_review = Review.objects(
            product_id=product.id,
            user_id=user.id
        ).first()
        
        if existing_review:
            return jsonify({'error': 'You have already reviewed this product'}), 400
        
        # Check if user has completed an order with this product
        verified_purchase = user_has_purchased_product(str(user.id), data['productId'])
        
        # Validate rating
        rating = data.get('rating')
        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400
        
        # Create review
        review = Review(
            product_id=product,
            user_id=user,
            rating=rating,
            title=data['title'],
            content=data['content'],
            verified_purchase=verified_purchase,
            status='active'
        )
        
        review.save()
        
        return jsonify({
            'success': True,
            'message': 'Review submitted successfully',
            'review': review.to_dict()
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reviews_bp.route('/product/<string:product_id>', methods=['GET'])
def get_product_reviews(product_id):
    """Get all active reviews for a product."""
    try:
        product = Product.objects(id=product_id).first()
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        # Fetch active reviews for this product
        reviews = Review.objects(
            product_id=product,
            status='active'
        ).order_by('-created_at')
        
        return jsonify({
            'success': True,
            'productId': product_id,
            'count': reviews.count(),
            'reviews': [r.to_dict() for r in reviews]
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reviews_bp.route('/<string:review_id>/helpful', methods=['POST'])
def mark_helpful(review_id):
    """Mark a review as helpful (optional interaction feature)."""
    try:
        review = Review.objects(id=review_id).first()
        if not review:
            return jsonify({'error': 'Review not found'}), 404
        
        # In a full implementation, you'd track who marked it helpful
        # For now, just return the review
        return jsonify({
            'success': True,
            'review': review.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
