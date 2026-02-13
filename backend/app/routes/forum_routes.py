"""
Forum routes for MongoDB integration.
Handles forum threads and replies.
"""

import jwt
import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from app.models import ForumThread, ForumReply, User
from app.utils.helpers import upload_to_cloudinary

forum_bp = Blueprint('forum', __name__, url_prefix='/api/forum')

MAX_ATTACHMENTS_TOTAL = 25 * 1024 * 1024  # 25MB

def allowed_file(filename):
    if not filename or '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    allowed = current_app.config.get('ALLOWED_EXTENSIONS', set())
    return ext in allowed

def get_user_from_token():
    """Extract user from JWT token in Authorization header."""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    try:
        token = auth_header.split(' ')[1]
        secret_key = current_app.config.get('SECRET_KEY', 'supersecretkey')
        payload = jwt.decode(token, secret_key, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        if user_id:
            user = User.objects(id=user_id).first()
            return user
    except:
        pass
    
    return None

# ==================== FORUM THREADS ====================

@forum_bp.route('/threads', methods=['GET'])
def list_forum_threads():
    """Get all forum threads with pagination."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    try:
        query = ForumThread.objects.filter(status='active')
        
        # Order by newest
        threads = query.order_by('-created_at')
        
        # Manual pagination for MongoEngine
        start = (page - 1) * per_page
        end = start + per_page
        paginated_threads = list(threads[start:end])
        total = threads.count()
        
        # Use to_dict() for proper serialization
        threads_list = []
        for thread in paginated_threads:
            thread_dict = thread.to_dict()
            # Add additional fields for frontend
            thread_dict['author'] = thread_dict.get('userName', 'Anonymous')
            thread_dict['viewCount'] = thread_dict.get('viewsCount', 0)
            thread_dict['commentCount'] = thread_dict.get('repliesCount', 0)
            threads_list.append(thread_dict)
        
        return jsonify({
            'success': True,
            'threads': threads_list,
            'total': total,
            'pages': (total + per_page - 1) // per_page,
            'current_page': page
        }), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
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
                'author': thread.user_name,
                'status': thread.status,
                'views_count': thread.views_count,
                'likeCount': thread.likes_count,
                'commentCount': thread.replies_count,
                'attachments': thread.attachments or [],
                'created_at': thread.created_at.isoformat() if thread.created_at else None,
                'updated_at': thread.updated_at.isoformat() if thread.updated_at else None
            },
            'replies': [{
                'id': str(reply.id),
                'thread_id': str(reply.thread_id),
                'author': reply.user_name,
                'content': reply.content,
                'created_at': reply.created_at.isoformat() if reply.created_at else None
            } for reply in replies],
            'replies_count': len(replies)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@forum_bp.route('/threads', methods=['POST'])
def create_forum_thread():
    """Create a new forum thread. Accepts both JSON and FormData."""
    try:
        # Handle both JSON and FormData
        if request.is_json:
            data = request.get_json() or {}
            title = data.get('title', '').strip()
            content = data.get('content', '').strip()
            user_name = data.get('userName', '').strip()
        else:
            # Handle FormData (multipart/form-data)
            title = request.form.get('title', '').strip()
            content = request.form.get('content', '').strip()
            user_name = request.form.get('userName', '').strip()
        
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
        
        attachments = []

        if not request.is_json:
            files = request.files.getlist('attachments')
            total_size = 0
            for file in files:
                if not file or not file.filename:
                    continue
                if not allowed_file(file.filename):
                    return jsonify({
                        'success': False,
                        'message': 'Unsupported file type for attachments'
                    }), 400

                try:
                    file.seek(0, os.SEEK_END)
                    size = file.tell()
                    file.seek(0)
                except Exception:
                    size = 0

                total_size += size
                if total_size > MAX_ATTACHMENTS_TOTAL:
                    return jsonify({
                        'success': False,
                        'message': 'Attachments exceed 25MB total limit'
                    }), 400

                file.seek(0)

                safe_name = secure_filename(file.filename)
                ext = safe_name.rsplit('.', 1)[1].lower()
                upload_result = upload_to_cloudinary(file, 'nutrilea/forum', resource_type='auto')
                secure_url = upload_result.get('secure_url')
                if not secure_url:
                    return jsonify({
                        'success': False,
                        'message': 'Attachment upload failed'
                    }), 500

                file_type = 'video' if ext in {'mp4', 'mov', 'avi', 'webm'} else 'image'
                attachments.append({
                    'type': file_type,
                    'url': secure_url,
                    'name': safe_name,
                    'size': size
                })

        thread = ForumThread(
            title=title,
            content=content,
            user_name=user_name,
            attachments=attachments
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
                'author': thread.user_name,
                'status': thread.status,
                'views_count': thread.views_count,
                'likeCount': thread.likes_count,
                'commentCount': thread.replies_count,
                'attachments': thread.attachments or [],
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
                'author': thread.user_name,
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

@forum_bp.route('/threads/<string:thread_id>/like', methods=['POST'])
def like_forum_thread(thread_id):
    """Like a forum thread."""
    try:
        thread = ForumThread.objects(id=thread_id).first()
        if not thread:
            return jsonify({'success': False, 'error': 'Thread not found'}), 404
        
        # Increment like count
        thread.likes_count += 1
        thread.save()
        
        return jsonify({
            'success': True,
            'message': 'Thread liked successfully',
            'likeCount': thread.likes_count
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== FORUM REPLIES ====================

@forum_bp.route('/replies/<string:thread_id>', methods=['POST'])
def create_forum_reply(thread_id):
    """Add a reply to a forum thread."""
    data = request.get_json() or {}
    
    try:
        thread = ForumThread.objects(id=thread_id).first()
        if not thread:
            return jsonify({'success': False, 'error': 'Thread not found'}), 404
        
        # Try to get user from JWT token, fallback to userName in request
        user = get_user_from_token()
        if user:
            user_name = user.name or user.email
        else:
            user_name = data.get('userName', '').strip()
            if not user_name:
                return jsonify({
                    'success': False,
                    'error': 'Authentication required to post comment'
                }), 401
        
        content = data.get('content', '').strip()
        
        if not content:
            return jsonify({
                'success': False,
                'error': 'Missing required field: content'
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
            'comment': {
                'id': str(reply.id),
                'thread_id': str(reply.thread_id),
                'author': reply.user_name,
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
                'author': reply.user_name,
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

