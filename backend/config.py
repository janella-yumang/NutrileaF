import os

try:
    from dotenv import load_dotenv
    load_dotenv()  # Load .env file
except ImportError:
    pass  # dotenv not available, use environment variables as-is

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'supersecretkey')
    
    # Upload folder configuration
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'app/static/uploads')
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB
    
    # Allowed file extensions
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'avi', 'webm'}
    
    # Database configuration - MongoDB
    MONGODB_URI = os.environ.get('DATABASE_URL') or os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/nutrilea_db')
    
    # Debug database connection
    print(f"DEBUG: DATABASE_URL = {os.environ.get('DATABASE_URL', 'NOT SET')}")
    print(f"DEBUG: MONGODB_URI = {os.environ.get('MONGODB_URI', 'NOT SET')}")
    print(f"DEBUG: Using MongoDB URI: {MONGODB_URI[:50]}...")
    
    # Model path (for future ML models)
    MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'moringa_model.h5')
    
    # Image processing settings
    IMAGE_SIZE = (224, 224)  # Default size for image processing
    
    # CORS settings (if you need specific origins)
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')