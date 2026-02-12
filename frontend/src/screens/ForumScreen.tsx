import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Upload } from 'lucide-react';
import HeaderNav from '../components/HeaderNav';
import { Footer } from '../components/Footer';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  status: string;
  views_count: number;
  created_at: string;
  updated_at: string;
  attachments?: Attachment[];
  likeCount?: number;
  commentCount?: number;
  replies?: Comment[];
}

interface Attachment {
  type: 'image' | 'video';
  url: string;
  name: string;
}

interface Comment {
  id: string;
  thread_id: string;
  author: string;
  content: string;
  created_at: string;
  likeCount?: number;
}

const ForumScreen: React.FC = () => {
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL || 'https://nutrilea-backend.onrender.com/api';
  const BASE_URL = API_BASE.replace('/api', '');

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'recent' | 'trending' | 'myPosts'>('recent');
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
      setError(null);
      
      console.log('Forum - Loading threads from:', `${API_BASE}/forum/threads`);
      
      const response = await fetch(`${API_BASE}/forum/threads`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('nutrileaf_token')}`,
        },
        credentials: 'include',
      });

      console.log('Local forum - Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Forum - Response data:', data);

      if (data.success) {
        setPosts(data.threads || []);
        console.log('Forum - Threads loaded successfully:', data.threads?.length || 0);
        console.log('Forum - Sample thread data:', data.threads?.[0]);
      } else {
        setError(data.message || 'Failed to load posts');
      }
    } catch (error) {
      console.error('Forum - Error loading posts:', error);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  const loadComments = async (postId: string) => {
    try {
      const response = await fetch(`${API_BASE}/forum/threads/${postId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('nutrileaf_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.thread && data.thread.replies) {
          setComments(prev => ({ ...prev, [postId]: data.thread.replies || [] }));
        }
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    const commentText = newComment[postId];
    if (!commentText?.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/forum/replies/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('nutrileaf_token')}`,
        },
        body: JSON.stringify({ content: commentText, thread_id: postId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), data.comment] }));
          setNewComment(prev => ({ ...prev, [postId]: '' }));
          
          // Update post comment count
          setPosts(prev => prev.map(post => 
            post.id === postId 
              ? { ...post, commentCount: (post.commentCount || 0) + 1 }
              : post
          ));
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLikeComment = async (postId: string, commentId: string) => {
    // Like functionality not supported yet in backend
    console.log('Like comment feature coming soon');
  };

  // Load posts
  useEffect(() => {
    if (!isLoggedIn) return;
    loadPosts();
  }, [isLoggedIn, loadPosts]);

  // Filter posts based on active filter
  const getFilteredPosts = useCallback(() => {
    switch (activeFilter) {
      case 'recent':
        return posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'trending':
        return posts.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
      case 'myPosts':
        // Since we don't have userId in the new structure, just return recent posts
        return posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      default:
        return posts;
    }
  }, [posts, activeFilter]);

  const handleLikePost = async (postId: string) => {
    // Like functionality not supported yet in backend
    console.log('Like post feature coming soon');
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem('nutrileaf_token');
      const userJson = localStorage.getItem('nutrileaf_user');
      const userName = userJson ? JSON.parse(userJson).name : 'Anonymous';
      
      const response = await fetch(`${API_BASE}/forum/threads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          userName: userName,
          category: 'general'
        }),
      });

      console.log('Forum - Create post response status:', response.status);
      const data = await response.json();
      console.log('Forum - Create post response data:', data);
      
      if (data.success) {
        setPosts([data.thread, ...posts]);
        setNewPostTitle('');
        setNewPostContent('');
        setSelectedFiles(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setError(null);
      } else {
        console.error('Forum - Create post failed:', data);
        setError(data.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post');
    } finally {
      setUploading(false);
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
            <span className="count">{posts.filter(p => (p.views_count || 0) >= 3).length}</span>
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'myPosts' ? 'active' : ''}`}
            onClick={() => setActiveFilter('myPosts')}
          >
            👤 Your Posts
            <span className="count">{posts.length}</span>
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
            
            {/* File Upload */}
            <div className="file-upload-section">
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*,video/*"
                onChange={(e) => setSelectedFiles(e.target.files)}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload" className="file-upload-label">
                <Upload size={20} />
                <span>
                  {selectedFiles && selectedFiles.length > 0 
                    ? `${selectedFiles.length} file(s) selected` 
                    : 'Add images or videos'}
                </span>
              </label>
              {selectedFiles && selectedFiles.length > 0 && (
                <div className="selected-files">
                  {Array.from(selectedFiles).map((file, index) => (
                    <div key={index} className="selected-file">
                      <span>{file.name}</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          const newFiles = Array.from(selectedFiles).filter((_, i) => i !== index);
                          setSelectedFiles(newFiles.length > 0 ? newFiles as unknown as FileList : null);
                        }}
                        className="remove-file"
                      >
                        ×
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
                      <div 
                        className="user-avatar-placeholder"
                        style={{ 
                          background: `linear-gradient(135deg, #6bc98e, #2d7a50)`,
                          color: 'white',
                          fontWeight: '600',
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          display: 'flex'
                        }}
                      >
                        {post.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="post-title">{post.title}</h3>
                        <p className="post-author">
                          by <strong>{post.author}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="post-content">{post.content}</p>

                <div className="post-meta">
                  <span className="post-date">
                    {new Date(post.created_at).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short'
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
                    onClick={() => {
                      setExpandedPostId(expandedPostId === post.id ? null : post.id);
                      if (expandedPostId !== post.id) {
                        loadComments(post.id);
                      }
                    }}
                  >
                    <MessageCircle size={16} /> {post.commentCount}
                  </button>
                </div>

                {/* Comments Section */}
                {expandedPostId === post.id && (
                  <div className="comments-section">
                    <div className="comments-list">
                      {comments[post.id]?.map((comment) => (
                        <div key={comment.id} className="comment">
                          <div className="comment-header">
                            <div className="comment-author-info">
                              <div className="comment-avatar-placeholder">
                                {comment.author.charAt(0).toUpperCase()}
                              </div>
                              <div className="comment-author-name">{comment.author}</div>
                            </div>
                            <div className="comment-date">
                              {new Date(comment.created_at).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZoneName: 'short'
                              })}
                            </div>
                          </div>
                          <div className="comment-content">{comment.content}</div>
                          <div className="comment-actions">
                            <button
                              className="comment-action-btn"
                              onClick={() => handleLikeComment(post.id, comment.id)}
                            >
                              <Heart size={14} /> {comment.likeCount}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Add Comment Form */}
                    <div className="add-comment">
                      <div className="comment-input-wrapper">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={newComment[post.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                          className="comment-input"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddComment(post.id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="comment-submit-btn"
                        >
                          Post
                        </button>
                      </div>
                    </div>
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
