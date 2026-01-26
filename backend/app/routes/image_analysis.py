from flask import Blueprint, request, jsonify, current_app
import os
from werkzeug.utils import secure_filename
import tensorflow as tf
import numpy as np
import cv2
from flask import send_from_directory


image_analysis_bp = Blueprint('image_analysis', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Load ML model once
health_model = tf.keras.models.load_model('app/models/malunggay_health_model_tf2.13')

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

        # Run ML prediction
        img = preprocess_image(filepath)
        pred_prob = health_model.predict(img)[0][0]
        label = 'good' if pred_prob > 0.5 else 'bad'

        analysis_result = {
            'health_status': label,
            'confidence': float(pred_prob)
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

    # Run ML prediction on existing file
    img = preprocess_image(filepath)
    pred_prob = health_model.predict(img)[0][0]
    label = 'good' if pred_prob > 0.5 else 'bad'

    analysis_result = {
        'health_status': label,
        'confidence': float(pred_prob)
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