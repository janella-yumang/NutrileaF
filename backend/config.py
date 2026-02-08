import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'supersecretkey')
    
    # Upload folder configuration
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'app/static/uploads')
    MAX_CONTENT_LENGTH = 25 * 1024 * 1024  # 25MB
    
    # Allowed file extensions
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'avi', 'webm'}
    
    # Database configuration - PostgreSQL only
    DATABASE_URI = os.environ.get('DATABASE_URL') or os.environ.get('DATABASE_URI')
    
    # For Render deployment, DATABASE_URL will be provided
    # For local development, you need to set up PostgreSQL or use a cloud service
    if not DATABASE_URI:
        print("ERROR: DATABASE_URL environment variable is required!")
        print("For local development:")
        print("1. Install PostgreSQL locally")
        print("2. Create database: createdb nutrilea_db")
        print("3. Set environment variable: set DATABASE_URL=postgresql://username:password@localhost:5432/nutrilea_db")
        print("4. Or use a cloud PostgreSQL service like ElephantSQL or Supabase")
        DATABASE_URI = 'postgresql://localhost:5432/temp'  # Temporary placeholder
    
    # Fix Render's PostgreSQL URL format if needed
    if DATABASE_URI.startswith('postgres://'):
        DATABASE_URI = DATABASE_URI.replace('postgres://', 'postgresql://', 1)
    
    # Model path (for future ML models)
    MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'moringa_model.h5')
    
    # Image processing settings
    IMAGE_SIZE = (224, 224)  # Default size for image processing
    
    # CORS settings (if you need specific origins)
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')