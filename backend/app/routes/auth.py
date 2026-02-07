from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import os
import sqlite3
from typing import Tuple
import jwt
import datetime


auth_bp = Blueprint("auth", __name__)


def _get_db_path() -> str:
    """Get the absolute path to the database file."""
    uri = current_app.config.get("DATABASE_URI", "sqlite:///data/database.db")
    
    if uri.startswith("sqlite:///"):
        relative_path = uri[len("sqlite:///") :]
    else:
        # If a full URI or something else is provided, just use it as a filesystem path
        relative_path = uri

    # On Render, use /tmp directory for storage (best option for Render)
    if os.environ.get('RENDER'):
        # Use /tmp directory which is writable on Render
        data_dir = "/tmp/nutrileaf_data"
        try:
            os.makedirs(data_dir, mode=0o777, exist_ok=True)
            db_path = os.path.join(data_dir, "database.db")
            print(f"DEBUG: Created/verified data directory: {data_dir}")
        except Exception as e:
            print(f"ERROR: Failed to create data directory: {e}")
            # Ultimate fallback - use current working directory
            db_path = "database.db"
            print(f"DEBUG: Using fallback database path: {db_path}")
    else:
        # current_app.root_path -> backend/app
        backend_root = os.path.abspath(os.path.join(current_app.root_path, ".."))
        db_path = os.path.join(backend_root, relative_path)
    
    print(f"DEBUG: Database URI: {uri}")
    print(f"DEBUG: Backend root: {os.path.abspath(os.path.join(current_app.root_path, '..'))}")
    print(f"DEBUG: Relative path: {relative_path}")
    print(f"DEBUG: Final database path: {db_path}")
    print(f"DEBUG: Database file exists: {os.path.exists(db_path)}")
    print(f"DEBUG: Running on Render: {bool(os.environ.get('RENDER'))}")

    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    return db_path


def _get_connection():
    """Get a database connection (SQLite or PostgreSQL)."""
    db_uri = current_app.config.get("DATABASE_URI", "sqlite:///data/database.db")
    
    if db_uri.startswith("postgresql://") or db_uri.startswith("postgres://"):
        # PostgreSQL connection - import only when needed
        try:
            import psycopg2
            conn = psycopg2.connect(db_uri)
            conn.autocommit = True
            return conn
        except Exception as e:
            print(f"ERROR: Failed to connect to PostgreSQL: {e}")
            # Fallback to SQLite
            db_uri = "sqlite:///data/database.db"
    
    # SQLite connection
    if db_uri.startswith("sqlite:///"):
        relative_path = db_uri[len("sqlite:///") :]
    else:
        relative_path = db_uri

    # On Render, use /tmp directory for storage (best option for Render)
    if os.environ.get('RENDER'):
        # Use /tmp directory which is writable on Render
        data_dir = "/tmp/nutrileaf_data"
        try:
            os.makedirs(data_dir, mode=0o777, exist_ok=True)
            db_path = os.path.join(data_dir, "database.db")
            print(f"DEBUG: Created/verified data directory: {data_dir}")
        except Exception as e:
            print(f"ERROR: Failed to create data directory: {e}")
            # Ultimate fallback - use current working directory
            db_path = "database.db"
            print(f"DEBUG: Using fallback database path: {db_path}")
    else:
        # current_app.root_path -> backend/app
        backend_root = os.path.abspath(os.path.join(current_app.root_path, ".."))
        db_path = os.path.join(backend_root, relative_path)
    
    print(f"DEBUG: Database URI: {db_uri}")
    print(f"DEBUG: Final database path: {db_path}")
    print(f"DEBUG: Database file exists: {os.path.exists(db_path)}")
    print(f"DEBUG: Running on Render: {bool(os.environ.get('RENDER'))}")

    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def _init_db() -> None:
    """Ensure the users table exists."""
    conn = _get_connection()
    try:
        cur = conn.cursor()
        
        # Check if using PostgreSQL
        db_uri = current_app.config.get("DATABASE_URI", "sqlite:///data/database.db")
        is_postgresql = db_uri.startswith("postgresql://") or db_uri.startswith("postgres://")
        
        if is_postgresql:
            # PostgreSQL syntax
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    full_name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    phone TEXT,
                    address TEXT,
                    password_hash TEXT NOT NULL,
                    profile_image TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
        else:
            # SQLite syntax
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    full_name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    phone TEXT,
                    address TEXT,
                    password_hash TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            
            # Check if profile_image column exists in SQLite
            cur.execute("PRAGMA table_info(users)")
            columns = [column[1] for column in cur.fetchall()]
            if 'profile_image' not in columns:
                cur.execute("ALTER TABLE users ADD COLUMN profile_image TEXT")
                print("Added profile_image column to users table")
        
        conn.commit()
    finally:
        conn.close()


@auth_bp.before_app_request
def ensure_db_initialized() -> None:
    # This is cheap thanks to IF NOT EXISTS
    _init_db()


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


@auth_bp.route("/login", methods=["POST"])
def login():
    """Login with email and password against PostgreSQL."""
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
        # Use SQLAlchemy to query PostgreSQL
        from app.models import db, User
        
        user = User.query.filter_by(email=email).first()

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
        
        conn = _get_connection()
        try:
            cur = conn.cursor()
            cur.execute(
                "SELECT id, full_name, email, phone, address, profile_image FROM users WHERE id = ?",
                (user_id,)
            )
            row = cur.fetchone()
            
            if not row:
                return jsonify({'success': False, 'message': 'User not found'}), 404
            
            user = {
                'id': row['id'],
                'fullName': row['full_name'],
                'email': row['email'],
                'phone': row['phone'],
                'address': row['address'],
                'profileImage': row['profile_image'],
            }
            
            return jsonify({'success': True, 'user': user})
        finally:
            conn.close()
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
    
    conn = _get_connection()
    try:
        cur = conn.cursor()
        
        # Update user profile (note: email is not updatable)
        cur.execute(
            """
            UPDATE users 
            SET full_name = ?, phone = ?, address = ?
            WHERE id = ?
            """,
            (full_name, phone, address, user_id)
        )
        conn.commit()
        
        # Fetch and return updated user data
        cur.execute(
            "SELECT id, full_name, email, phone, address FROM users WHERE id = ?",
            (user_id,)
        )
        row = cur.fetchone()
        
        if not row:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        user = {
            'id': row['id'],
            'fullName': row['full_name'],
            'email': row['email'],
            'phone': row['phone'],
            'address': row['address'],
        }
        
        return jsonify({'success': True, 'message': 'Profile updated successfully', 'user': user})
    finally:
        conn.close()

