from flask import Flask
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "NutriLeaf Backend is running!"

@app.route('/api/auth/register', methods=['POST'])
def register():
    return json.dumps({
        "success": True,
        "message": "Registration successful (demo mode)",
        "token": "demo-token-123",
        "user": {
            "id": 1,
            "email": "test@example.com",
            "fullName": "Test User"
        }
    })

@app.route('/api/auth/login', methods=['POST'])
def login():
    return json.dumps({
        "success": True,
        "message": "Login successful (demo mode)",
        "token": "demo-token-123",
        "user": {
            "id": 1,
            "email": "test@example.com",
            "fullName": "Test User"
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
