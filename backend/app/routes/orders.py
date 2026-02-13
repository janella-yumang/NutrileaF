"""
Order API routes - saves checkout orders to MongoDB
"""

import jwt
from flask import Blueprint, request, jsonify, current_app
from app.models import Order, User
from datetime import datetime

orders_bp = Blueprint('orders', __name__)

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

@orders_bp.route('/create', methods=['POST'])
def create_order():
    """
    Create a new order from cart checkout.
    
    Request body:
    {
        "userName": "John Doe",
        "userPhone": "+63912345678",
        "deliveryAddress": "123 Manila St, QC",
        "paymentMethod": "cod|gcash|card",
        "totalAmount": 948.00,
        "items": [
            {"id": 1, "name": "Product", "price": 100, "cartQuantity": 2}
        ]
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required = ['userName', 'userPhone', 'deliveryAddress', 'paymentMethod', 'totalAmount', 'items']
        if not all(k in data for k in required):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Get authenticated user ID
        user = get_user_from_token()
        user_id = str(user.id) if user else None
        
        # Create order
        order = Order(
            user_id=user_id,
            user_name=data['userName'],
            user_phone=data['userPhone'],
            delivery_address=data['deliveryAddress'],
            payment_method=data['paymentMethod'],
            total_amount=data['totalAmount'],
            items=data['items'],
            status='pending'
        )
        
        order.save()
        
        return jsonify({
            'success': True,
            'orderId': str(order.id),
            'order': order.to_dict()
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/my', methods=['GET'])
def my_orders():
    """Get orders for the logged-in user."""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Fetch orders for this user
        orders = Order.objects(user_id=str(user.id)).order_by('-created_at')
        
        return jsonify({
            'success': True,
            'count': orders.count(),
            'orders': [o.to_dict() for o in orders]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/list', methods=['GET'])
def list_orders():
    """Get all orders."""
    try:
        orders = Order.objects.order_by('-created_at')
        return jsonify({
            'success': True,
            'count': orders.count(),
            'orders': [o.to_dict() for o in orders]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<string:order_id>', methods=['GET'])
def get_order(order_id):
    """Get a specific order by ID."""
    try:
        order = Order.objects(id=order_id).first()
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        return jsonify({'success': True, 'order': order.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<string:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    """Update order status."""
    try:
        order = Order.objects(id=order_id).first()
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        data = request.get_json()
        if 'status' in data:
            order.status = data['status']
            order.save()
        
        return jsonify({'success': True, 'order': order.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
