"""
Admin CRUD routes for managing products, users, orders, and forum.
Requires admin role to access.
"""

from flask import Blueprint, request, jsonify, current_app
from functools import wraps
from werkzeug.security import generate_password_hash
from werkzeug.utils import secure_filename
import os
from app.models import Product, User, Order, ForumThread, ForumReply, ProductCategory, Review

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


@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_admin_stats():
    """Get admin dashboard stats."""
    try:
        stats = {
            'products': Product.objects.count(),
            'users': User.objects.count(),
            'orders': Order.objects.count(),
            'forumThreads': ForumThread.objects.count(),
            'categories': ProductCategory.objects.count(),
            'reviews': Review.objects.count(),
        }

        return jsonify({'success': True, 'stats': stats}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== PRODUCTS ====================

@admin_bp.route('/products', methods=['GET'])
@admin_required
def get_all_products():
    """Get all products with pagination."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Use MongoEngine syntax
    products = Product.objects.skip((page - 1) * per_page).limit(per_page)
    total = Product.objects.count()
    
    # Convert to dict and handle ObjectId serialization
    products_list = []
    for product in products:
        product_dict = {
            'id': str(product.id),
            'name': product.name,
            'category': product.category,
            'price': product.price,
            'original_price': product.original_price,
            'description': product.description,
            'image': product.image,
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

@admin_bp.route('/users', methods=['POST'])
@admin_required
def create_user():
    """Create a new user."""
    data = request.get_json() or {}

    email = data.get('email')
    if not email:
        return jsonify({'success': False, 'error': 'Email is required'}), 400

    # Use MongoEngine syntax
    existing = User.objects(email=email).first()
    if existing:
        return jsonify({'success': False, 'error': 'Email already exists'}), 409

    try:
        password = data.get('password')
        password_hash = generate_password_hash(password) if password else None

        user = User(
            email=email,
            name=data.get('name'),
            phone=data.get('phone'),
            address=data.get('address'),
            role=data.get('role', 'user'),
            status=data.get('status', 'active'),
            password_hash=password_hash,
        )
        user.save()  # Use MongoEngine save()

        return jsonify({
            'success': True,
            'message': 'User created',
            'userId': str(user.id),  # Convert ObjectId to string
            'user': {
                'id': str(user.id),
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'address': user.address,
                'role': user.role,
                'status': user.status
            }
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/products', methods=['POST'])
@admin_required
def create_product():
    """Create a new product with optional image upload."""
    data = request.form if request.files else request.get_json()
    
    try:
        # Handle image upload
        image_urls = []
        if 'images' in request.files:
            files = request.files.getlist('images')
            upload_folder = current_app.config.get('UPLOAD_FOLDER', 'app/static/uploads')
            os.makedirs(upload_folder, exist_ok=True)
            
            for file in files:
                if file and file.filename:
                    filename = secure_filename(file.filename)
                    file_path = os.path.join(upload_folder, filename)
                    file.save(file_path)
                    # Store relative URL for frontend access
                    image_urls.append(f'/uploads/{filename}')
        
        # Handle single image upload
        if 'image' in request.files and request.files['image'].filename:
            file = request.files['image']
            filename = secure_filename(file.filename)
            upload_folder = current_app.config.get('UPLOAD_FOLDER', 'app/static/uploads')
            os.makedirs(upload_folder, exist_ok=True)
            file_path = os.path.join(upload_folder, filename)
            file.save(file_path)
            image_urls = [f'/uploads/{filename}']
        
        # If no images uploaded but image URLs provided in JSON
        if not image_urls and data.get('image'):
            if isinstance(data.get('image'), str):
                image_urls = [data.get('image')]
            elif isinstance(data.get('image'), list):
                image_urls = data.get('image')
        
        product = Product(
            name=data.get('name'),
            category=data.get('category'),
            price=float(data.get('price', 0)),
            original_price=float(data.get('original_price', 0)) if data.get('original_price') else None,
            description=data.get('description'),
            image=image_urls if image_urls else [],
            quantity=data.get('quantity'),
            benefits=data.get('benefits', []),
            uses=data.get('uses', []),
            how_to_use=data.get('how_to_use', []),
            reviews=data.get('reviews', [])
        )
        product.save()  # Use MongoEngine save()
        
        return jsonify({
            'success': True,
            'message': 'Product created',
            'productId': str(product.id),  # Convert ObjectId to string
            'product': {
                'id': str(product.id),
                'name': product.name,
                'category': product.category,
                'price': product.price,
                'original_price': product.original_price,
                'description': product.description,
                'image': product.image,
                'quantity': product.quantity,
                'benefits': product.benefits,
                'uses': product.uses,
                'how_to_use': product.how_to_use,
                'reviews': product.reviews
            }
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/products/<string:product_id>', methods=['PUT'])
@admin_required
def update_product(product_id):
    """Update a product with optional image upload."""
    data = request.form if request.files else request.get_json()
    product = Product.objects(id=product_id).first()  # Use MongoEngine syntax
    
    if not product:
        return jsonify({'success': False, 'error': 'Product not found'}), 404
    
    try:
        # Handle image upload
        image_urls = product.image or []
        
        # Handle single image upload (replaces existing images)
        if 'image' in request.files and request.files['image'].filename:
            file = request.files['image']
            filename = secure_filename(file.filename)
            upload_folder = current_app.config.get('UPLOAD_FOLDER', 'app/static/uploads')
            os.makedirs(upload_folder, exist_ok=True)
            file_path = os.path.join(upload_folder, filename)
            file.save(file_path)
            image_urls = [f'/uploads/{filename}']
        
        # Handle multiple image upload (replaces existing images)
        elif 'images' in request.files:
            files = request.files.getlist('images')
            upload_folder = current_app.config.get('UPLOAD_FOLDER', 'app/static/uploads')
            os.makedirs(upload_folder, exist_ok=True)
            image_urls = []
            
            for file in files:
                if file and file.filename:
                    filename = secure_filename(file.filename)
                    file_path = os.path.join(upload_folder, filename)
                    file.save(file_path)
                    image_urls.append(f'/uploads/{filename}')
        
        # Handle image URLs from JSON (not file upload)
        elif 'image' in data and not request.files:
            if isinstance(data['image'], str):
                image_urls = [data['image']] if data['image'] else []
            elif isinstance(data['image'], list):
                image_urls = data['image']
        
        # Handle images array from JSON
        elif 'images' in data and not request.files:
            if isinstance(data['images'], list):
                image_urls = data['images']
        
        # Ensure at least one image exists - if no images provided, keep existing
        if not image_urls and product.image:
            image_urls = product.image
        elif not image_urls:
            # If no images at all, provide a default emoji or placeholder
            image_urls = ['🌿']  # Default emoji for products
        
        # Update fields
        if 'name' in data:
            product.name = data['name']
        if 'category' in data:
            product.category = data['category']
        if 'price' in data:
            product.price = float(data['price'])
        if 'original_price' in data:
            product.original_price = float(data['original_price']) if data['original_price'] else None
        if 'description' in data:
            product.description = data['description']
        
        # Always update image field
        product.image = image_urls
        
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
        
        product.save()  # Use MongoEngine save()
        return jsonify({
            'success': True,
            'message': 'Product updated successfully',
            'product': {
                'id': str(product.id),
                'name': product.name,
                'category': product.category,
                'price': product.price,
                'original_price': product.original_price,
                'description': product.description,
                'image': product.image,
                'quantity': product.quantity,
                'benefits': product.benefits,
                'uses': product.uses,
                'how_to_use': product.how_to_use,
                'reviews': product.reviews
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/products/<string:product_id>', methods=['DELETE'])
@admin_required
def delete_product(product_id):
    """Delete a product."""
    product = Product.objects(id=product_id).first()  # Use MongoEngine syntax
    
    if not product:
        return jsonify({'success': False, 'error': 'Product not found'}), 404
    
    try:
        product.delete()  # Use MongoEngine delete()
        return jsonify({'success': True, 'message': 'Product deleted'}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== USERS ====================

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    """Get all users with pagination."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Use MongoEngine syntax
    users = User.objects.skip((page - 1) * per_page).limit(per_page)
    total = User.objects.count()
    
    # Convert to dict and handle ObjectId serialization
    users_list = []
    for user in users:
        user_dict = {
            'id': str(user.id),
            'name': user.name,
            'email': user.email,
            'phone': user.phone,
            'address': user.address,
            'role': user.role,
            'status': user.status
        }
        users_list.append(user_dict)
    
    return jsonify({
        'success': True,
        'users': users_list,
        'total': total,
        'pages': (total + per_page - 1) // per_page,
        'current_page': page
    }), 200

@admin_bp.route('/users/<string:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    """Update a user (role, status, etc)."""
    data = request.get_json()
    user = User.objects(id=user_id).first()  # Use MongoEngine syntax
    
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
        
        user.save()  # Use MongoEngine save()
        return jsonify({
            'success': True,
            'message': 'User updated',
            'user': {
                'id': str(user.id),
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'address': user.address,
                'role': user.role,
                'status': user.status
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/users/<string:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Delete a user."""
    user = User.objects(id=user_id).first()  # Use MongoEngine syntax
    
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    try:
        user.delete()  # Use MongoEngine delete()
        return jsonify({'success': True, 'message': 'User deleted'}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== ORDERS ====================

@admin_bp.route('/orders', methods=['GET'])
@admin_required
def get_all_orders():
    """Get all orders with pagination."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Use MongoEngine syntax
    orders = Order.objects.skip((page - 1) * per_page).limit(per_page)
    total = Order.objects.count()
    
    # Convert to dict and handle ObjectId serialization
    orders_list = []
    for order in orders:
        order_dict = {
            'id': str(order.id),
            'user_id': str(order.user_id) if order.user_id else None,
            'status': order.status,
            'total_amount': order.total_amount,
            'created_at': order.created_at.isoformat() if order.created_at else None,
            'updated_at': order.updated_at.isoformat() if order.updated_at else None
        }
        orders_list.append(order_dict)
    
    return jsonify({
        'success': True,
        'orders': orders_list,
        'total': total,
        'pages': (total + per_page - 1) // per_page,
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
    
    # Use MongoEngine syntax
    threads = ForumThread.objects.skip((page - 1) * per_page).limit(per_page)
    total = ForumThread.objects.count()
    
    # Convert to dict and handle ObjectId serialization
    threads_list = []
    for thread in threads:
        thread_dict = {
            'id': str(thread.id),
            'title': thread.title,
            'content': thread.content,
            'author': thread.author,
            'status': thread.status,
            'created_at': thread.created_at.isoformat() if thread.created_at else None,
            'updated_at': thread.updated_at.isoformat() if thread.updated_at else None
        }
        threads_list.append(thread_dict)
    
    return jsonify({
        'success': True,
        'threads': threads_list,
        'total': total,
        'pages': (total + per_page - 1) // per_page,
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

# ==================== PRODUCT CATEGORIES ====================

@admin_bp.route('/categories', methods=['GET'])
@admin_required
def get_all_categories():
    """Get all product categories."""
    # Use MongoEngine syntax
    categories = ProductCategory.objects.all()
    
    # Convert to dict and handle ObjectId serialization
    categories_list = []
    for category in categories:
        category_dict = {
            'id': str(category.id),
            'name': category.name,
            'description': category.description,
            'image': category.image,
            'status': category.status
        }
        categories_list.append(category_dict)
    
    return jsonify({
        'success': True,
        'categories': categories_list,
        'total': len(categories_list)
    }), 200

# Public endpoint for categories (no admin required)
@admin_bp.route('/categories/public', methods=['GET'])
def get_categories_public():
    """Get all active product categories for public use."""
    # Use MongoEngine syntax
    categories = ProductCategory.objects(status='active')
    
    # Convert to dict and handle ObjectId serialization
    categories_list = []
    for category in categories:
        category_dict = {
            'id': str(category.id),
            'name': category.name
        }
        categories_list.append(category_dict)
    
    return jsonify({
        'success': True,
        'categories': categories_list,
        'total': len(categories_list)
    }), 200

@admin_bp.route('/categories', methods=['POST'])
@admin_required
def create_category():
    """Create a new product category with optional image upload."""
    data = request.form if request.files else request.get_json()
    
    try:
        # Handle image upload
        image_url = None
        if 'image' in request.files and request.files['image'].filename:
            file = request.files['image']
            filename = secure_filename(file.filename)
            upload_folder = current_app.config.get('UPLOAD_FOLDER', 'app/static/uploads')
            os.makedirs(upload_folder, exist_ok=True)
            file_path = os.path.join(upload_folder, filename)
            file.save(file_path)
            image_url = f'/uploads/{filename}'
        
        # If no image uploaded but image URL provided in JSON
        if not image_url and data.get('image'):
            image_url = data.get('image')
        
        category = ProductCategory(
            name=data.get('name'),
            description=data.get('description'),
            image=image_url,
            status=data.get('status', 'active')
        )
        db.session.add(category)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Category created',
            'categoryId': category.id,
            'category': category.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/categories/<int:category_id>', methods=['PUT'])
@admin_required
def update_category(category_id):
    """Update a product category with optional image upload."""
    data = request.form if request.files else request.get_json()
    category = ProductCategory.query.get(category_id)
    
    if not category:
        return jsonify({'success': False, 'error': 'Category not found'}), 404
    
    try:
        # Handle image upload
        image_url = category.image
        if 'image' in request.files and request.files['image'].filename:
            file = request.files['image']
            filename = secure_filename(file.filename)
            upload_folder = current_app.config.get('UPLOAD_FOLDER', 'app/static/uploads')
            os.makedirs(upload_folder, exist_ok=True)
            file_path = os.path.join(upload_folder, filename)
            file.save(file_path)
            image_url = f'/uploads/{filename}'
        
        # Update fields
        if 'name' in data:
            category.name = data['name']
        if 'description' in data:
            category.description = data['description']
        if 'image' in data and not request.files:
            image_url = data['image']
        if 'status' in data:
            category.status = data['status']
        
        # Update image if changed
        if request.files or ('image' in data and not request.files):
            category.image = image_url
        
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Category updated',
            'category': category.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@admin_required
def delete_category(category_id):
    """Delete a product category."""
    category = ProductCategory.query.get(category_id)
    
    if not category:
        return jsonify({'success': False, 'error': 'Category not found'}), 404
    
    try:
        db.session.delete(category)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Category deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== REVIEWS ====================

@admin_bp.route('/reviews', methods=['GET'])
@admin_required
def get_all_reviews():
    """Get all reviews with pagination."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    reviews = Review.query.order_by(Review.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'success': True,
        'reviews': [r.to_dict() for r in reviews.items],
        'total': reviews.total,
        'pages': reviews.pages,
        'current_page': page
    }), 200

@admin_bp.route('/reviews', methods=['POST'])
@admin_required
def create_review():
    """Create a new review."""
    data = request.get_json()
    
    try:
        review = Review(
            product_id=data.get('product_id'),
            user_id=data.get('user_id'),
            rating=data.get('rating'),
            title=data.get('title'),
            content=data.get('content'),
            status=data.get('status', 'active')
        )
        db.session.add(review)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Review created',
            'reviewId': review.id,
            'review': review.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/reviews/<int:review_id>', methods=['PUT'])
@admin_required
def update_review(review_id):
    """Update a review."""
    data = request.get_json()
    review = Review.query.get(review_id)
    
    if not review:
        return jsonify({'success': False, 'error': 'Review not found'}), 404
    
    try:
        if 'rating' in data:
            review.rating = data['rating']
        if 'title' in data:
            review.title = data['title']
        if 'content' in data:
            review.content = data['content']
        if 'status' in data:
            review.status = data['status']
        
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Review updated',
            'review': review.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/reviews/<int:review_id>', methods=['DELETE'])
@admin_required
def delete_review(review_id):
    """Delete a review."""
    review = Review.query.get(review_id)
    
    if not review:
        return jsonify({'success': False, 'error': 'Review not found'}), 404
    
    try:
        db.session.delete(review)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Review deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
