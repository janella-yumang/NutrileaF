import sys, os, datetime
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from flask import Flask, send_from_directory, request
from flask_cors import CORS
from config import Config
from mongoengine import connect

def create_app():
    app = Flask(__name__)
    
    # Explicit CORS configuration for production
    allowed_origins = [
        'https://nutrilea-f.vercel.app',
        'https://nutrilea-f.vercel.app/',
        'https://nutrilea-10.onrender.com',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5000',
        'http://127.0.0.1:5000'
    ]
    
    # Add any additional origins from environment
    cors_origins_env = os.environ.get('CORS_ORIGINS', '')
    if cors_origins_env:
        additional_origins = [origin.strip() for origin in cors_origins_env.split(',') if origin.strip()]
        allowed_origins.extend(additional_origins)
    
    # Configure CORS with explicit settings for preflight handling
    CORS(app, 
         supports_credentials=True, 
         expose_headers=['Content-Type', 'X-Admin-Role'],
         origins=allowed_origins,
         allow_headers=['Content-Type', 'Authorization', 'X-Admin-Role', 'X-Requested-With'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         max_age=86400)  # Cache preflight for 24 hours

    app.config.from_object(Config)
    
    # Debug logging middleware
    @app.before_request
    def log_request_info():
        print(f"DEBUG: {request.method} {request.path} - Origin: {request.headers.get('Origin', 'None')}")

    # Connect to MongoDB with better error handling
    max_retries = 3
    for attempt in range(max_retries):
        try:
            print(f"DEBUG: Attempt {attempt + 1} - Connecting to MongoDB...")
            print(f"DEBUG: MONGODB_URI from config: {Config.MONGODB_URI[:50]}...")
            
            connection = connect(db='Nutrileaf', host=Config.MONGODB_URI)
            print(f"✅ MongoDB connected successfully: {Config.MONGODB_URI[:50]}...")
            break
            
        except Exception as e:
            print(f"❌ MongoDB connection attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                print(f"Retrying in 2 seconds... ({attempt + 1}/{max_retries})")
                import time
                time.sleep(2)
            else:
                print(f"❌ All connection attempts failed. Using fallback mode.")
                print("⚠️  App will run but database features will be limited.")
                # Continue without database connection for basic functionality
    
    print(f"DEBUG: Using MongoDB database: {app.config.get('MONGODB_URI')[:50]}..." if app.config.get('MONGODB_URI') else "ERROR: No database configured")

    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint to verify backend status"""
        try:
            # Check database connection
            from app.models import Product
            product_count = Product.objects.count()
            
            return jsonify({
                'status': 'healthy',
                'database': 'connected',
                'products_count': product_count,
                'timestamp': str(datetime.datetime.utcnow())
            }), 200
        except Exception as e:
            return jsonify({
                'status': 'unhealthy',
                'database': 'disconnected',
                'error': str(e),
                'timestamp': str(datetime.datetime.utcnow())
            }), 503

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
    app.register_blueprint(forum_bp, url_prefix='/api/forum')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    
    @app.route("/")
    def home():
        return "API is running!"
    
    return app
