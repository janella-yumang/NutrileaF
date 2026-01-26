from flask import Blueprint, jsonify

disease_bp = Blueprint('disease', __name__)

@disease_bp.route('/detect', methods=['POST'])
def detect_disease():
    # Placeholder: integrate disease detection model here
    return jsonify({
        'disease_detected': 'Black Rot',
        'confidence': 0.9
    })
