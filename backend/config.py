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
    MAX_CONTENT_LENGTH = 25 * 1024 * 1024  # 25MB
    
    # Allowed file extensions
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'avi', 'webm'}
    
    # Database configuration - MongoDB
    MONGODB_URI = os.environ.get('DATABASE_URL') or os.environ.get('MONGODB_URI')
    
    # For local development, you can use MongoDB Atlas or local MongoDB
    if not MONGODB_URI:
        print("ERROR: DATABASE_URL environment variable is required!")
        print("For local development:")
        print("1. Set up MongoDB Atlas account")
        print("2. Create a free cluster")
        print("3. Get your connection string")
        print("4. Set environment variable: set DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname")
        MONGODB_URI = 'mongodb://localhost:27017/nutrilea_db'  # Temporary placeholder
    
    # Model path (for future ML models)
    MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'moringa_model.h5')
    
    # Image processing settings
    IMAGE_SIZE = (224, 224)  # Default size for image processing
    
    # CORS settings (if you need specific origins)
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')