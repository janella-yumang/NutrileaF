"""
Forum routes for PostgreSQL integration.
Handles forum threads and replies.
"""

from flask import Blueprint, request, jsonify
from app.models import ForumThread, ForumReply

forum_bp = Blueprint('forum', __name__, url_prefix='/api/forum')

# ==================== FORUM THREADS ====================

@forum_bp.route('/threads', methods=['GET'])
def list_forum_threads():
    """Get all forum threads with optional category and pagination."""
    category = request.args.get('category')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    try:
        query = ForumThread.query.filter_by(status='active')
        
        if category:
            query = query.filter_by(category=category)
        
        # Order by pinned first, then by newest
        threads = query.order_by(
            ForumThread.status.desc(),
            ForumThread.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'success': True,
            'threads': [thread.to_dict() for thread in threads.items],
            'total': threads.total,
            'pages': threads.pages,
            'current_page': page
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@forum_bp.route('/threads/<int:thread_id>', methods=['GET'])
def get_forum_thread(thread_id):
    """Get a specific forum thread with all replies."""
    try:
        thread = ForumThread.query.get(thread_id)
        if not thread:
            return jsonify({'success': False, 'error': 'Thread not found'}), 404
        
        # Increment views count
        thread.views_count += 1
        db.session.commit()
        
        # Get all replies for this thread
        replies = ForumReply.query.filter_by(thread_id=thread_id).order_by(
            ForumReply.created_at.asc()
        ).all()
        
        return jsonify({
            'success': True,
            'thread': thread.to_dict(),
            'replies': [reply.to_dict() for reply in replies],
            'replies_count': len(replies)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@forum_bp.route('/threads', methods=['POST'])
def create_forum_thread():
    """Create a new forum thread."""
    data = request.get_json()
    
    try:
        title = data.get('title', '').strip()
        content = data.get('content', '').strip()
        user_name = data.get('userName', '').strip()
        category = data.get('category', 'general').strip()
        
        if not all([title, content, user_name]):
            return jsonify({
                'success': False,
                'error': 'Missing required fields: title, content, userName'
            }), 400
        
        if len(title) < 5:
            return jsonify({
                'success': False,
                'error': 'Title must be at least 5 characters'
            }), 400
        
        if len(content) < 10:
            return jsonify({
                'success': False,
                'error': 'Content must be at least 10 characters'
            }), 400
        
        thread = ForumThread(
            title=title,
            content=content,
            user_name=user_name,
            category=category
        )
        
        db.session.add(thread)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Thread created successfully',
            'threadId': thread.id,
            'thread': thread.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@forum_bp.route('/threads/<int:thread_id>', methods=['PUT'])
def update_forum_thread(thread_id):
    """Update a forum thread."""
    data = request.get_json()
    
    try:
        thread = ForumThread.query.get(thread_id)
        if not thread:
            return jsonify({'success': False, 'error': 'Thread not found'}), 404
        
        if 'title' in data:
            thread.title = data['title'].strip()
        if 'content' in data:
            thread.content = data['content'].strip()
        if 'status' in data:
            thread.status = data['status']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Thread updated successfully',
            'thread': thread.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@forum_bp.route('/threads/<int:thread_id>', methods=['DELETE'])
def delete_forum_thread(thread_id):
    """Delete a forum thread and all its replies."""
    try:
        thread = ForumThread.query.get(thread_id)
        if not thread:
            return jsonify({'success': False, 'error': 'Thread not found'}), 404
        
        # Delete all replies for this thread
        ForumReply.query.filter_by(thread_id=thread_id).delete()
        # Delete the thread
        db.session.delete(thread)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Thread deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== FORUM REPLIES ====================

@forum_bp.route('/replies/<int:thread_id>', methods=['POST'])
def create_forum_reply(thread_id):
    """Add a reply to a forum thread."""
    data = request.get_json()
    
    try:
        thread = ForumThread.query.get(thread_id)
        if not thread:
            return jsonify({'success': False, 'error': 'Thread not found'}), 404
        
        content = data.get('content', '').strip()
        user_name = data.get('userName', '').strip()
        
        if not all([content, user_name]):
            return jsonify({
                'success': False,
                'error': 'Missing required fields: content, userName'
            }), 400
        
        if len(content) < 5:
            return jsonify({
                'success': False,
                'error': 'Reply must be at least 5 characters'
            }), 400
        
        reply = ForumReply(
            thread_id=thread_id,
            content=content,
            user_name=user_name
        )
        
        db.session.add(reply)
        
        # Increment thread's reply count
        thread.replies_count += 1
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Reply created successfully',
            'replyId': reply.id,
            'reply': reply.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@forum_bp.route('/replies/<int:reply_id>', methods=['PUT'])
def update_forum_reply(reply_id):
    """Update a forum reply."""
    data = request.get_json()
    
    try:
        reply = ForumReply.query.get(reply_id)
        if not reply:
            return jsonify({'success': False, 'error': 'Reply not found'}), 404
        
        if 'content' in data:
            reply.content = data['content'].strip()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Reply updated successfully',
            'reply': reply.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@forum_bp.route('/replies/<int:reply_id>', methods=['DELETE'])
def delete_forum_reply(reply_id):
    """Delete a forum reply."""
    try:
        reply = ForumReply.query.get(reply_id)
        if not reply:
            return jsonify({'success': False, 'error': 'Reply not found'}), 404
        
        thread = ForumThread.query.get(reply.thread_id)
        if thread and thread.replies_count > 0:
            thread.replies_count -= 1
        
        db.session.delete(reply)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Reply deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== CATEGORIES ====================

@forum_bp.route('/categories', methods=['GET'])
def get_forum_categories():
    """Get available forum categories."""
    categories = [
        'general',
        'health-tips',
        'recipes',
        'wellness',
        'plant-care',
        'nutrition'
    ]
    return jsonify({
        'success': True,
        'categories': categories
    }), 200
