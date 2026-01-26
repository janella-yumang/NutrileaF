from flask import Blueprint, jsonify

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/summary', methods=['GET'])
def analytics_summary():
    # Placeholder: analytics data
    return jsonify({
        'average_growth_stage': 'vegetative',
        'disease_rate': '15%',
        'top_region': 'Luzon'
    })
