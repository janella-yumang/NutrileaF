from app import create_app
import os

app = create_app()

# Ensure upload folders exist
with app.app_context():
    upload_folder = app.config.get('UPLOAD_FOLDER')
    if upload_folder:
        os.makedirs(upload_folder, exist_ok=True)
        os.makedirs(os.path.join(upload_folder, 'forum'), exist_ok=True)
        os.makedirs(os.path.join(upload_folder, 'profiles'), exist_ok=True)

# Print all registered routes (for debugging)
print("\n=== Registered Routes ===")
for rule in app.url_map.iter_rules():
    print(f"{rule.endpoint}: {rule.rule} [{', '.join(rule.methods - {'HEAD', 'OPTIONS'})}]")
print("========================\n")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)