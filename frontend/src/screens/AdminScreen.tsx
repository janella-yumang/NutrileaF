import React, { useState, useEffect } from 'react';
import '../App.css';

const AdminScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalForumThreads: 0,
    totalRevenue: 0
  });
  
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [forumThreads, setForumThreads] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [forumLoading, setForumLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'product' | 'user' | 'category' | null>(null);
  const [createData, setCreateData] = useState<any>({});
  
  const apiUrl = process.env.REACT_APP_API_URL || 'https://nutrilea-backend.onrender.com/api';
  const adminHeaders = {
    'Content-Type': 'application/json',
    'X-Admin-Role': 'true'
  };

  // Fetch dashboard stats
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    }
  }, [activeTab]);

  // Fetch categories for dropdown
  const fetchCategoriesForDropdown = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/products/categories`, {
        headers: adminHeaders
      });
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch data when component mounts and when switching tabs
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'users') {
      console.log('Triggering fetchUsers for users tab');
      fetchUsers();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'forum') {
      fetchForumThreads();
    } else if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'reviews') {
      fetchReviews();
    }
  }, [activeTab]);

  // Fetch categories for dropdown on component mount
  useEffect(() => {
    fetchCategoriesForDropdown();
  }, []);

  const fetchStats = async () => {
    try {
      console.log('Fetching stats from:', `${apiUrl}/api/admin/stats`);
      const res = await fetch(`${apiUrl}/api/admin/stats`, { 
        headers: adminHeaders,
        method: 'GET'
      });
      console.log('Stats response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Stats response data:', data);
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats on error
      setStats({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalForumThreads: 0,
        totalRevenue: 0
      });
    }
  };

  // Fetch Products
  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/products`, { headers: adminHeaders });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setProductsLoading(false);
  };

  // Fetch Users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const timestamp = Date.now(); // Cache-busting
      const fullUrl = `${apiUrl}/api/admin/users?t=${timestamp}`;
      console.log('=== FETCH USERS DEBUG ===');
      console.log('API URL:', apiUrl);
      console.log('Full URL:', fullUrl);
      console.log('Headers:', adminHeaders);
      
      const res = await fetch(fullUrl, { 
        headers: adminHeaders,
        method: 'GET'
      });
      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Raw response data:', data);
      console.log('Data.success:', data.success);
      console.log('Data.users length:', data.users ? data.users.length : 'undefined');
      
      if (data.success && data.users) {
        setUsers(data.users);
        console.log('Users set successfully:', data.users);
        console.log('Number of users received:', data.users.length);
      } else {
        console.error('API returned error or no users:', data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // Set empty array on error
    }
    setUsersLoading(false);
  };

  // Fetch Orders
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/orders`, { headers: adminHeaders });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
    setOrdersLoading(false);
  };

  // Fetch Forum Threads
  const fetchForumThreads = async () => {
    setForumLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/forum/threads`, { headers: adminHeaders });
      const data = await res.json();
      if (data.success) {
        setForumThreads(data.threads);
      }
    } catch (error) {
      console.error('Error fetching forum threads:', error);
    }
    setForumLoading(false);
  };

  // Fetch Categories
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/categories`, { headers: adminHeaders });
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
    setCategoriesLoading(false);
  };

  // Fetch Reviews
  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/reviews`, { headers: adminHeaders });
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
    setReviewsLoading(false);
  };

  // Edit handler
  const handleEdit = (item: any, type: string) => {
    setEditingId(item.id);
    setEditData({ ...item });
  };

  // Update handler
  const handleUpdate = async (id: number, type: string) => {
    try {
      let endpoint = '';
      if (type === 'product') endpoint = `/api/admin/products/${id}`;
      else if (type === 'user') endpoint = `/api/admin/users/${id}`;
      else if (type === 'order') endpoint = `/api/admin/orders/${id}`;
      else if (type === 'thread') endpoint = `/api/admin/forum/threads/${id}`;
      else if (type === 'category') endpoint = `/api/admin/categories/${id}`;
      else if (type === 'review') endpoint = `/api/admin/reviews/${id}`;

      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify(editData)
      });

      const data = await res.json();
      if (data.success) {
        if (type === 'product') fetchProducts();
        else if (type === 'user') fetchUsers();
        else if (type === 'order') fetchOrders();
        else if (type === 'thread') fetchForumThreads();
        else if (type === 'category') fetchCategories();
        else if (type === 'review') fetchReviews();
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error updating:', error);
    }
  };

  // Delete handler
  const handleDelete = async (id: number, type: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      let endpoint = '';
      if (type === 'product') endpoint = `/api/admin/products/${id}`;
      else if (type === 'user') endpoint = `/api/admin/users/${id}`;
      else if (type === 'order') endpoint = `/api/admin/orders/${id}`;
      else if (type === 'thread') endpoint = `/api/admin/forum/threads/${id}`;
      else if (type === 'category') endpoint = `/api/admin/categories/${id}`;
      else if (type === 'review') endpoint = `/api/admin/reviews/${id}`;

      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'DELETE',
        headers: adminHeaders
      });

      const data = await res.json();
      if (data.success) {
        if (type === 'product') fetchProducts();
        else if (type === 'user') fetchUsers();
        else if (type === 'order') fetchOrders();
        else if (type === 'thread') fetchForumThreads();
        else if (type === 'category') fetchCategories();
        else if (type === 'review') fetchReviews();
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  // Create handlers
  const handleCreate = (type: 'product' | 'user' | 'category') => {
    setCreateType(type);
    setCreateData({});
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async () => {
    try {
      let endpoint = '';
      if (createType === 'product') endpoint = '/api/admin/products';
      else if (createType === 'user') endpoint = '/api/admin/users';
      else if (createType === 'category') endpoint = '/api/admin/categories';
      
      if (!endpoint) return;

      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify(createData)
      });

      const data = await res.json();
      if (data.success) {
        if (createType === 'product') fetchProducts();
        else if (createType === 'user') fetchUsers();
        else if (createType === 'category') fetchCategories();
        setShowCreateModal(false);
        setCreateData({});
        setCreateType(null);
      }
    } catch (error) {
      console.error('Error creating:', error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>👑 Admin Dashboard</h1>
        <p>Manage products, users, orders, and forum content</p>
      </div>

      {/* Tabs */}
      <div style={styles.tabContainer}>
        {['dashboard', 'products', 'users', 'orders', 'forum', 'categories', 'reviews'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
            }}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.activeTab : {})
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div style={styles.section}>
          <h2>Dashboard Statistics</h2>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.totalUsers}</div>
              <div style={styles.statLabel}>Total Users</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.totalProducts}</div>
              <div style={styles.statLabel}>Total Products</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.totalOrders}</div>
              <div style={styles.statLabel}>Total Orders</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.pendingOrders}</div>
              <div style={styles.statLabel}>Pending Orders</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.totalForumThreads}</div>
              <div style={styles.statLabel}>Forum Threads</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>₱{stats.totalRevenue}</div>
              <div style={styles.statLabel}>Total Revenue</div>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2>Manage Products</h2>
            <button 
              onClick={() => handleCreate('product')}
              style={styles.createBtn}
            >
              + Create Product
            </button>
          </div>
          {productsLoading ? <p>Loading...</p> : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>
                      {editingId === product.id ? (
                        <input
                          type="text"
                          value={editData.name}
                          onChange={e => setEditData({ ...editData, name: e.target.value })}
                          style={styles.input}
                        />
                      ) : (
                        product.name
                      )}
                    </td>
                    <td>
                      {editingId === product.id ? (
                        <input
                          type="text"
                          value={editData.category}
                          onChange={e => setEditData({ ...editData, category: e.target.value })}
                          style={styles.input}
                        />
                      ) : (
                        product.category
                      )}
                    </td>
                    <td>
                      {editingId === product.id ? (
                        <input
                          type="number"
                          value={editData.price}
                          onChange={e => setEditData({ ...editData, price: parseFloat(e.target.value) })}
                          style={styles.input}
                        />
                      ) : (
                        `₱${product.price}`
                      )}
                    </td>
                    <td>{product.quantity}</td>
                    <td style={styles.actions}>
                      {editingId === product.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(product.id, 'product')}
                            style={styles.saveBtn}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            style={styles.cancelBtn}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(product, 'product')}
                            style={styles.editBtn}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, 'product')}
                            style={styles.deleteBtn}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2>Manage Users</h2>
            <button 
              onClick={() => handleCreate('user')}
              style={styles.createBtn}
            >
              + Create User
            </button>
          </div>
          {usersLoading ? <p>Loading...</p> : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.email}</td>
                    <td>
                      {editingId === user.id ? (
                        <input
                          type="text"
                          value={editData.name || ''}
                          onChange={e => setEditData({ ...editData, name: e.target.value })}
                          style={styles.input}
                        />
                      ) : (
                        user.name
                      )}
                    </td>
                    <td>
                      {editingId === user.id ? (
                        <select
                          value={editData.role}
                          onChange={e => setEditData({ ...editData, role: e.target.value })}
                          style={styles.input}
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      ) : (
                        <span style={{ fontWeight: user.role === 'admin' ? 'bold' : 'normal' }}>
                          {user.role === 'admin' ? '👑' : '👤'} {user.role}
                        </span>
                      )}
                    </td>
                    <td>
                      {editingId === user.id ? (
                        <select
                          value={editData.status}
                          onChange={e => setEditData({ ...editData, status: e.target.value })}
                          style={styles.input}
                        >
                          <option value="active">active</option>
                          <option value="inactive">inactive</option>
                          <option value="suspended">suspended</option>
                        </select>
                      ) : (
                        <span style={{ color: user.status === 'active' ? 'green' : 'red' }}>
                          {user.status}
                        </span>
                      )}
                    </td>
                    <td style={styles.actions}>
                      {editingId === user.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(user.id, 'user')}
                            style={styles.saveBtn}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            style={styles.cancelBtn}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(user, 'user')}
                            style={styles.editBtn}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, 'user')}
                            style={styles.deleteBtn}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div style={styles.section}>
          <h2>Manage Orders</h2>
          {ordersLoading ? <p>Loading...</p> : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.userName}</td>
                    <td>₱{order.totalAmount}</td>
                    <td>
                      {editingId === order.id ? (
                        <select
                          value={editData.status}
                          onChange={e => setEditData({ ...editData, status: e.target.value })}
                          style={styles.input}
                        >
                          <option value="pending">pending</option>
                          <option value="processing">processing</option>
                          <option value="shipped">shipped</option>
                          <option value="delivered">delivered</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      ) : (
                        <span style={{ fontWeight: 'bold', color: order.status === 'pending' ? 'orange' : 'green' }}>
                          {order.status}
                        </span>
                      )}
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td style={styles.actions}>
                      {editingId === order.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(order.id, 'order')}
                            style={styles.saveBtn}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            style={styles.cancelBtn}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(order, 'order')}
                            style={styles.editBtn}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(order.id, 'order')}
                            style={styles.deleteBtn}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Forum Tab */}
      {activeTab === 'forum' && (
        <div style={styles.section}>
          <h2>Manage Forum Threads</h2>
          {forumLoading ? <p>Loading...</p> : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Replies</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {forumThreads.map(thread => (
                  <tr key={thread.id}>
                    <td>{thread.id}</td>
                    <td>{thread.title}</td>
                    <td>{thread.userName}</td>
                    <td>{thread.category}</td>
                    <td>
                      {editingId === thread.id ? (
                        <select
                          value={editData.status}
                          onChange={e => setEditData({ ...editData, status: e.target.value })}
                          style={styles.input}
                        >
                          <option value="active">active</option>
                          <option value="closed">closed</option>
                          <option value="pinned">pinned</option>
                        </select>
                      ) : (
                        <span style={{ fontWeight: thread.status === 'pinned' ? 'bold' : 'normal' }}>
                          {thread.status === 'pinned' ? '📌' : ''} {thread.status}
                        </span>
                      )}
                    </td>
                    <td>{thread.repliesCount}</td>
                    <td style={styles.actions}>
                      {editingId === thread.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(thread.id, 'thread')}
                            style={styles.saveBtn}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            style={styles.cancelBtn}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(thread, 'thread')}
                            style={styles.editBtn}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(thread.id, 'thread')}
                            style={styles.deleteBtn}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2>Manage Categories</h2>
            <button 
              onClick={() => handleCreate('category')}
              style={styles.createBtn}
            >
              + Create Category
            </button>
          </div>
          {categoriesLoading ? <p>Loading...</p> : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>{category.name}</td>
                    <td>{category.description}</td>
                    <td>{category.status}</td>
                    <td style={styles.actions}>
                      <button
                        onClick={() => handleEdit(category, 'category')}
                        style={styles.editBtn}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, 'category')}
                        style={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div style={styles.section}>
          <h2>Manage Reviews</h2>
          {reviewsLoading ? <p>Loading...</p> : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>User</th>
                  <th>Rating</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(review => (
                  <tr key={review.id}>
                    <td>{review.id}</td>
                    <td>{review.productName}</td>
                    <td>{review.userName}</td>
                    <td>{'⭐'.repeat(review.rating)}</td>
                    <td>{review.title}</td>
                    <td>{review.status}</td>
                    <td style={styles.actions}>
                      <button
                        onClick={() => handleEdit(review, 'review')}
                        style={styles.editBtn}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(review.id, 'review')}
                        style={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Create New {createType === 'product' ? 'Product' : 'User'}</h3>
            
            {createType === 'product' && (
              <div>
                <input
                  type="text"
                  placeholder="Product Name"
                  value={createData.name || ''}
                  onChange={e => setCreateData({ ...createData, name: e.target.value })}
                  style={styles.modalInput}
                />
                <select
                  value={createData.category || ''}
                  onChange={e => setCreateData({ ...createData, category: e.target.value })}
                  style={styles.modalInput}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Price"
                  value={createData.price || ''}
                  onChange={e => setCreateData({ ...createData, price: parseFloat(e.target.value) })}
                  style={styles.modalInput}
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={createData.quantity || ''}
                  onChange={e => setCreateData({ ...createData, quantity: parseInt(e.target.value) })}
                  style={styles.modalInput}
                />
                <textarea
                  placeholder="Description"
                  value={createData.description || ''}
                  onChange={e => setCreateData({ ...createData, description: e.target.value })}
                  style={styles.modalTextarea}
                />
                <input
                  type="text"
                  placeholder="Image URLs (comma-separated)"
                  value={createData.image ? (Array.isArray(createData.image) ? createData.image.join(', ') : createData.image) : ''}
                  onChange={e => setCreateData({ ...createData, image: e.target.value.split(',').map(url => url.trim()).filter(url => url) })}
                  style={styles.modalInput}
                />
              </div>
            )}

            {createType === 'user' && (
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={createData.name || ''}
                  onChange={e => setCreateData({ ...createData, name: e.target.value })}
                  style={styles.modalInput}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={createData.email || ''}
                  onChange={e => setCreateData({ ...createData, email: e.target.value })}
                  style={styles.modalInput}
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={createData.phone || ''}
                  onChange={e => setCreateData({ ...createData, phone: e.target.value })}
                  style={styles.modalInput}
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={createData.address || ''}
                  onChange={e => setCreateData({ ...createData, address: e.target.value })}
                  style={styles.modalInput}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={createData.password || ''}
                  onChange={e => setCreateData({ ...createData, password: e.target.value })}
                  style={styles.modalInput}
                />
                <select
                  value={createData.role || 'user'}
                  onChange={e => setCreateData({ ...createData, role: e.target.value })}
                  style={styles.modalInput}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            <div style={styles.modalActions}>
              <button
                onClick={handleCreateSubmit}
                style={styles.saveBtn}
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateData({});
                  setCreateType(null);
                }}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
    backgroundColor: '#f8f9fa'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    borderBottom: '3px solid #2ecc71',
    paddingBottom: '15px'
  },
  tabContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    borderBottom: '1px solid #ddd'
  },
  tab: {
    padding: '10px 20px',
    border: 'none',
    backgroundColor: '#f0f0f0',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s'
  },
  activeTab: {
    backgroundColor: '#2ecc71',
    color: 'white',
    borderBottom: '3px solid #27ae60'
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  createBtn: {
    padding: '8px 16px',
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    width: '500px',
    maxWidth: '90vw',
    maxHeight: '80vh',
    overflowY: 'auto'
  },
  modalInput: {
    width: '100%',
    padding: '10px',
    margin: '8px 0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  modalTextarea: {
    width: '100%',
    padding: '10px',
    margin: '8px 0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    minHeight: '80px',
    resize: 'vertical'
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '20px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginTop: '20px'
  },
  statCard: {
    backgroundColor: '#2ecc71',
    color: 'white',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold'
  },
  statLabel: {
    fontSize: '14px',
    marginTop: '10px',
    opacity: 0.9
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '15px'
  },
  input: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontFamily: 'inherit'
  },
  actions: {
    display: 'flex',
    gap: '5px'
  },
  editBtn: {
    padding: '6px 12px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  deleteBtn: {
    padding: '6px 12px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  saveBtn: {
    padding: '6px 12px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  cancelBtn: {
    padding: '6px 12px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  }
};

export default AdminScreen;
