"""
Admin CRUD routes for managing products, users, orders, and forum.
Requires admin role to access.
"""

from flask import Blueprint, request, jsonify
from functools import wraps
from app.models import db, Product, User, Order, ForumThread, ForumReply

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def admin_required(f):
    """Decorator to check if user is admin (simplified for now)."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # In production, check JWT token for admin role
        # For now, check if 'admin' header is present
        is_admin = request.headers.get('X-Admin-Role') == 'true'
        if not is_admin:
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

# ==================== PRODUCTS ====================

@admin_bp.route('/products', methods=['GET'])
@admin_required
def get_all_products():
    """Get all products with pagination."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    products = Product.query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'success': True,
        'products': [p.to_dict() for p in products.items],
        'total': products.total,
        'pages': products.pages,
        'current_page': page
    }), 200

@admin_bp.route('/products', methods=['POST'])
@admin_required
def create_product():
    """Create a new product."""
    data = request.get_json()
    
    try:
        product = Product(
            name=data.get('name'),
            category=data.get('category'),
            price=data.get('price'),
            original_price=data.get('original_price'),
            description=data.get('description'),
            image=data.get('image'),
            quantity=data.get('quantity'),
            benefits=data.get('benefits'),
            uses=data.get('uses'),
            how_to_use=data.get('how_to_use'),
            reviews=data.get('reviews')
        )
        db.session.add(product)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Product created',
            'productId': product.id,
            'product': product.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/products/<int:product_id>', methods=['PUT'])
@admin_required
def update_product(product_id):
    """Update a product."""
    data = request.get_json()
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({'success': False, 'error': 'Product not found'}), 404
    
    try:
        if 'name' in data:
            product.name = data['name']
        if 'category' in data:
            product.category = data['category']
        if 'price' in data:
            product.price = data['price']
        if 'original_price' in data:
            product.original_price = data['original_price']
        if 'description' in data:
            product.description = data['description']
        if 'image' in data:
            product.image = data['image']
        if 'quantity' in data:
            product.quantity = data['quantity']
        if 'benefits' in data:
            product.benefits = data['benefits']
        if 'uses' in data:
            product.uses = data['uses']
        if 'how_to_use' in data:
            product.how_to_use = data['how_to_use']
        if 'reviews' in data:
            product.reviews = data['reviews']
        
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Product updated',
            'product': product.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/products/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product(product_id):
    """Delete a product."""
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({'success': False, 'error': 'Product not found'}), 404
    
    try:
        db.session.delete(product)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Product deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== USERS ====================

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    """Get all users with pagination."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    users = User.query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'success': True,
        'users': [u.to_dict() for u in users.items],
        'total': users.total,
        'pages': users.pages,
        'current_page': page
    }), 200

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    """Update a user (role, status, etc)."""
    data = request.get_json()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    try:
        if 'name' in data:
            user.name = data['name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'address' in data:
            user.address = data['address']
        if 'role' in data:
            user.role = data['role']  # 'admin' or 'user'
        if 'status' in data:
            user.status = data['status']  # 'active', 'inactive', 'suspended'
        
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'User updated',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Delete a user."""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'success': True, 'message': 'User deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== ORDERS ====================

@admin_bp.route('/orders', methods=['GET'])
@admin_required
def get_all_orders():
    """Get all orders with pagination."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    orders = Order.query.order_by(Order.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'success': True,
        'orders': [o.to_dict() for o in orders.items],
        'total': orders.total,
        'pages': orders.pages,
        'current_page': page
    }), 200

@admin_bp.route('/orders/<int:order_id>', methods=['PUT'])
@admin_required
def update_order(order_id):
    """Update order status."""
    data = request.get_json()
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({'success': False, 'error': 'Order not found'}), 404
    
    try:
        if 'status' in data:
            order.status = data['status']  # pending, processing, shipped, delivered, cancelled
        
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Order updated',
            'order': order.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/orders/<int:order_id>', methods=['DELETE'])
@admin_required
def delete_order(order_id):
    """Delete an order."""
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({'success': False, 'error': 'Order not found'}), 404
    
    try:
        db.session.delete(order)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Order deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== FORUM ====================

@admin_bp.route('/forum/threads', methods=['GET'])
@admin_required
def get_all_forum_threads():
    """Get all forum threads."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    threads = ForumThread.query.order_by(ForumThread.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'success': True,
        'threads': [t.to_dict() for t in threads.items],
        'total': threads.total,
        'pages': threads.pages,
        'current_page': page
    }), 200

@admin_bp.route('/forum/threads/<int:thread_id>', methods=['PUT'])
@admin_required
def update_forum_thread(thread_id):
    """Update forum thread (close, pin, etc)."""
    data = request.get_json()
    thread = ForumThread.query.get(thread_id)
    
    if not thread:
        return jsonify({'success': False, 'error': 'Thread not found'}), 404
    
    try:
        if 'status' in data:
            thread.status = data['status']  # active, closed, pinned
        if 'title' in data:
            thread.title = data['title']
        
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Thread updated',
            'thread': thread.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/forum/threads/<int:thread_id>', methods=['DELETE'])
@admin_required
def delete_forum_thread(thread_id):
    """Delete a forum thread and its replies."""
    thread = ForumThread.query.get(thread_id)
    
    if not thread:
        return jsonify({'success': False, 'error': 'Thread not found'}), 404
    
    try:
        ForumReply.query.filter_by(thread_id=thread_id).delete()
        db.session.delete(thread)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Thread deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== DASHBOARD STATS ====================

@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_dashboard_stats():
    """Get dashboard statistics."""
    try:
        total_users = User.query.count()
        total_products = Product.query.count()
        total_orders = Order.query.count()
        pending_orders = Order.query.filter_by(status='pending').count()
        total_forum_threads = ForumThread.query.count()
        
        # Revenue calculation
        completed_orders = Order.query.filter_by(status='delivered').all()
        total_revenue = sum(o.total_amount for o in completed_orders)
        
        return jsonify({
            'success': True,
            'stats': {
                'totalUsers': total_users,
                'totalProducts': total_products,
                'totalOrders': total_orders,
                'pendingOrders': pending_orders,
                'totalForumThreads': total_forum_threads,
                'totalRevenue': total_revenue
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
