from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)  # allows cross-origin requests

    app.config.from_object('config.Config')

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

    app.register_blueprint(image_analysis_bp, url_prefix='/api/image')
    app.register_blueprint(growth_bp, url_prefix='/api/growth')
    app.register_blueprint(disease_bp, url_prefix='/api/disease')
    app.register_blueprint(health_bp, url_prefix='/api/health')
    app.register_blueprint(nutrition_bp, url_prefix='/api/nutrition')
    app.register_blueprint(market_bp, url_prefix='/api/market')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')
    app.register_blueprint(guides_bp, url_prefix='/api/guides')

    @app.route("/")
    def home():
        return "API is running!"
    
    return app
