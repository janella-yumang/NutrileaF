import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config
from mongoengine import connect

def create_app():
    app = Flask(__name__)
    # Get allowed origins from environment or use defaults
    cors_origins_env = os.environ.get('CORS_ORIGINS', 
        'http://localhost:3000,https://nutrilea-f.vercel.app,https://nutrilea-f.vercel.app/,https://nutrileaf-10.onrender.com'
    )
    allowed_origins = [origin.strip() for origin in cors_origins_env.split(',')]
    
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
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

    app.config.from_object(Config)
    
    # Connect to MongoDB
    try:
        connect(db='Nutrileaf', host=Config.MONGODB_URI)
        print(f"✅ MongoDB connected successfully: {Config.MONGODB_URI[:50]}...")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
    
    print(f"DEBUG: Using MongoDB database: {app.config.get('MONGODB_URI')[:50]}..." if app.config.get('MONGODB_URI') else "ERROR: No database configured")

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
    app.register_blueprint(forum_bp)
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(admin_bp)

    @app.route("/")
    def home():
        return "API is running!"
    
    return app
