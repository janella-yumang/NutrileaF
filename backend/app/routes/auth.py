from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user in PostgreSQL."""
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
        from app.models import db, User
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
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
        
        db.session.add(new_user)
        db.session.commit()
        
        print(f"DEBUG: User registered successfully with ID: {new_user.id}")
        print(f"DEBUG: User data: {name}, {email}")

        # Generate JWT token
        secret_key = current_app.config.get('SECRET_KEY', 'supersecretkey')
        token = jwt.encode(
            {
                'user_id': new_user.id,
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
                        "id": new_user.id,
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
        db.session.rollback()
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


@auth_bp.route("/", methods=["GET"])
def auth_root():
    """Test endpoint to verify auth blueprint is working"""
    return jsonify({
        "message": "Auth blueprint is working",
        "endpoints": ["/login", "/register", "/verify", "/health"],
        "methods": ["POST", "GET"]
    }), 200

@auth_bp.route("/health", methods=["GET"])
def health():
    """Health check endpoint for auth service"""
    return jsonify({
        "status": "healthy",
        "service": "auth",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }), 200

@auth_bp.route("/debug/users", methods=["GET"])
def debug_users():
    """Debug endpoint to check user roles"""
    try:
        from app.models import User
        users = User.query.all()
        return jsonify({
            "success": True,
            "users": [
                {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "role": user.role,
                    "status": user.status
                } for user in users
            ]
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    """Login with email and password against PostgreSQL."""
    print(f"DEBUG: Login endpoint called")
    print(f"DEBUG: Request method: {request.method}")
    print(f"DEBUG: Request headers: {dict(request.headers)}")
    
    try:
        data = request.get_json(silent=True) or {}
        print(f"DEBUG: Request data: {data}")

        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        
        print(f"DEBUG: Extracted email: {email}, password: {'*' * len(password) if password else 'None'}")

        if not email or not password:
            print("DEBUG: Missing email or password")
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Email and password are required.",
                    }
                ),
                400,
            )

        # Use SQLAlchemy to query PostgreSQL
        from app.models import db, User
        
        user = User.query.filter_by(email=email).first()
        print(f"DEBUG: User found: {user is not None}")

        if not user or not check_password_hash(user.password_hash, password):
            print("DEBUG: Invalid credentials")
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
            print(f"DEBUG: User not active: {user.status}")
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
            "id": user.id,
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
                'user_id': user.id,
                'email': user.email,
                'role': user.role,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
            },
            secret_key,
            algorithm='HS256'
        )
        
        print(f"DEBUG: Login successful for user: {email}")
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
        print(f"ERROR: Login failed with exception: {str(e)}")
        print(f"ERROR: Exception type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Login failed due to server error.",
                    "error": str(e)
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
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'user': {
                'id': user.id,
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
        from app.models import db, User
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        user.name = full_name
        user.phone = phone
        user.address = address
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'address': user.address,
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500

