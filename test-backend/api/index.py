from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)

# Configure CORS for Vercel frontend
CORS(app, 
     origins=['https://nutrilea-f.vercel.app', 'https://nutrilea-f.vercel.app/'],
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Mock user database
users = {}

@app.route('/')
def home():
    return jsonify({"message": "NutriLeaf Test API is running!"})

@app.route('/api/auth/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return '', 200
        
    data = request.get_json()
    email = data.get('email')
    
    if email in users:
        return jsonify({
            "success": False,
            "message": "An account with this email already exists.",
            "field": "email"
        }), 400
    
    # Create new user
    user_id = len(users) + 1
    users[email] = {
        "id": user_id,
        "fullName": data.get('fullName'),
        "email": email,
        "phone": data.get('phone'),
        "address": data.get('address')
    }
    
    return jsonify({
        "success": True,
        "message": "Registration successful!",
        "user": users[email],
        "token": f"test_token_{user_id}"
    })

@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
        
    data = request.get_json()
    email = data.get('email')
    
    if email not in users:
        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 401
    
    return jsonify({
        "success": True,
        "message": "Login successful!",
        "user": users[email],
        "token": f"test_token_{users[email]['id']}"
    })

@app.route('/api/forum/posts', methods=['GET', 'POST', 'OPTIONS'])
def forum_posts():
    if request.method == 'OPTIONS':
        return '', 200
        
    if request.method == 'GET':
        return jsonify({
            "success": True,
            "posts": [
                {
                    "id": 1,
                    "userId": 1,
                    "userName": "Test User",
                    "title": "Welcome to NutriLeaf Forum!",
                    "content": "This is a test post for the forum. CORS testing in progress.",
                    "createdAt": "2024-01-31T10:00:00Z",
                    "likeCount": 5,
                    "commentCount": 2
                }
            ]
        })
    
    # POST - create new post
    data = request.get_json()
    return jsonify({
        "success": True,
        "post": {
            "id": 2,
            "userId": 1,
            "userName": "Current User",
            "title": data.get('title'),
            "content": data.get('content'),
            "createdAt": "2024-01-31T10:00:00Z",
            "likeCount": 0,
            "commentCount": 0
        }
    })

@app.route('/api/forum/posts/<int:post_id>/like', methods=['POST', 'OPTIONS'])
def like_post(post_id):
    if request.method == 'OPTIONS':
        return '', 200
        
    return jsonify({
        "success": True,
        "likeCount": 6
    })

# Vercel serverless function handler
def handler(request):
    return app(request.environ, lambda status, headers: None)
