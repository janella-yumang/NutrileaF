import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'supersecretkey')
    
    # Upload folder configuration
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'app/static/uploads')
    MAX_CONTENT_LENGTH = 25 * 1024 * 1024  # 25MB
    
    # Allowed file extensions
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'avi', 'webm'}
    
    # Database configuration - PostgreSQL for production, SQLite for development
    DATABASE_URI = os.environ.get('DATABASE_URL') or os.environ.get('DATABASE_URI') or 'sqlite:///database.db'
    
    # Fix Render's PostgreSQL URL format if needed
    if DATABASE_URI and DATABASE_URI.startswith('postgres://'):
        DATABASE_URI = DATABASE_URI.replace('postgres://', 'postgresql://', 1)
    
    # Model path (for future ML models)
    MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'moringa_model.h5')
    
    # Image processing settings
    IMAGE_SIZE = (224, 224)  # Default size for image processing
    
    # CORS settings (if you need specific origins)
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')