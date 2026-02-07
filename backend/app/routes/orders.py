"""
Order API routes - saves checkout orders to PostgreSQL
"""

from flask import Blueprint, request, jsonify
from app.models import db, Order
from datetime import datetime

orders_bp = Blueprint('orders', __name__)

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
        
        # Create order
        order = Order(
            user_name=data['userName'],
            user_phone=data['userPhone'],
            delivery_address=data['deliveryAddress'],
            payment_method=data['paymentMethod'],
            total_amount=data['totalAmount'],
            items=data['items'],
            status='pending'
        )
        
        db.session.add(order)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'orderId': order.id,
            'order': order.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/list', methods=['GET'])
def list_orders():
    """Get all orders."""
    try:
        orders = Order.query.order_by(Order.created_at.desc()).all()
        return jsonify({
            'success': True,
            'count': len(orders),
            'orders': [o.to_dict() for o in orders]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<int:order_id>', methods=['GET'])
def get_order(order_id):
    """Get a specific order by ID."""
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        return jsonify({'success': True, 'order': order.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    """Update order status."""
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        data = request.get_json()
        if 'status' in data:
            order.status = data['status']
            db.session.commit()
        
        return jsonify({'success': True, 'order': order.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
