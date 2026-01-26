from flask import Blueprint, request, jsonify

chatbot_bp = Blueprint('chatbot', __name__)

@chatbot_bp.route('/ask', methods=['POST'])
def ask_chatbot():
    question = request.json.get('question', '')
    # Placeholder: AI chatbot logic
    return jsonify({
        'question': question,
        'answer': 'This is a placeholder answer from the AI chatbot.'
    })
