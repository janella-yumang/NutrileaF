"""
Forum routes for MongoDB integration.
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
        query = ForumThread.objects.filter(status='active')
        
        if category:
            query = query.filter(category=category)
        
        # Order by newest
        threads = query.order_by('-created_at')
        
        # Manual pagination for MongoEngine
        start = (page - 1) * per_page
        end = start + per_page
        paginated_threads = threads[start:end]
        total = threads.count()
        
        return jsonify({
            'success': True,
            'threads': [{
                'id': str(thread.id),
                'title': thread.title,
                'content': thread.content,
                'author': thread.author,
                'category': thread.category,
                'status': thread.status,
                'views_count': thread.views_count,
                'created_at': thread.created_at.isoformat() if thread.created_at else None,
                'updated_at': thread.updated_at.isoformat() if thread.updated_at else None
            } for thread in paginated_threads],
            'total': total,
            'pages': (total + per_page - 1) // per_page,
            'current_page': page
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@forum_bp.route('/threads/<string:thread_id>', methods=['GET'])
def get_forum_thread(thread_id):
    """Get a specific forum thread with all replies."""
    try:
        thread = ForumThread.objects(id=thread_id).first()
        if not thread:
            return jsonify({'success': False, 'error': 'Thread not found'}), 404
        
        # Increment views count
        thread.views_count += 1
        thread.save()
        
        # Get all replies for this thread
        replies = ForumReply.objects(thread_id=thread).order_by('created_at')
        
        return jsonify({
            'success': True,
            'thread': {
                'id': str(thread.id),
                'title': thread.title,
                'content': thread.content,
                'author': thread.author,
                'category': thread.category,
                'status': thread.status,
                'views_count': thread.views_count,
                'created_at': thread.created_at.isoformat() if thread.created_at else None,
                'updated_at': thread.updated_at.isoformat() if thread.updated_at else None
            },
            'replies': [{
                'id': str(reply.id),
                'thread_id': str(reply.thread_id),
                'author': reply.author,
                'content': reply.content,
                'created_at': reply.created_at.isoformat() if reply.created_at else None
            } for reply in replies],
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
        
        thread.save()
        
        return jsonify({
            'success': True,
            'message': 'Thread created successfully',
            'threadId': str(thread.id),
            'thread': {
                'id': str(thread.id),
                'title': thread.title,
                'content': thread.content,
                'author': thread.author,
                'category': thread.category,
                'status': thread.status,
                'views_count': thread.views_count,
                'created_at': thread.created_at.isoformat() if thread.created_at else None,
                'updated_at': thread.updated_at.isoformat() if thread.updated_at else None
            }
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@forum_bp.route('/threads/<string:thread_id>', methods=['PUT'])
def update_forum_thread(thread_id):
    """Update a forum thread."""
    data = request.get_json()
    
    try:
        thread = ForumThread.objects(id=thread_id).first()
        if not thread:
            return jsonify({'success': False, 'error': 'Thread not found'}), 404
        
        if 'title' in data:
            thread.title = data['title'].strip()
        if 'content' in data:
            thread.content = data['content'].strip()
        if 'status' in data:
            thread.status = data['status']
        
        thread.save()
        
        return jsonify({
            'success': True,
            'message': 'Thread updated successfully',
            'thread': {
                'id': str(thread.id),
                'title': thread.title,
                'content': thread.content,
                'author': thread.author,
                'category': thread.category,
                'status': thread.status,
                'views_count': thread.views_count,
                'created_at': thread.created_at.isoformat() if thread.created_at else None,
                'updated_at': thread.updated_at.isoformat() if thread.updated_at else None
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@forum_bp.route('/threads/<string:thread_id>', methods=['DELETE'])
def delete_forum_thread(thread_id):
    """Delete a forum thread and all its replies."""
    try:
        thread = ForumThread.objects(id=thread_id).first()
        if not thread:
            return jsonify({'success': False, 'error': 'Thread not found'}), 404
        
        # Delete all replies for this thread
        ForumReply.objects(thread_id=thread).delete()
        # Delete thread
        thread.delete()
        
        return jsonify({
            'success': True,
            'message': 'Thread deleted successfully'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== FORUM REPLIES ====================

@forum_bp.route('/replies/<string:thread_id>', methods=['POST'])
def create_forum_reply(thread_id):
    """Add a reply to a forum thread."""
    data = request.get_json()
    
    try:
        thread = ForumThread.objects(id=thread_id).first()
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
            thread_id=thread,
            content=content,
            user_name=user_name
        )
        
        reply.save()
        
        # Increment thread's reply count
        thread.replies_count += 1
        thread.save()
        
        return jsonify({
            'success': True,
            'message': 'Reply created successfully',
            'replyId': str(reply.id),
            'reply': {
                'id': str(reply.id),
                'thread_id': str(reply.thread_id),
                'author': reply.author,
                'content': reply.content,
                'created_at': reply.created_at.isoformat() if reply.created_at else None
            }
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@forum_bp.route('/replies/<string:reply_id>', methods=['PUT'])
def update_forum_reply(reply_id):
    """Update a forum reply."""
    data = request.get_json()
    
    try:
        reply = ForumReply.objects(id=reply_id).first()
        if not reply:
            return jsonify({'success': False, 'error': 'Reply not found'}), 404
        
        if 'content' in data:
            reply.content = data['content'].strip()
        
        reply.save()
        
        return jsonify({
            'success': True,
            'message': 'Reply updated successfully',
            'reply': {
                'id': str(reply.id),
                'thread_id': str(reply.thread_id),
                'author': reply.author,
                'content': reply.content,
                'created_at': reply.created_at.isoformat() if reply.created_at else None
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@forum_bp.route('/replies/<string:reply_id>', methods=['DELETE'])
def delete_forum_reply(reply_id):
    """Delete a forum reply."""
    try:
        reply = ForumReply.objects(id=reply_id).first()
        if not reply:
            return jsonify({'success': False, 'error': 'Reply not found'}), 404
        
        thread = ForumThread.objects(id=reply.thread_id).first()
        if thread and thread.replies_count > 0:
            thread.replies_count -= 1
            thread.save()
        
        reply.delete()
        
        return jsonify({
            'success': True,
            'message': 'Reply deleted successfully'
        }), 200
    except Exception as e:
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
