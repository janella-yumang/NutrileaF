from flask import Blueprint, request, jsonify, current_app
import os
from werkzeug.utils import secure_filename
import numpy as np
import cv2
from flask import send_from_directory

# Optional TensorFlow import
try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    tf = None

image_analysis_bp = Blueprint('image_analysis', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
health_model = None

def load_model():
    global health_model
    if health_model is None and TF_AVAILABLE:
        try:
            health_model = tf.keras.models.load_model('app/models/malunggay_health_model_tf2.13')
        except Exception as e:
            print(f"Warning: Could not load health model: {e}")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image(filepath):
    img = cv2.imread(filepath)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (224,224))
    img = img / 255.0
    return np.expand_dims(img, axis=0)

@image_analysis_bp.route('/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
        file.save(filepath)

        # Run ML prediction if available
        if TF_AVAILABLE and health_model is not None:
            img = preprocess_image(filepath)
            pred_prob = health_model.predict(img)[0][0]
            label = 'good' if pred_prob > 0.5 else 'bad'

            analysis_result = {
                'health_status': label,
                'confidence': float(pred_prob)
            }
        else:
            analysis_result = {
                'health_status': 'unknown',
                'confidence': 0.0,
                'note': 'TensorFlow not available - analysis skipped'
            }

        return jsonify({
            'success': True,
            'message': 'File uploaded and analyzed successfully',
            'filename': filename,
            'analysis': analysis_result
        }), 200
    else:
        return jsonify({'error': 'File type not allowed'}), 400

@image_analysis_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'running',
        'service': 'image_analysis',
        'version': '1.0.0'
    }), 200

@image_analysis_bp.route('/analyze/<filename>', methods=['GET'])
def analyze_existing(filename):
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(filepath):
        return jsonify({'success': False, 'error': 'File not found'}), 404

    # Run ML prediction on existing file if available
    if TF_AVAILABLE and health_model is not None:
        img = preprocess_image(filepath)
        pred_prob = health_model.predict(img)[0][0]
        label = 'good' if pred_prob > 0.5 else 'bad'

        analysis_result = {
            'health_status': label,
            'confidence': float(pred_prob)
        }
    else:
        analysis_result = {
            'health_status': 'unknown',
            'confidence': 0.0,
            'note': 'TensorFlow not available - analysis skipped'
        }

    return jsonify({
        'success': True,
        'filename': filename,
        'analysis': analysis_result
    }), 200

@image_analysis_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded images to the frontend."""
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)