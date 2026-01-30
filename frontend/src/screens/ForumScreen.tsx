import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Trash2, Send, Image, Video, Upload, User, Bell } from 'lucide-react';
import HeaderNav from '../components/HeaderNav';
import { Footer } from '../components/Footer';

interface Post {
  id: number;
  userId: number;
  userName: string;
  userProfileImage?: string;
  title: string;
  content: string;
  attachments: Attachment[];
  createdAt: string;
  likeCount: number;
  commentCount: number;
}

interface Attachment {
  type: 'image' | 'video';
  url: string;
  name: string;
}

interface Notification {
  id: string;
  type: 'like' | 'comment';
  message: string;
  timestamp: Date;
  read: boolean;
  postId: number;
  userName: string;
}

interface Comment {
  id: number;
  userId: number;
  userName: string;
  userProfileImage?: string;
  content: string;
  createdAt: string;
  likeCount: number;
}

const ForumScreen: React.FC = () => {
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';

  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<{ [key: number]: Comment[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [loadingComments, setLoadingComments] = useState<{ [key: number]: boolean }>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
  const [activeFilter, setActiveFilter] = useState<'recent' | 'trending' | 'myPosts'>('recent');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem('nutrileaf_token');
    const user = localStorage.getItem('nutrileaf_user');

    if (!token || !user) {
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(user);
      setUserId(userData.id);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/forum/posts`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  // Load posts
  useEffect(() => {
    if (!isLoggedIn) return;
    loadPosts();
  }, [isLoggedIn, loadPosts]);

  // Filter posts based on active filter
  const getFilteredPosts = useCallback(() => {
    switch (activeFilter) {
      case 'recent':
        return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'trending':
        // Only show posts with meaningful interactions (3+ likes/comments total)
        const postsWithInteractions = posts.filter(post => (post.likeCount + post.commentCount) >= 3);
        return postsWithInteractions.sort((a, b) => (b.likeCount + b.commentCount) - (a.likeCount + a.commentCount));
      case 'myPosts':
        return posts.filter(post => post.userId === userId);
      default:
        return posts;
    }
  }, [posts, activeFilter, userId]);

  // Notification functions
  const addNotification = useCallback((type: 'like' | 'comment', message: string, postId: number, userName: string) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      read: false,
      postId,
      userName
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 10));
    
    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${type === 'like' ? '❤️' : '💬'} ${userName}`, {
        body: message,
        icon: '/favicon.ico'
      });
    }
  }, []);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem('nutrileaf_token');
      
      // Check if we have files to upload
      if (selectedFiles.length > 0) {
        // Use FormData for file uploads
        const formData = new FormData();
        formData.append('title', newPostTitle);
        formData.append('content', newPostContent);
        
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });

        // Debug: log FormData contents
        console.log('Sending FormData:');
        console.log('title:', newPostTitle);
        console.log('content:', newPostContent);
        console.log('files count:', selectedFiles.length);
        selectedFiles.forEach((file, index) => {
          console.log(`file ${index}:`, file.name, file.type, file.size);
        });

        const response = await fetch(`${API_BASE}/forum/posts`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await response.json();
        console.log('Backend response:', data); // Debug log
        
        if (data.success) {
          setPosts([data.post, ...posts]);
          setNewPostTitle('');
          setNewPostContent('');
          setSelectedFiles([]);
          setError(null);
        } else {
          console.error('Backend error:', data); // Debug log
          setError(data.message || 'Failed to create post');
        }
      } else {
        // Regular JSON request
        const response = await fetch(`${API_BASE}/forum/posts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: newPostTitle,
            content: newPostContent,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setPosts([data.post, ...posts]);
          setNewPostTitle('');
          setNewPostContent('');
          setError(null);
        } else {
          setError(data.message || 'Failed to create post');
        }
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Check total file size (25MB limit)
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 25 * 1024 * 1024) {
      setError('Total file size exceeds 25MB limit');
      return;
    }
    
    // Check file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/mov', 'video/avi', 'video/webm'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setError('Only images (JPG, PNG, GIF) and videos (MP4, MOV, AVI, WebM) are allowed');
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...files]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleLikePost = async (postId: number) => {
    try {
      const token = localStorage.getItem('nutrileaf_token');
      const response = await fetch(`${API_BASE}/forum/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('Like response data:', data);
      if (data.success) {
        setPosts(
          posts.map((p) =>
            p.id === postId ? { ...p, likeCount: data.likeCount } : p
          )
        );

        // Add notification if server sent one (only for post owner)
        if (data.notification) {
          console.log('Adding notification:', data.notification);
          addNotification(
            data.notification.type,
            data.notification.message,
            data.notification.postId,
            data.notification.userName
          );
        } else {
          console.log('No notification in response');
        }
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const token = localStorage.getItem('nutrileaf_token');
      const response = await fetch(`${API_BASE}/forum/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setPosts(posts.filter((p) => p.id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const loadComments = async (postId: number) => {
    try {
      setLoadingComments({ ...loadingComments, [postId]: true });
      const response = await fetch(`${API_BASE}/forum/posts/${postId}/comments`);
      const data = await response.json();

      if (data.success) {
        setComments({ ...comments, [postId]: data.comments });
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments({ ...loadingComments, [postId]: false });
    }
  };

  const handleExpandPost = async (postId: number) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
      if (!comments[postId]) {
        await loadComments(postId);
      }
    }
  };

  const handleAddComment = async (postId: number) => {
    const commentContent = newComment[postId]?.trim();
    if (!commentContent) {
      setError('Comment cannot be empty');
      return;
    }

    console.log(`DEBUG: Adding comment to post ${postId}: "${commentContent}"`);

    try {
      const token = localStorage.getItem('nutrileaf_token');
      console.log('DEBUG: Sending comment request...');
      
      const response = await fetch(`${API_BASE}/forum/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: commentContent }),
      });

      console.log('DEBUG: Comment response status:', response.status);
      const data = await response.json();
      console.log('Comment response data:', data);
      if (data.success) {
        setComments({ ...comments, [postId]: [data.comment, ...comments[postId]] });
        setNewComment({ ...newComment, [postId]: '' });
        
        // Update post comment count
        setPosts(posts.map(p => 
          p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p
        ));

        // Add notification if server sent one (only for post owner)
        if (data.notification) {
          console.log('🔔 NOTIFICATION RECEIVED:', data.notification);
          addNotification(
            data.notification.type,
            data.notification.message,
            data.notification.postId,
            data.notification.userName
          );
          console.log('✅ Notification added to state');
        } else {
          console.log('❌ No notification in response');
        }
      } else {
        console.log('❌ Comment failed:', data.message);
        setError(data.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
    }
  };

  const handleLikeComment = async (commentId: number, postId: number) => {
    try {
      const token = localStorage.getItem('nutrileaf_token');
      const response = await fetch(`${API_BASE}/forum/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setComments({
          ...comments,
          [postId]: comments[postId].map((c) =>
            c.id === commentId ? { ...c, likeCount: data.likeCount } : c
          ),
        });
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: number, postId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const token = localStorage.getItem('nutrileaf_token');
      const response = await fetch(`${API_BASE}/forum/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setComments({
          ...comments,
          [postId]: comments[postId].filter((c) => c.id !== commentId),
        });

        // Update comment count
        setPosts(
          posts.map((p) =>
            p.id === postId ? { ...p, commentCount: p.commentCount - 1 } : p
          )
        );
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="screen forum-page">
        <HeaderNav />
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading forum...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="screen forum-page">
      <HeaderNav />

      <div className="forum-container">
        <div className="forum-header">
          <h1 className="forum-title">Community Forum</h1>
          
          {/* Notification Bell */}
          <div className="notification-container">
            <button 
              className="notification-bell"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
            
            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>Notifications</h3>
                  <button 
                    className="clear-notifications-btn"
                    onClick={clearAllNotifications}
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <p className="no-notifications">No notifications yet</p>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id}
                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="notification-icon">
                          {notification.type === 'like' ? '❤️' : '💬'}
                        </div>
                        <div className="notification-content">
                          <p className="notification-message">
                            <strong>{notification.userName}</strong> {notification.message}
                          </p>
                          <span className="notification-time">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {error && <div className="forum-error">{error}</div>}

        {/* Post Filter Tabs */}
        <div className="post-filter-tabs">
          <button 
            className={`filter-tab ${activeFilter === 'recent' ? 'active' : ''}`}
            onClick={() => setActiveFilter('recent')}
          >
            🕐 Most Recent
            <span className="count">{posts.length}</span>
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'trending' ? 'active' : ''}`}
            onClick={() => setActiveFilter('trending')}
          >
            🔥 Trending
            <span className="count">{posts.filter(p => (p.likeCount + p.commentCount) >= 3).length}</span>
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'myPosts' ? 'active' : ''}`}
            onClick={() => setActiveFilter('myPosts')}
          >
            👤 Your Posts
            <span className="count">{posts.filter(p => p.userId === userId).length}</span>
          </button>
        </div>

        {/* Create Post Form */}
        <div className="create-post-card">
          <h2>Start a Discussion</h2>
          <form onSubmit={handleCreatePost}>
            <input
              type="text"
              placeholder="Post title..."
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              className="forum-input forum-input-title"
            />
            <textarea
              placeholder="What's on your mind? Share your thoughts, questions, or tips..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="forum-textarea"
              rows={4}
            />
            
            {/* File Upload Section */}
            <div className="file-upload-section">
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="file-upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} />
                Add Images/Videos (max 25MB)
              </button>
              
              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="selected-files">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="file-preview">
                      {file.type.startsWith('image/') ? (
                        <Image size={16} />
                      ) : (
                        <Video size={16} />
                      )}
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={() => removeFile(index)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="forum-btn-primary"
              disabled={uploading}
            >
              {uploading ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>

        {/* Posts List */}
        <div className="posts-list">
          {getFilteredPosts().length === 0 ? (
            <p className="no-posts">
              {activeFilter === 'myPosts' 
                ? "You haven't created any posts yet. Start a discussion!" 
                : activeFilter === 'trending'
                ? "No trending posts yet. Posts need 3+ interactions to appear here!"
                : "No posts yet. Be the first to start a discussion!"
              }
            </p>
          ) : (
            getFilteredPosts().map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="post-title-section">
                    <div className="post-author-info">
                      {(() => {
                        // Check localStorage for profile icon first (from profile page)
                        const localProfileIcon = localStorage.getItem(`profile_icon_${post.userId}`);
                        const profileImageSrc = localProfileIcon || 
                          (post.userProfileImage ? 
                            (post.userProfileImage.startsWith('http') ? post.userProfileImage : `${API_BASE.replace('/api', '')}${post.userProfileImage}`)
                            : null);
                        
                        return profileImageSrc ? (
                          <img 
                            src={profileImageSrc}
                            alt={post.userName}
                            className="user-avatar"
                          />
                        ) : (
                          <div className="user-avatar-placeholder">
                            <User size={20} />
                          </div>
                        );
                      })()}
                      <div>
                        <h3 className="post-title">{post.title}</h3>
                        <p className="post-author">
                          by <strong>{post.userName}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                  {userId === post.userId && (
                    <button
                      className="post-delete-btn"
                      onClick={() => handleDeletePost(post.id)}
                      title="Delete post"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <p className="post-content">{post.content}</p>

                {/* Attachments */}
                {post.attachments && post.attachments.length > 0 && (
                  <div className="post-attachments">
                    {post.attachments.map((attachment, index) => (
                      <div key={index} className="attachment">
                        {attachment.type === 'image' ? (
                          <img 
                            src={attachment.url.startsWith('http') ? attachment.url : `${API_BASE.replace('/api', '')}${attachment.url}`}
                            alt={attachment.name}
                            className="attachment-image"
                          />
                        ) : (
                          <video 
                            src={attachment.url.startsWith('http') ? attachment.url : `${API_BASE.replace('/api', '')}${attachment.url}`}
                            controls
                            className="attachment-video"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="post-meta">
                  <span className="post-date">
                    {new Date(post.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <div className="post-actions">
                  <button
                    className="action-btn"
                    onClick={() => handleLikePost(post.id)}
                  >
                    <Heart size={16} /> {post.likeCount}
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => handleExpandPost(post.id)}
                  >
                    <MessageCircle size={16} /> {post.commentCount}
                  </button>
                </div>

                {/* Comments Section */}
                {expandedPostId === post.id && (
                  <div className="comments-section">
                    {loadingComments[post.id] ? (
                      <p>Loading comments...</p>
                    ) : (
                      <>
                        <div className="comments-list">
                          {(comments[post.id] || []).map((comment) => (
                            <div key={comment.id} className="comment">
                              <div className="comment-header">
                                <div className="comment-author-info">
                                  {(() => {
                                    // Check localStorage for profile icon first (from profile page)
                                    const localProfileIcon = localStorage.getItem(`profile_icon_${comment.userId}`);
                                    const profileImageSrc = localProfileIcon || 
                                      (comment.userProfileImage ? 
                                        (comment.userProfileImage.startsWith('http') ? comment.userProfileImage : `${API_BASE.replace('/api', '')}${comment.userProfileImage}`)
                                        : null);
                                    
                                    return profileImageSrc ? (
                                      <img 
                                        src={profileImageSrc}
                                        alt={comment.userName}
                                        className="comment-avatar"
                                      />
                                    ) : (
                                      <div className="comment-avatar-placeholder">
                                        <User size={16} />
                                      </div>
                                    );
                                  })()}
                                  <span className="comment-author">{comment.userName}</span>
                                </div>
                                {userId === comment.userId && (
                                  <button
                                    className="comment-delete-btn"
                                    onClick={() =>
                                      handleDeleteComment(comment.id, post.id)
                                    }
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                              <p className="comment-content">{comment.content}</p>
                              <div className="comment-actions">
                                <button
                                  className="comment-like-btn"
                                  onClick={() =>
                                    handleLikeComment(comment.id, post.id)
                                  }
                                >
                                  <Heart size={14} /> {comment.likeCount}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add Comment Form */}
                        <div className="add-comment">
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            value={newComment[post.id] || ''}
                            onChange={(e) =>
                              setNewComment({
                                ...newComment,
                                [post.id]: e.target.value,
                              })
                            }
                            className="comment-input"
                          />
                          <button
                            className="comment-submit-btn"
                            onClick={() => handleAddComment(post.id)}
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ForumScreen;
