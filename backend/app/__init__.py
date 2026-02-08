import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from config import Config
from app.models import db
import datetime

def create_app():
    app = Flask(__name__)
    
    # Error handling middleware
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'success': False, 'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'success': False, 'error': 'Internal server error'}), 500
    
    @app.errorhandler(Exception)
    def handle_exception(e):
        return jsonify({'success': False, 'error': str(e)}), 500
    # Get allowed origins from environment or use defaults
    cors_origins_env = os.environ.get('CORS_ORIGINS', 
        'http://localhost:3000,https://nutrilea-f.vercel.app,https://nutrilea-f.vercel.app/'
    )
    allowed_origins = [origin.strip() for origin in cors_origins_env.split(',')]
    
    # Explicitly add Vercel domain
    vercel_domain = 'https://nutrilea-f.vercel.app'
    if vercel_domain not in allowed_origins:
        allowed_origins.append(vercel_domain)
    
    print(f"CORS allowed origins: {allowed_origins}")
    
    # Add development origins
    if os.environ.get('FLASK_ENV') == 'development':
        allowed_origins.extend([
            'http://127.0.0.1:3000',
            'http://localhost:3000',
            'http://127.0.0.1:5000',
            'http://localhost:5000'
        ])
    
    CORS(app, 
         supports_credentials=True, 
         expose_headers=['Content-Type'],
         origins=allowed_origins,
         allow_headers=['Content-Type', 'Authorization', 'X-Admin-Role'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         max_age=600)
    
    # Add explicit OPTIONS handler for preflight requests
    @app.before_request
    def handle_options():
        if request.method == 'OPTIONS':
            response = jsonify({'status': 'ok'})
            response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin', '*'))
            response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Role')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response

    app.config.from_object(Config)
    app.config['SQLALCHEMY_DATABASE_URI'] = app.config.get('DATABASE_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    print(f"DEBUG: Using database: {app.config.get('SQLALCHEMY_DATABASE_URI')[:50]}..." if app.config.get('SQLALCHEMY_DATABASE_URI') else "ERROR: No database configured")

    # Serve uploaded files
    @app.route('/uploads/<path:filename>')
    def serve_uploads(filename):
        upload_folder = app.config.get('UPLOAD_FOLDER')
        if not upload_folder:
            upload_folder = os.path.join(
                os.path.dirname(os.path.abspath(__file__)),
                'static',
                'uploads',
            )
        # Handle subdirectories in the filename path
        return send_from_directory(upload_folder, filename)

    # Explicit OPTIONS handlers for CORS preflight
    @app.route('/api/<path:path>', methods=['OPTIONS'])
    def handle_api_options(path):
        return '', 200
    
    @app.route('/auth/<path:path>', methods=['OPTIONS'])
    def handle_auth_options(path):
        return '', 200
    
    @app.route('/<path:path>', methods=['OPTIONS'])
    def handle_global_options(path):
        return '', 200

    # Register blueprints
    from app.routes.image_analysis import image_analysis_bp
    from app.routes.growth_classification import growth_bp
    from app.routes.disease_detection import disease_bp
    from app.routes.health_monitoring import health_bp
    from app.routes.nutritional_prediction import nutrition_bp
    from app.routes.market_intelligence import market_bp
    from app.routes.analytics_dashboard import analytics_bp
    from app.routes.chatbot import chatbot_bp
    from app.routes.guides_resources import guides_bp
    from app.routes.auth import auth_bp
    from app.routes.forum_routes import forum_bp
    from app.routes.orders import orders_bp
    from app.routes.admin import admin_bp
    from app.routes.products import products_bp

    app.register_blueprint(image_analysis_bp, url_prefix='/api/image')
    app.register_blueprint(growth_bp, url_prefix='/api/growth')
    app.register_blueprint(disease_bp, url_prefix='/api/disease')
    app.register_blueprint(health_bp, url_prefix='/api/health')
    app.register_blueprint(nutrition_bp, url_prefix='/api/nutrition')
    app.register_blueprint(market_bp, url_prefix='/api/market')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')
    app.register_blueprint(guides_bp, url_prefix='/api/guides')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(forum_bp)
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(admin_bp)
    app.register_blueprint(products_bp)

    @app.route("/")
    def home():
        return "API is running!"
    
    @app.route("/test")
    def test():
        return jsonify({
            "message": "Test endpoint working",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "routes": [str(rule) for rule in app.url_map.iter_rules()]
        }), 200
    
    return app
