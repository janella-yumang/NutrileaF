import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'supersecretkey')
    
    # Upload folder configuration
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'app/static/uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    
    # Allowed file extensions
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
    
    # Database configuration
    DATABASE_URI = os.environ.get('DATABASE_URI', 'sqlite:///data/database.db')
    
    # Model path (for future ML models)
    MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'moringa_model.h5')
    
    # Image processing settings
    IMAGE_SIZE = (224, 224)  # Default size for image processing
    
    # CORS settings (if you need specific origins)
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')