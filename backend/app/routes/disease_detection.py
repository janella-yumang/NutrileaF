from flask import Blueprint, request, jsonify, current_app
import os
import numpy as np
import cv2

try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    tf = None

disease_bp = Blueprint('disease', __name__)

disease_model = None
CLASS_NAMES = ['bacterial leaf spot', 'cecospora leaf spot', 'healthy leaf', 'yellow leaf']

def load_disease_model():
    global disease_model
    if disease_model is None and TF_AVAILABLE:
        try:
            disease_model = tf.keras.models.load_model('app/models/malunggay_disease_model')
            print("Disease model loaded successfully!")
        except Exception as e:
            print("Error loading disease model:")
            import traceback
            traceback.print_exc()
            disease_model = None

load_disease_model()  # Load immediately

def preprocess_image(filepath):
    img = cv2.imread(filepath)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (224,224))
    img = img / 255.0
    return np.expand_dims(img, axis=0)

@disease_bp.route('/detect', methods=['POST'])
def detect_disease():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    filename = file.filename
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
    file.save(filepath)

    if TF_AVAILABLE and disease_model is not None:
        img = preprocess_image(filepath)
        preds = disease_model.predict(img)[0]
        class_idx = np.argmax(preds)
        class_name = CLASS_NAMES[class_idx]
        confidence = float(preds[class_idx])

        return jsonify({
            'disease_detected': class_name,
            'confidence': confidence
        }), 200
    else:
        return jsonify({
            'disease_detected': 'unknown',
            'confidence': 0.0,
            'note': 'TensorFlow not available or model failed to load'
        }), 200
