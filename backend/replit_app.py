from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app, origins=['*'])  # Allow all origins for Replit

# Mock user database
users = {}

@app.route('/')
def home():
    return "NutriLeaf Mock API is running on Replit!"

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
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
            "address": data.get('address'),
            "password": data.get('password')  # In real app, this would be hashed
        }
        
        return jsonify({
            "success": True,
            "message": "Registration successful!",
            "user": {
                "id": user_id,
                "fullName": data.get('fullName'),
                "email": email,
                "phone": data.get('phone'),
                "address": data.get('address')
            },
            "token": f"mock-token-{user_id}"
        }), 201
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Registration error: {str(e)}"
        }), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if email not in users:
            return jsonify({
                "success": False,
                "message": "Invalid email or password"
            }), 401
        
        user = users[email]
        if user['password'] != password:
            return jsonify({
                "success": False,
                "message": "Invalid email or password"
            }), 401
        
        return jsonify({
            "success": True,
            "message": "Login successful!",
            "user": {
                "id": user['id'],
                "fullName": user['fullName'],
                "email": user['email'],
                "phone": user['phone'],
                "address": user['address']
            },
            "token": f"mock-token-{user['id']}"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Login error: {str(e)}"
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
