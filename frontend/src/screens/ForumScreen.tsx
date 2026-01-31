import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Upload } from 'lucide-react';
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

const ForumScreen: React.FC = () => {
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
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
      
      console.log('Forum - Loading posts from:', `${API_BASE}/forum/posts`);
      
      const response = await fetch(`${API_BASE}/forum/posts`, {
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
        setPosts(data.posts || []);
        console.log('Forum - Posts loaded successfully:', data.posts?.length || 0);
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
        const postsWithInteractions = posts.filter(post => (post.likeCount + post.commentCount) >= 3);
        return postsWithInteractions.sort((a, b) => (b.likeCount + b.commentCount) - (a.likeCount + a.commentCount));
      case 'myPosts':
        return posts.filter(post => post.userId === userId);
      default:
        return posts;
    }
  }, [posts, activeFilter, userId]);

  const handleLikePost = async (postId: number) => {
    try {
      const token = localStorage.getItem('nutrileaf_token');
      const response = await fetch(`${API_BASE}/forum/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setPosts(posts.map((p) =>
          p.id === postId ? { ...p, likeCount: data.likeCount } : p
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
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
      
      const formData = new FormData();
      formData.append('title', newPostTitle);
      formData.append('content', newPostContent);
      
      // Add files if selected
      if (selectedFiles) {
        for (let i = 0; i < selectedFiles.length; i++) {
          formData.append('files', selectedFiles[i]);
        }
      }
      
      const response = await fetch(`${API_BASE}/forum/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setPosts([data.post, ...posts]);
        setNewPostTitle('');
        setNewPostContent('');
        setSelectedFiles(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setError(null);
      } else {
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
                      {post.userProfileImage ? (
                        <img 
                          src={post.userProfileImage.startsWith('http') ? post.userProfileImage : `${API_BASE.replace('/api', '')}${post.userProfileImage}`}
                          alt={post.userName}
                          className="user-avatar"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.currentTarget;
                            const nextElement = target.nextElementSibling as HTMLElement;
                            target.style.display = 'none';
                            if (nextElement) {
                              nextElement.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div 
                        className="user-avatar-placeholder"
                        style={{ 
                          display: post.userProfileImage ? 'none' : 'flex',
                          background: `linear-gradient(135deg, #6bc98e, #2d7a50)`,
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '14px'
                        }}
                      >
                        {post.userName ? post.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                      </div>
                      <div>
                        <h3 className="post-title">{post.title}</h3>
                        <p className="post-author">
                          by <strong>{post.userName}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="post-content">{post.content}</p>

                {/* Display attachments */}
                {post.attachments && post.attachments.length > 0 && (
                  <div className="post-attachments">
                    {post.attachments.map((attachment, index) => (
                      <div key={index} className="attachment">
                        {attachment.type === 'image' ? (
                          <img 
                            src={attachment.url.startsWith('http') ? attachment.url : `${API_BASE.replace('/api', '')}${attachment.url}`}
                            alt={attachment.name}
                            className="attachment-image"
                            onClick={() => window.open(attachment.url.startsWith('http') ? attachment.url : `${API_BASE.replace('/api', '')}${attachment.url}`, '_blank')}
                          />
                        ) : attachment.type === 'video' ? (
                          <video 
                            controls 
                            className="attachment-video"
                            onClick={() => window.open(attachment.url.startsWith('http') ? attachment.url : `${API_BASE.replace('/api', '')}${attachment.url}`, '_blank')}
                          >
                            <source src={attachment.url.startsWith('http') ? attachment.url : `${API_BASE.replace('/api', '')}${attachment.url}`} />
                            Your browser does not support the video tag.
                          </video>
                        ) : null}
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
                    onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                  >
                    <MessageCircle size={16} /> {post.commentCount}
                  </button>
                </div>
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
