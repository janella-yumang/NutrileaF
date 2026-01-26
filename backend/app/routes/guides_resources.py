from flask import Blueprint, jsonify

guides_bp = Blueprint('guides', __name__)

@guides_bp.route('/get', methods=['GET'])
def get_guides():
    # Placeholder: fetch guides/resources
    return jsonify({
        'guides': [
            'Planting Cauliflower Step-by-Step',
            'Fertilization Schedule',
            'Disease Prevention Guide'
        ]
    })
