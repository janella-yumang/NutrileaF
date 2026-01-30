from flask import Blueprint, request, jsonify, current_app
import sqlite3
from typing import Tuple
import jwt
import datetime
import os
from werkzeug.utils import secure_filename


forum_bp = Blueprint("forum", __name__)


def _get_db_path() -> str:
    """Resolve the SQLite database path from the Flask config DATABASE_URI."""
    uri = current_app.config.get("DATABASE_URI", "sqlite:///data/database.db")

    if uri.startswith("sqlite:///"):
        relative_path = uri[len("sqlite:///") :]
    else:
        relative_path = uri

    backend_root = os.path.abspath(os.path.join(current_app.root_path, ".."))
    db_path = os.path.join(backend_root, relative_path)

    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    return db_path


def _get_upload_folder() -> str:
    """Get the upload folder path."""
    upload_folder = current_app.config.get('UPLOAD_FOLDER')
    if not upload_folder:
        backend_root = os.path.abspath(os.path.join(current_app.root_path, ".."))
        upload_folder = os.path.join(backend_root, 'app', 'static', 'uploads')
    
    # Create subdirectories for forum attachments
    forum_upload_folder = os.path.join(upload_folder, 'forum')
    os.makedirs(forum_upload_folder, exist_ok=True)
    return forum_upload_folder


def _allowed_file(filename: str) -> bool:
    """Check if file extension is allowed."""
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'avi', 'webm'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def _save_profile_image(file) -> str:
    """Save uploaded profile image and return the filename."""
    if file and _allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Add timestamp to avoid filename conflicts
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        name, ext = os.path.splitext(filename)
        filename = f"profile_{timestamp}{ext}"
        
        # Create profiles directory
        upload_folder = current_app.config.get('UPLOAD_FOLDER')
        if not upload_folder:
            backend_root = os.path.abspath(os.path.join(current_app.root_path, ".."))
            upload_folder = os.path.join(backend_root, 'app', 'static', 'uploads')
        
        profiles_folder = os.path.join(upload_folder, 'profiles')
        os.makedirs(profiles_folder, exist_ok=True)
        
        file_path = os.path.join(profiles_folder, filename)
        file.save(file_path)
        
        return f"/uploads/profiles/{filename}"
    return None


@forum_bp.route("/upload-profile-image", methods=["POST"])
def upload_profile_image_route():
    """Upload user profile image."""
    auth_header = request.headers.get('Authorization')
    is_valid, user_id = _verify_token(auth_header)
    
    if not is_valid or not user_id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No file selected'}), 400
    
    # Check file size (5MB limit for profile images)
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    
    if file_size > 5 * 1024 * 1024:  # 5MB
        return jsonify({'success': False, 'message': 'File size exceeds 5MB limit'}), 400
    
    # Check if it's an image file
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
        return jsonify({'success': False, 'message': 'Only image files are allowed'}), 400
    
    saved_path = _save_profile_image(file)
    if not saved_path:
        return jsonify({'success': False, 'message': 'Failed to save file'}), 500
    
    # Update user's profile image in database
    conn = _get_connection()
    try:
        cur = conn.cursor()
        cur.execute("UPDATE users SET profile_image = ? WHERE id = ?", (saved_path, user_id))
        conn.commit()
        
        return jsonify({
            'success': True,
            'profileImage': saved_path,
            'message': 'Profile image updated successfully'
        })
    finally:
        conn.close()


def _save_file(file) -> str:
    """Save uploaded file and return the filename."""
    if file and _allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Add timestamp to avoid filename conflicts
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        name, ext = os.path.splitext(filename)
        filename = f"{name}_{timestamp}{ext}"
        
        upload_folder = _get_upload_folder()
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        
        return f"/uploads/forum/{filename}"
    return None


def _get_connection():
    """Get a database connection with row factory and ensure schema is up to date."""
    db_path = _get_db_path()
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    
    # Ensure database schema is up to date
    cur = conn.cursor()
    
    # Check if attachments column exists in posts table
    cur.execute("PRAGMA table_info(posts)")
    columns = [column[1] for column in cur.fetchall()]
    if 'attachments' not in columns:
        cur.execute("ALTER TABLE posts ADD COLUMN attachments TEXT")
        print("Added attachments column to posts table")
    
    # Check if profile_image column exists in users table
    cur.execute("PRAGMA table_info(users)")
    user_columns = [column[1] for column in cur.fetchall()]
    if 'profile_image' not in user_columns:
        cur.execute("ALTER TABLE users ADD COLUMN profile_image TEXT")
        print("Added profile_image column to users table")
    
    conn.commit()
    return conn


def _init_db() -> None:
    """Ensure the forum tables exist."""
    conn = _get_connection()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                attachments TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
            """
        )
        
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES posts (id),
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
            """
        )
        
        # Add profile_image column to users table if it doesn't exist
        try:
            conn.execute("ALTER TABLE users ADD COLUMN profile_image TEXT")
        except sqlite3.OperationalError:
            pass  # Column already exists
        
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS likes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id INTEGER,
                comment_id INTEGER,
                user_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES posts (id),
                FOREIGN KEY (comment_id) REFERENCES comments (id),
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
            """
        )
        
        conn.commit()
    finally:
        conn.close()


@forum_bp.before_app_request
def ensure_db_initialized() -> None:
    _init_db()


def _verify_token(auth_header: str) -> Tuple[bool, int | None]:
    """Verify JWT token and return user_id if valid."""
    if not auth_header or not auth_header.startswith('Bearer '):
        return False, None
    
    token = auth_header.split(' ')[1]
    secret_key = current_app.config.get('SECRET_KEY', 'supersecretkey')
    
    try:
        payload = jwt.decode(token, secret_key, algorithms=['HS256'])
        return True, payload.get('user_id')
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return False, None


@forum_bp.route("/posts", methods=["GET"])
def get_posts():
    """Get all posts with like and comment counts."""
    try:
        conn = _get_connection()
        cur = conn.cursor()
        
        # Get all posts with user info
        cur.execute("""
            SELECT p.id, p.user_id, p.title, p.content, p.attachments, p.created_at, 
                   u.full_name, u.profile_image
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        """)
        
        posts = []
        for row in cur.fetchall():
            post_id = row['id']
            
            # Get like count
            cur.execute("SELECT COUNT(*) as count FROM likes WHERE post_id = ?", (post_id,))
            like_count = cur.fetchone()['count']
            
            # Get comment count
            cur.execute("SELECT COUNT(*) as count FROM comments WHERE post_id = ?", (post_id,))
            comment_count = cur.fetchone()['count']
            
            # Parse attachments JSON if exists
            attachments = []
            if row['attachments']:
                try:
                    import json
                    attachments = json.loads(row['attachments'])
                except Exception as e:
                    print(f"Error parsing attachments: {e}")
                    attachments = []
            
            posts.append({
                'id': post_id,
                'userId': row['user_id'],
                'userName': row['full_name'],
                'userProfileImage': row['profile_image'],
                'title': row['title'],
                'content': row['content'],
                'attachments': attachments,
                'createdAt': row['created_at'],
                'likeCount': like_count,
                'commentCount': comment_count,
            })
        
        conn.close()
        return jsonify({'success': True, 'posts': posts})
    except Exception as e:
        print(f"Error in get_posts: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500


@forum_bp.route("/posts", methods=["POST"])
def create_post():
    """Create a new post with optional file attachments."""
    auth_header = request.headers.get('Authorization')
    is_valid, user_id = _verify_token(auth_header)
    
    if not is_valid or not user_id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    # Prefer mimetype + presence of files (more reliable than content_type prefix)
    is_multipart = request.mimetype == 'multipart/form-data'
    has_files = bool(request.files)

    # Debug: log what we received
    print(f"DEBUG: mimetype={request.mimetype}")
    print(f"DEBUG: content_type={request.content_type}")
    print(f"DEBUG: form keys={list(request.form.keys())}")
    print(f"DEBUG: files keys={list(request.files.keys())}")

    if is_multipart or has_files:
        title = (request.form.get('title') or '').strip()
        content = (request.form.get('content') or '').strip()

        # Handle file uploads
        attachments = []
        files = []
        files.extend(request.files.getlist('files'))
        files.extend(request.files.getlist('files[]'))
        if 'file' in request.files:
            files.append(request.files['file'])
        
        print(f"DEBUG: extracted title='{title}', content='{content}'")
        print(f"DEBUG: found {len(files)} files")
        
        total_size = 0
        for file in files:
            if file and file.filename:
                # Check file size (25MB limit)
                file.seek(0, os.SEEK_END)
                file_size = file.tell()
                file.seek(0)  # Reset file pointer
                total_size += file_size
                
                if total_size > 25 * 1024 * 1024:  # 25MB
                    return jsonify({'success': False, 'message': 'Total file size exceeds 25MB limit'}), 400
                
                saved_path = _save_file(file)
                if saved_path:
                    file_type = 'image' if file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')) else 'video'
                    attachments.append({
                        'type': file_type,
                        'url': saved_path,
                        'name': file.filename
                    })
    else:
        # Regular JSON request
        data = request.get_json(silent=True) or {}
        title = (data.get('title') or '').strip()
        content = (data.get('content') or '').strip()
        attachments = []

    # Fallback: if client sent form fields but Flask didn't classify as multipart
    if (not title or not content) and request.form:
        title = title or (request.form.get('title') or '').strip()
        content = content or (request.form.get('content') or '').strip()

    if (not title or not content) and request.values:
        title = title or (request.values.get('title') or '').strip()
        content = content or (request.values.get('content') or '').strip()

    # Last resort: try to parse as stream if FormData parsing failed
    if (not title or not content) and request.mimetype == 'multipart/form-data':
        try:
            from werkzeug.formparser import parse_form_data
            stream, form, files = parse_form_data(request.environ)
            title = title or (form.get('title') or '').strip()
            content = content or (form.get('content') or '').strip()
            print(f"DEBUG: fallback parsing - title='{title}', content='{content}'")
        except Exception as e:
            print(f"DEBUG: fallback parsing failed: {e}")
    
    if not title or not content:
        return (
            jsonify(
                {
                    'success': False,
                    'message': 'Title and content are required',
                    'debug': {
                        'mimetype': request.mimetype,
                        'contentType': request.content_type,
                        'formKeys': list(request.form.keys()),
                        'filesKeys': list(request.files.keys()),
                        'valuesKeys': list(request.values.keys()) if request.values else [],
                        'contentLength': request.content_length,
                    },
                }
            ),
            400,
        )
    
    conn = _get_connection()
    try:
        cur = conn.cursor()
        
        # Convert attachments to JSON string
        import json
        attachments_json = json.dumps(attachments) if attachments else None
        
        cur.execute(
            """
            INSERT INTO posts (user_id, title, content, attachments)
            VALUES (?, ?, ?, ?)
            """,
            (user_id, title, content, attachments_json)
        )
        conn.commit()
        post_id = cur.lastrowid
        
        # Get user name and profile image
        cur.execute("SELECT full_name, profile_image FROM users WHERE id = ?", (user_id,))
        user_row = cur.fetchone()
        user_name = user_row['full_name'] if user_row else 'Unknown'
        user_profile_image = user_row['profile_image'] if user_row else None
        
        return jsonify({
            'success': True,
            'post': {
                'id': post_id,
                'userId': user_id,
                'userName': user_name,
                'userProfileImage': user_profile_image,
                'title': title,
                'content': content,
                'attachments': attachments,
                'createdAt': datetime.datetime.utcnow().isoformat(),
                'likeCount': 0,
                'commentCount': 0,
            }
        }), 201
    finally:
        conn.close()


@forum_bp.route("/posts/<int:post_id>", methods=["DELETE"])
def delete_post(post_id: int):
    """Delete a post (only by the creator)."""
    auth_header = request.headers.get('Authorization')
    is_valid, user_id = _verify_token(auth_header)
    
    if not is_valid or not user_id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    conn = _get_connection()
    try:
        cur = conn.cursor()
        
        # Check if post exists and user is creator
        cur.execute("SELECT user_id FROM posts WHERE id = ?", (post_id,))
        post = cur.fetchone()
        
        if not post:
            return jsonify({'success': False, 'message': 'Post not found'}), 404
        
        if post['user_id'] != user_id:
            return jsonify({'success': False, 'message': 'Cannot delete other users\' posts'}), 403
        
        # Delete associated likes and comments
        cur.execute("DELETE FROM likes WHERE post_id = ?", (post_id,))
        cur.execute("DELETE FROM comments WHERE post_id = ?", (post_id,))
        cur.execute("DELETE FROM posts WHERE id = ?", (post_id,))
        
        conn.commit()
        return jsonify({'success': True, 'message': 'Post deleted'})
    finally:
        conn.close()


@forum_bp.route("/posts/<int:post_id>/like", methods=["POST"])
def like_post(post_id: int):
    """Like or unlike a post."""
    auth_header = request.headers.get('Authorization')
    is_valid, user_id = _verify_token(auth_header)
    
    if not is_valid or not user_id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    conn = _get_connection()
    try:
        cur = conn.cursor()
        
        # Check if already liked
        cur.execute("SELECT id FROM likes WHERE post_id = ? AND user_id = ?", (post_id, user_id))
        existing_like = cur.fetchone()
        
        if existing_like:
            # Unlike
            cur.execute("DELETE FROM likes WHERE post_id = ? AND user_id = ?", (post_id, user_id))
            liked = False
        else:
            # Like
            cur.execute(
                "INSERT INTO likes (post_id, user_id) VALUES (?, ?)",
                (post_id, user_id)
            )
            liked = True
        
        conn.commit()
        
        # Get updated like count
        cur.execute("SELECT COUNT(*) as count FROM likes WHERE post_id = ?", (post_id,))
        like_count = cur.fetchone()['count']
        
        # Get post owner info for notification
        cur.execute("SELECT user_id, title FROM posts WHERE id = ?", (post_id,))
        post_info = cur.fetchone()
        
        # Send notification to post owner (if someone else liked their post)
        if post_info and post_info['user_id'] != user_id and liked:
            print(f"DEBUG: Sending like notification - Post owner: {post_info['user_id']}, Current user: {user_id}")
            # Get current user's name
            cur.execute("SELECT full_name FROM users WHERE id = ?", (user_id,))
            current_user = cur.fetchone()
            user_name = current_user['full_name'] if current_user else 'Someone'
            
            # In a real app, you'd store this notification in a database
            # For now, we'll just return it in the response so the frontend can handle it
            notification = {
                'type': 'like',
                'message': f'liked your post "{post_info["title"]}"',
                'userName': user_name,
                'postId': post_id
            }
            print(f"DEBUG: Notification data: {notification}")
            return jsonify({'success': True, 'liked': liked, 'likeCount': like_count, 'notification': notification})
        else:
            print(f"DEBUG: No notification sent - Post owner: {post_info['user_id'] if post_info else 'None'}, Current user: {user_id}, Liked: {liked}")
        
        return jsonify({'success': True, 'liked': liked, 'likeCount': like_count})
    finally:
        conn.close()


@forum_bp.route("/posts/<int:post_id>/comments", methods=["GET"])
def get_comments(post_id: int):
    """Get all comments for a post."""
    try:
        conn = _get_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT c.id, c.user_id, c.content, c.created_at, u.full_name, u.profile_image
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC
        """, (post_id,))
        
        comments = []
        for row in cur.fetchall():
            comment_id = row['id']
            
            # Get like count for comment
            cur.execute("SELECT COUNT(*) as count FROM likes WHERE comment_id = ?", (comment_id,))
            like_count = cur.fetchone()['count']
            
            comments.append({
                'id': comment_id,
                'userId': row['user_id'],
                'userName': row['full_name'],
                'userProfileImage': row['profile_image'],
                'content': row['content'],
                'createdAt': row['created_at'],
                'likeCount': like_count,
            })
        
        conn.close()
        return jsonify({'success': True, 'comments': comments})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@forum_bp.route("/posts/<int:post_id>/comments", methods=["POST"])
def create_comment(post_id: int):
    """Add a comment to a post."""
    print(f"=== COMMENT NOTIFICATION DEBUG START ===")
    print(f"DEBUG: Comment endpoint called for post {post_id}")
    
    auth_header = request.headers.get('Authorization')
    is_valid, user_id = _verify_token(auth_header)
    
    print(f"DEBUG: Auth result - valid: {is_valid}, user_id: {user_id}")
    
    if not is_valid or not user_id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    data = request.get_json(silent=True) or {}
    content = (data.get('content') or '').strip()
    
    if not content:
        return jsonify({'success': False, 'message': 'Comment content is required'}), 400
    
    conn = _get_connection()
    try:
        cur = conn.cursor()
        
        # Check if post exists
        cur.execute("SELECT id FROM posts WHERE id = ?", (post_id,))
        if not cur.fetchone():
            return jsonify({'success': False, 'message': 'Post not found'}), 404
        
        cur.execute(
            """
            INSERT INTO comments (post_id, user_id, content)
            VALUES (?, ?, ?)
            """,
            (post_id, user_id, content)
        )
        conn.commit()
        comment_id = cur.lastrowid
        
        # Get user name and profile image
        cur.execute("SELECT full_name, profile_image FROM users WHERE id = ?", (user_id,))
        user_row = cur.fetchone()
        user_name = user_row['full_name'] if user_row else 'Unknown'
        user_profile_image = user_row['profile_image'] if user_row else None
        
        # Get post owner info for notification
        cur.execute("SELECT user_id, title FROM posts WHERE id = ?", (post_id,))
        post_info = cur.fetchone()
        
        print(f"DEBUG: Post info - user_id: {post_info['user_id'] if post_info else 'None'}, title: {post_info['title'] if post_info else 'None'}")
        print(f"DEBUG: Current user_id: {user_id}")
        
        # Send notification to post owner (if someone else commented on their post)
        notification = None
        if post_info and post_info['user_id'] != user_id:
            print(f"DEBUG: Sending comment notification - Post owner: {post_info['user_id']}, Current user: {user_id}")
            notification = {
                'type': 'comment',
                'message': f'commented on your post "{post_info["title"]}"',
                'userName': user_name,
                'postId': post_id
            }
            print(f"DEBUG: Comment notification data: {notification}")
        else:
            print(f"DEBUG: No comment notification sent - Post owner: {post_info['user_id'] if post_info else 'None'}, Current user: {user_id}")
            if post_info:
                print(f"DEBUG: User IDs equal? {post_info['user_id'] == user_id}")
            else:
                print("DEBUG: post_info is None")
        
        comment_data = {
            'id': comment_id,
            'userId': user_id,
            'userName': user_name,
            'userProfileImage': user_profile_image,
            'content': content,
            'createdAt': datetime.datetime.utcnow().isoformat(),
            'likeCount': 0,
        }
        
        response_data = {'success': True, 'comment': comment_data}
        if notification:
            response_data['notification'] = notification
            print(f"DEBUG: Final response includes notification: {notification}")
        else:
            print(f"DEBUG: Final response has NO notification")
        
        print(f"=== COMMENT NOTIFICATION DEBUG END ===")
        return jsonify(response_data), 201
    finally:
        conn.close()


@forum_bp.route("/comments/<int:comment_id>", methods=["DELETE"])
def delete_comment(comment_id: int):
    """Delete a comment (only by the creator)."""
    auth_header = request.headers.get('Authorization')
    is_valid, user_id = _verify_token(auth_header)
    
    if not is_valid or not user_id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    conn = _get_connection()
    try:
        cur = conn.cursor()
        
        # Check if comment exists and user is creator
        cur.execute("SELECT user_id FROM comments WHERE id = ?", (comment_id,))
        comment = cur.fetchone()
        
        if not comment:
            return jsonify({'success': False, 'message': 'Comment not found'}), 404
        
        if comment['user_id'] != user_id:
            return jsonify({'success': False, 'message': 'Cannot delete other users\' comments'}), 403
        
        # Delete associated likes
        cur.execute("DELETE FROM likes WHERE comment_id = ?", (comment_id,))
        cur.execute("DELETE FROM comments WHERE id = ?", (comment_id,))
        
        conn.commit()
        return jsonify({'success': True, 'message': 'Comment deleted'})
    finally:
        conn.close()


@forum_bp.route("/comments/<int:comment_id>/like", methods=["POST"])
def like_comment(comment_id: int):
    """Like or unlike a comment."""
    auth_header = request.headers.get('Authorization')
    is_valid, user_id = _verify_token(auth_header)
    
    if not is_valid or not user_id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    conn = _get_connection()
    try:
        cur = conn.cursor()
        
        # Check if already liked
        cur.execute("SELECT id FROM likes WHERE comment_id = ? AND user_id = ?", (comment_id, user_id))
        existing_like = cur.fetchone()
        
        if existing_like:
            # Unlike
            cur.execute("DELETE FROM likes WHERE comment_id = ? AND user_id = ?", (comment_id, user_id))
            liked = False
        else:
            # Like
            cur.execute(
                "INSERT INTO likes (comment_id, user_id) VALUES (?, ?)",
                (comment_id, user_id)
            )
            liked = True
        
        conn.commit()
        
        # Get updated like count
        cur.execute("SELECT COUNT(*) as count FROM likes WHERE comment_id = ?", (comment_id,))
        like_count = cur.fetchone()['count']
        
        return jsonify({'success': True, 'liked': liked, 'likeCount': like_count})
    finally:
        conn.close()
