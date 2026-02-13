import cloudinary
import cloudinary.uploader
from config import Config

_cloudinary_configured = False

def _ensure_cloudinary_config():
    global _cloudinary_configured
    if _cloudinary_configured:
        return
    if not Config.CLOUDINARY_CLOUD_NAME or not Config.CLOUDINARY_API_KEY or not Config.CLOUDINARY_API_SECRET:
        raise ValueError('Cloudinary environment variables are not configured')
    cloudinary.config(
        cloud_name=Config.CLOUDINARY_CLOUD_NAME,
        api_key=Config.CLOUDINARY_API_KEY,
        api_secret=Config.CLOUDINARY_API_SECRET,
        secure=True
    )
    _cloudinary_configured = True

def upload_to_cloudinary(file_or_path, folder, resource_type='auto'):
    _ensure_cloudinary_config()
    return cloudinary.uploader.upload(
        file_or_path,
        folder=folder,
        resource_type=resource_type,
        use_filename=True,
        unique_filename=True,
        overwrite=False
    )

# Utility functions

def calculate_health_index(data):
    # Placeholder logic
    return 78

def format_market_data(data):
    # Placeholder logic
    return data
