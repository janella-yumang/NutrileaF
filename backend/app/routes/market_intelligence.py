from flask import Blueprint, jsonify

market_bp = Blueprint('market', __name__)

@market_bp.route('/track', methods=['GET'])
def track_market():
    # Placeholder: market tracking logic
    return jsonify({
        'price': 150,
        'demand_trend': 'increasing',
        'region': 'Luzon'
    })
