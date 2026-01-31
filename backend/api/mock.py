import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app, origins=['https://nutrilea-f.vercel.app', 'https://nutrilea-f.vercel.app/'], supports_credentials=True)

# Mock user database
users = {}

@app.route('/')
def home():
    return "NutriLeaf Mock API is running!"

@app.route('/api/auth/register', methods=['POST'])
def register():
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
        "token": f"mock_token_{user_id}"
    })

@app.route('/api/auth/login', methods=['POST'])
def login():
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
        "token": f"mock_token_{users[email]['id']}"
    })

@app.route('/api/forum/posts', methods=['GET', 'POST'])
def forum_posts():
    if request.method == 'GET':
        return jsonify({
            "success": True,
            "posts": [
                {
                    "id": 1,
                    "userId": 1,
                    "userName": "Test User",
                    "title": "Welcome to NutriLeaf Forum!",
                    "content": "This is a test post for the forum.",
                    "createdAt": "2024-01-31T10:00:00Z",
                    "likeCount": 5,
                    "commentCount": 2
                }
            ]
        })
    
    # POST - create new post
    return jsonify({
        "success": True,
        "post": {
            "id": 2,
            "userId": 1,
            "userName": "Current User",
            "title": request.json.get('title'),
            "content": request.json.get('content'),
            "createdAt": "2024-01-31T10:00:00Z",
            "likeCount": 0,
            "commentCount": 0
        }
    })

# Vercel serverless function handler
def handler(request):
    return app(request.environ, lambda status, headers: None)
