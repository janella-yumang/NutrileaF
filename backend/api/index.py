import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app import create_app

app = create_app()

# Vercel serverless function handler
def handler(request):
    return app(request.environ, lambda status, headers: None)
