from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user in MongoDB."""
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or data.get("fullName") or "").strip()
    email = (data.get("email") or "").strip().lower()
    phone = (data.get("phone") or "").strip()
    address = (data.get("address") or "").strip()
    password = data.get("password") or ""

    if not name or not email or not password:
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Name, email, and password are required.",
                }
            ),
            400,
        )

    try:
        from app.models import User

        # Check if user already exists
        existing_user = User.objects(email=email).first()
        if existing_user:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "An account with this email already exists.",
                        "field": "email",
                    }
                ),
                400,
            )

        password_hash = generate_password_hash(password)

        # Create new user with default role='user' and status='active'
        new_user = User(
            name=name,
            email=email,
            phone=phone,
            address=address,
            password_hash=password_hash,
            role='user',
            status='active'
        )
        new_user.save()
        
        print(f"DEBUG: User registered successfully with ID: {new_user.id}")
        print(f"DEBUG: User data: {name}, {email}")

        # Generate JWT token
        secret_key = current_app.config.get('SECRET_KEY', 'supersecretkey')
        token = jwt.encode(
            {
                'user_id': str(new_user.id),
                'email': email,
                'role': 'user',
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
            },
            secret_key,
            algorithm='HS256'
        )

        return (
            jsonify(
                {
                    "success": True,
                    "user": {
                        "id": str(new_user.id),
                        "name": name,
                        "email": email,
                        "phone": phone,
                        "address": address,
                        "role": "user"
                    },
                    "token": token,
                }
            ),
            201,
        )
    except Exception as e:
        print(f"Registration error: {e}")
        return (
            jsonify(
                {
                    "success": False,
                    "message": f"Registration error: {str(e)}",
                }
            ),
            500,
        )


@auth_bp.route("/login", methods=["POST"])
def login():
    """Login with email and password against MongoDB."""
    data = request.get_json(silent=True) or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Email and password are required.",
                }
            ),
            400,
        )

    try:
        from app.models import User

        user = User.objects(email=email).first()

        if not user or not check_password_hash(user.password_hash, password):
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Invalid email or password.",
                    }
                ),
                401,
            )

        # Check if user is active
        if user.status != 'active':
            return (
                jsonify(
                    {
                        "success": False,
                        "message": f"Account is {user.status}.",
                    }
                ),
                401,
            )

        user_data = {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "address": user.address,
            "role": user.role
        }

        # Generate JWT token
        secret_key = current_app.config.get('SECRET_KEY', 'supersecretkey')
        token = jwt.encode(
            {
                'user_id': str(user.id),
                'email': user.email,
                'role': user.role,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
            },
            secret_key,
            algorithm='HS256'
        )

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Login successful.",
                    "user": user_data,
                    "token": token,
                }
            ),
            200,
        )

    except Exception as e:
        print(f"Login error: {e}")
        return (
            jsonify(
                {
                    "success": False,
                    "message": f"Login error: {str(e)}",
                }
            ),
            500,
        )


@auth_bp.route("/verify", methods=["GET"])
def verify_token():
    """Verify JWT token and return user info"""
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'success': False, 'message': 'Missing or invalid token'}), 401
    
    token = auth_header.split(' ')[1]
    secret_key = current_app.config.get('SECRET_KEY', 'supersecretkey')
    
    try:
        payload = jwt.decode(token, secret_key, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        from app.models import User
        user = User.objects(id=user_id).first()
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'user': {
                'id': str(user.id),
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'address': user.address,
                'role': user.role
            }
        })
    except jwt.ExpiredSignatureError:
        return jsonify({'success': False, 'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'success': False, 'message': 'Invalid token'}), 401


@auth_bp.route("/update-profile", methods=["POST"])
def update_profile():
    """Update user profile information"""
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'success': False, 'message': 'Missing or invalid token'}), 401
    
    token = auth_header.split(' ')[1]
    secret_key = current_app.config.get('SECRET_KEY', 'supersecretkey')
    
    try:
        payload = jwt.decode(token, secret_key, algorithms=['HS256'])
        user_id = payload.get('user_id')
    except jwt.ExpiredSignatureError:
        return jsonify({'success': False, 'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'success': False, 'message': 'Invalid token'}), 401
    
    data = request.get_json(silent=True) or {}
    
    # Extract fields, with validation
    full_name = (data.get('fullName') or '').strip()
    phone = (data.get('phone') or '').strip()
    address = (data.get('address') or '').strip()
    
    if not full_name:
        return jsonify({'success': False, 'message': 'Full name is required'}), 400
    
    try:
        from app.models import User
        user = User.objects(id=user_id).first()
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        user.name = full_name
        user.phone = phone
        user.address = address
        user.save()
        
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'user': {
                'id': str(user.id),
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'address': user.address,
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500

