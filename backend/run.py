from app import create_app
import os
from flask_cors import CORS

app = create_app()
CORS(app)
# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Print all registered routes (for debugging)
print("\n=== Registered Routes ===")
for rule in app.url_map.iter_rules():
    print(f"{rule.endpoint}: {rule.rule} [{', '.join(rule.methods - {'HEAD', 'OPTIONS'})}]")
print("========================\n")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)