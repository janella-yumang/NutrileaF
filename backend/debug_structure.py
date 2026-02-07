#!/usr/bin/env python3
"""
Debug script to verify file structure and imports on Render
Add this to your build command temporarily to debug
"""

import os
import sys

print("=== Python Path ===")
for path in sys.path:
    print(f"Path: {path}")

print("\n=== Working Directory ===")
print(f"Current dir: {os.getcwd()}")

print("\n=== File Structure ===")
def show_files(path, indent=""):
    try:
        items = os.listdir(path)
        for item in sorted(items):
                full_path = os.path.join(path, item)
                if os.path.isdir(full_path):
                        print(f"{indent}📁 {item}/")
                        if indent.count("  ") < 3:  # Limit depth
                                show_files(full_path, indent + "  ")
                else:
                        print(f"{indent}📄 {item}")
    except Exception as e:
        print(f"{indent}❌ Error accessing {path}: {e}")

# Show backend structure
backend_path = "backend"
if os.path.exists(backend_path):
        print(f"\n📂 Backend structure:")
        show_files(backend_path)
else:
        print(f"\n❌ Backend directory not found!")

# Check specific files
print("\n=== Critical Files Check ===")
critical_files = [
        "backend/app/__init__.py",
        "backend/app/routes/__init__.py", 
        "backend/app/routes/products.py"
]

for file_path in critical_files:
        if os.path.exists(file_path):
                print(f"✅ {file_path}")
        else:
                print(f"❌ {file_path}")

# Test import
print("\n=== Import Test ===")
try:
        sys.path.insert(0, 'backend')
        from app.routes.products import products_bp
        print("✅ Import successful: products_bp")
except Exception as e:
        print(f"❌ Import failed: {e}")

print("\n=== Environment Variables ===")
print(f"DATABASE_URL: {'✅ Set' if os.environ.get('DATABASE_URL') else '❌ Missing'}")
print(f"FLASK_ENV: {os.environ.get('FLASK_ENV', 'Not set')}")
