import React, { useState, useEffect, useCallback } from 'react';
import HeaderNav from '../components/HeaderNav';
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
  const [usersLoading, setUsersLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [forumLoading, setForumLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [createType, setCreateType] = useState<'product' | 'user' | 'category' | null>(null);
  const [editType, setEditType] = useState<'product' | 'user' | 'category' | null>(null);
  const [createData, setCreateData] = useState<any>({});
  const [editModalData, setEditModalData] = useState<any>({});
  
  const apiBase = process.env.REACT_APP_API_URL || 'https://nutrileaf-10.onrender.com/api';
  const getAdminHeaders = () => {
    const token = localStorage.getItem('nutrileaf_token');
    return {
      'Content-Type': 'application/json',
      'X-Admin-Role': 'true',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const fetchStats = useCallback(async () => {
    try {
      console.log('Fetching stats from:', `${apiBase}/admin/stats`);
      const res = await fetch(`${apiBase}/admin/stats`, { 
        headers: getAdminHeaders(),
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
      } else {
        console.error('Failed to fetch stats:', data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalForumThreads: 0,
        totalRevenue: 0
      });
    }
  }, [apiBase]);

  // Fetch dashboard stats
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    }
  }, [activeTab, fetchStats]);

  // Fetch categories for dropdown
  const fetchCategoriesForDropdown = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/admin/categories`, {
        headers: getAdminHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [apiBase]);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res = await fetch(`${apiBase}/admin/products`, { headers: getAdminHeaders() });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setProductsLoading(false);
  }, [apiBase]);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const timestamp = Date.now(); // Cache-busting
      const fullUrl = `${apiBase}/admin/users?t=${timestamp}`;
      console.log('=== FETCH USERS DEBUG ===');
      console.log('API URL:', apiBase);
      console.log('Full URL:', fullUrl);
      console.log('Headers:', getAdminHeaders());
      
      const res = await fetch(fullUrl, { 
        headers: getAdminHeaders(),
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
  }, [apiBase]);

  // Fetch Orders
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${apiBase}/admin/orders`, { headers: getAdminHeaders() });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
    setOrdersLoading(false);
  }, [apiBase]);

  // Fetch Forum Threads
  const fetchForumThreads = useCallback(async () => {
    setForumLoading(true);
    try {
      const res = await fetch(`${apiBase}/admin/forum/threads`, { headers: getAdminHeaders() });
      const data = await res.json();
      if (data.success) {
        setForumThreads(data.threads);
      }
    } catch (error) {
      console.error('Error fetching forum threads:', error);
    }
    setForumLoading(false);
  }, [apiBase]);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch(`${apiBase}/admin/categories`, { headers: getAdminHeaders() });
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
    setCategoriesLoading(false);
  }, [apiBase]);

  // Fetch Reviews
  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const res = await fetch(`${apiBase}/admin/reviews`, { headers: getAdminHeaders() });
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
    setReviewsLoading(false);
  }, [apiBase]);

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
  }, [
    activeTab,
    fetchProducts,
    fetchUsers,
    fetchOrders,
    fetchForumThreads,
    fetchCategories,
    fetchReviews
  ]);

  // Fetch categories for dropdown on component mount
  useEffect(() => {
    fetchCategoriesForDropdown();
  }, [fetchCategoriesForDropdown]);

  // Edit handler
  const handleEdit = (item: any, type: string) => {
    setEditType(type as 'product' | 'user' | 'category');
    setEditModalData({ ...item });
    setShowEditModal(true);
  };

  // Update handler for modal
  const handleModalUpdate = async () => {
    console.log('Modal update clicked', { editType, editModalData });
    
    // Basic validation
    if (editType === 'product') {
      if (!editModalData.name || !editModalData.category || !editModalData.price) {
        alert('Please fill in required fields: Name, Category, and Price');
        return;
      }
    }
    
    if (editType === 'user') {
      if (!editModalData.email || !editModalData.name) {
        alert('Please fill in required fields: Email and Name');
        return;
      }
    }
    
    if (editType === 'category') {
      if (!editModalData.name) {
        alert('Please fill in required field: Name');
        return;
      }
    }
    
    try {
      let endpoint = '';
      if (editType === 'product') endpoint = `/admin/products/${editModalData.id}`;
      else if (editType === 'user') endpoint = `/admin/users/${editModalData.id}`;
      else if (editType === 'category') endpoint = `/admin/categories/${editModalData.id}`;
      
      if (!endpoint) {
        console.error('No endpoint found for edit type:', editType);
        return;
      }

      // For products with images, use FormData
      if (editType === 'product' && editModalData.imageFile) {
        console.log('Using FormData for product edit with image');
        const formData = new FormData();
        
        // Add all product fields except imageFile
        Object.keys(editModalData).forEach(key => {
          if (key !== 'imageFile' && key !== 'image') {
            console.log('Adding field:', key, editModalData[key]);
            formData.append(key, editModalData[key]);
          }
        });
        
        // Add image file if exists
        if (editModalData.imageFile) {
          console.log('Adding image file:', editModalData.imageFile.name);
          formData.append('image', editModalData.imageFile);
        }
        
        console.log('Sending FormData to:', `${apiBase}${endpoint}`);
        const res = await fetch(`${apiBase}${endpoint}`, {
          method: 'PUT',
          headers: {
            'X-Admin-Role': 'true',
            ...(localStorage.getItem('nutrileaf_token') ? { 'Authorization': `Bearer ${localStorage.getItem('nutrileaf_token')}` } : {})
          },
          body: formData
        });

        console.log('Response status:', res.status);
        const data = await res.json();
        console.log('Response data:', data);
        
        if (data.success) {
          if (editType === 'product') fetchProducts();
          else if (editType === 'user') fetchUsers();
          else if (editType === 'category') fetchCategories();
          setShowEditModal(false);
          setEditModalData({});
          setEditType(null);
        } else {
          console.error('Update failed:', data);
          alert('Update failed: ' + (data.error || 'Unknown error'));
        }
      } else {
        console.log('Using JSON for', editType);
        // Regular JSON update for other cases
        const res = await fetch(`${apiBase}${endpoint}`, {
          method: 'PUT',
          headers: getAdminHeaders(),
          body: JSON.stringify(editModalData)
        });

        console.log('Response status:', res.status);
        const data = await res.json();
        console.log('Response data:', data);
        
        if (data.success) {
          if (editType === 'product') fetchProducts();
          else if (editType === 'user') fetchUsers();
          else if (editType === 'category') fetchCategories();
          setShowEditModal(false);
          setEditModalData({});
          setEditType(null);
        } else {
          console.error('Update failed:', data);
          alert('Update failed: ' + (data.error || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Error updating:', error);
      alert('Error updating: ' + (error as any).message);
    }
  };

  // Update handler (legacy for inline editing)
  const handleUpdate = async (id: number, type: string) => {
    try {
      let endpoint = '';
      if (type === 'product') endpoint = `/admin/products/${id}`;
      else if (type === 'user') endpoint = `/admin/users/${id}`;
      else if (type === 'order') endpoint = `/admin/orders/${id}`;
      else if (type === 'thread') endpoint = `/admin/forum/threads/${id}`;
      else if (type === 'category') endpoint = `/admin/categories/${id}`;
      else if (type === 'review') endpoint = `/admin/reviews/${id}`;

      const res = await fetch(`${apiBase}${endpoint}`, {
        method: 'PUT',
        headers: getAdminHeaders(),
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
      if (type === 'product') endpoint = `/admin/products/${id}`;
      else if (type === 'user') endpoint = `/admin/users/${id}`;
      else if (type === 'order') endpoint = `/admin/orders/${id}`;
      else if (type === 'thread') endpoint = `/admin/forum/threads/${id}`;
      else if (type === 'category') endpoint = `/admin/categories/${id}`;
      else if (type === 'review') endpoint = `/admin/reviews/${id}`;

      const res = await fetch(`${apiBase}${endpoint}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
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
    console.log('Create submit clicked', { createType, createData });
    
    // Basic validation
    if (createType === 'product') {
      if (!createData.name || !createData.category || !createData.price) {
        alert('Please fill in required fields: Name, Category, and Price');
        return;
      }
    }
    
    if (createType === 'user') {
      if (!createData.email || !createData.name) {
        alert('Please fill in required fields: Email and Name');
        return;
      }
    }
    
    if (createType === 'category') {
      if (!createData.name) {
        alert('Please fill in required field: Name');
        return;
      }
    }
    
    try {
      let endpoint = '';
      if (createType === 'product') endpoint = '/admin/products';
      else if (createType === 'user') endpoint = '/admin/users';
      else if (createType === 'category') endpoint = '/admin/categories';
      
      if (!endpoint) {
        console.error('No endpoint found for type:', createType);
        return;
      }

      // For products with images, use FormData
      if (createType === 'product' && createData.imageFile) {
        console.log('Using FormData for product with image');
        const formData = new FormData();
        
        // Add all product fields except imageFile
        Object.keys(createData).forEach(key => {
          if (key !== 'imageFile' && key !== 'image') {
            console.log('Adding field:', key, createData[key]);
            formData.append(key, createData[key]);
          }
        });
        
        // Add image file if exists
        if (createData.imageFile) {
          console.log('Adding image file:', createData.imageFile.name);
          formData.append('image', createData.imageFile);
        }
        
        console.log('Sending FormData to:', `${apiBase}${endpoint}`);
        const res = await fetch(`${apiBase}${endpoint}`, {
          method: 'POST',
          headers: {
            'X-Admin-Role': 'true',
            ...(localStorage.getItem('nutrileaf_token') ? { 'Authorization': `Bearer ${localStorage.getItem('nutrileaf_token')}` } : {})
          },
          body: formData
        });

        console.log('Response status:', res.status);
        const data = await res.json();
        console.log('Response data:', data);
        
        if (data.success) {
          if (createType === 'product') fetchProducts();
          else if (createType === 'user') fetchUsers();
          else if (createType === 'category') fetchCategories();
          setShowCreateModal(false);
          setCreateData({});
          setCreateType(null);
        } else {
          console.error('Create failed:', data);
          alert('Create failed: ' + (data.error || 'Unknown error'));
        }
      } else {
        console.log('Using JSON for', createType);
        // Regular JSON submission for other cases
        const res = await fetch(`${apiBase}${endpoint}`, {
          method: 'POST',
          headers: getAdminHeaders(),
          body: JSON.stringify(createData)
        });

        console.log('Response status:', res.status);
        const data = await res.json();
        console.log('Response data:', data);
        
        if (data.success) {
          if (createType === 'product') fetchProducts();
          else if (createType === 'user') fetchUsers();
          else if (createType === 'category') fetchCategories();
          setShowCreateModal(false);
          setCreateData({});
          setCreateType(null);
        } else {
          console.error('Create failed:', data);
          alert('Create failed: ' + (data.error || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Error creating:', error);
      alert('Error creating: ' + (error as any).message);
    }
  };

  return (
    <div>
      <HeaderNav />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>Admin Dashboard</h1>
          <p>Manage products, users, orders, categories, and reviews</p>
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
                  <th style={styles.tableHeader}>ID</th>
                  <th style={styles.tableHeader}>Name</th>
                  <th style={styles.tableHeader}>Category</th>
                  <th style={styles.tableHeader}>Price</th>
                  <th style={styles.tableHeader}>Stock</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{product.id}</td>
                    <td style={styles.tableCell}>{product.name}</td>
                    <td style={styles.tableCell}>{product.category}</td>
                    <td style={styles.tableCell}>₱{product.price}</td>
                    <td style={styles.tableCell}>{product.quantity}</td>
                    <td style={{...styles.tableCell, ...styles.actions}}>
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
                  <th style={styles.tableHeader}>ID</th>
                  <th style={styles.tableHeader}>Email</th>
                  <th style={styles.tableHeader}>Name</th>
                  <th style={styles.tableHeader}>Role</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{user.id}</td>
                    <td style={styles.tableCell}>{user.email}</td>
                    <td style={styles.tableCell}>{user.name}</td>
                    <td style={styles.tableCell}>
                      <span style={{ fontWeight: user.role === 'admin' ? 'bold' : 'normal' }}>
                        {user.role === 'admin' ? '👑' : '👤'} {user.role}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{ color: user.status === 'active' ? 'green' : 'red' }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{...styles.tableCell, ...styles.actions}}>
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
                  <th style={styles.tableHeader}>ID</th>
                  <th style={styles.tableHeader}>Customer</th>
                  <th style={styles.tableHeader}>Total</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Date</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{order.id}</td>
                    <td style={styles.tableCell}>{order.userName}</td>
                    <td style={styles.tableCell}>₱{order.totalAmount}</td>
                    <td style={styles.tableCell}>
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
                    <td style={styles.tableCell}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td style={{...styles.tableCell, ...styles.actions}}>
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
                  <th style={styles.tableHeader}>ID</th>
                  <th style={styles.tableHeader}>Title</th>
                  <th style={styles.tableHeader}>Author</th>
                  <th style={styles.tableHeader}>Category</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Replies</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {forumThreads.map(thread => (
                  <tr key={thread.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{thread.id}</td>
                    <td style={styles.tableCell}>{thread.title}</td>
                    <td style={styles.tableCell}>{thread.userName}</td>
                    <td style={styles.tableCell}>{thread.category}</td>
                    <td style={styles.tableCell}>
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
                    <td style={styles.tableCell}>{thread.repliesCount}</td>
                    <td style={{...styles.tableCell, ...styles.actions}}>
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
                  <th style={styles.tableHeader}>ID</th>
                  <th style={styles.tableHeader}>Name</th>
                  <th style={styles.tableHeader}>Description</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{category.id}</td>
                    <td style={styles.tableCell}>{category.name}</td>
                    <td style={styles.tableCell}>{category.description}</td>
                    <td style={styles.tableCell}>{category.status}</td>
                    <td style={{...styles.tableCell, ...styles.actions}}>
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
                  <th style={styles.tableHeader}>ID</th>
                  <th style={styles.tableHeader}>Product</th>
                  <th style={styles.tableHeader}>User</th>
                  <th style={styles.tableHeader}>Rating</th>
                  <th style={styles.tableHeader}>Title</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(review => (
                  <tr key={review.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{review.id}</td>
                    <td style={styles.tableCell}>{review.productName}</td>
                    <td style={styles.tableCell}>{review.userName}</td>
                    <td style={styles.tableCell}>{'⭐'.repeat(review.rating)}</td>
                    <td style={styles.tableCell}>{review.title}</td>
                    <td style={styles.tableCell}>{review.status}</td>
                    <td style={{...styles.tableCell, ...styles.actions}}>
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
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Product Image:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setCreateData({ ...createData, imageFile: e.target.files?.[0] })}
                    style={styles.modalInput}
                  />
                  {createData.imageFile && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                      Selected: {createData.imageFile.name}
                    </div>
                  )}
                </div>
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

      {/* Edit Modal */}
      {showEditModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Edit {editType === 'product' ? 'Product' : editType === 'user' ? 'User' : 'Category'}</h3>
            
            {editType === 'product' && (
              <div>
                <input
                  type="text"
                  placeholder="Product Name"
                  value={editModalData.name || ''}
                  onChange={e => setEditModalData({ ...editModalData, name: e.target.value })}
                  style={styles.modalInput}
                />
                <select
                  value={editModalData.category || ''}
                  onChange={e => setEditModalData({ ...editModalData, category: e.target.value })}
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
                  value={editModalData.price || ''}
                  onChange={e => setEditModalData({ ...editModalData, price: parseFloat(e.target.value) })}
                  style={styles.modalInput}
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={editModalData.quantity || ''}
                  onChange={e => setEditModalData({ ...editModalData, quantity: parseInt(e.target.value) })}
                  style={styles.modalInput}
                />
                <textarea
                  placeholder="Description"
                  value={editModalData.description || ''}
                  onChange={e => setEditModalData({ ...editModalData, description: e.target.value })}
                  style={styles.modalTextarea}
                />
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Product Image (leave empty to keep current):
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setEditModalData({ ...editModalData, imageFile: e.target.files?.[0] })}
                    style={styles.modalInput}
                  />
                  {editModalData.imageFile && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                      New image: {editModalData.imageFile.name}
                    </div>
                  )}
                  {editModalData.image && Array.isArray(editModalData.image) && editModalData.image.length > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                      Current: {editModalData.image.length} image(s)
                    </div>
                  )}
                </div>
              </div>
            )}

            {editType === 'user' && (
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={editModalData.name || ''}
                  onChange={e => setEditModalData({ ...editModalData, name: e.target.value })}
                  style={styles.modalInput}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={editModalData.email || ''}
                  onChange={e => setEditModalData({ ...editModalData, email: e.target.value })}
                  style={styles.modalInput}
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={editModalData.phone || ''}
                  onChange={e => setEditModalData({ ...editModalData, phone: e.target.value })}
                  style={styles.modalInput}
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={editModalData.address || ''}
                  onChange={e => setEditModalData({ ...editModalData, address: e.target.value })}
                  style={styles.modalInput}
                />
                <select
                  value={editModalData.role || 'user'}
                  onChange={e => setEditModalData({ ...editModalData, role: e.target.value })}
                  style={styles.modalInput}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  value={editModalData.status || 'active'}
                  onChange={e => setEditModalData({ ...editModalData, status: e.target.value })}
                  style={styles.modalInput}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            )}

            {editType === 'category' && (
              <div>
                <input
                  type="text"
                  placeholder="Category Name"
                  value={editModalData.name || ''}
                  onChange={e => setEditModalData({ ...editModalData, name: e.target.value })}
                  style={styles.modalInput}
                />
                <textarea
                  placeholder="Description"
                  value={editModalData.description || ''}
                  onChange={e => setEditModalData({ ...editModalData, description: e.target.value })}
                  style={styles.modalTextarea}
                />
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Category Image (leave empty to keep current):
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setEditModalData({ ...editModalData, imageFile: e.target.files?.[0] })}
                    style={styles.modalInput}
                  />
                  {editModalData.imageFile && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                      New image: {editModalData.imageFile.name}
                    </div>
                  )}
                </div>
                <select
                  value={editModalData.status || 'active'}
                  onChange={e => setEditModalData({ ...editModalData, status: e.target.value })}
                  style={styles.modalInput}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            )}

            <div style={styles.modalActions}>
              <button
                onClick={handleModalUpdate}
                style={styles.saveBtn}
              >
                Update
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditModalData({});
                  setEditType(null);
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
  </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '24px',
    paddingTop: '140px',
    maxWidth: '1400px',
    margin: '0 auto',
    backgroundColor: 'transparent'
  },
  header: {
    textAlign: 'left',
    marginBottom: '18px',
    borderBottom: '1px solid rgba(15, 36, 25, 0.12)',
    paddingBottom: '12px'
  },
  tabContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '16px',
    borderBottom: '1px solid rgba(15, 36, 25, 0.10)',
    backgroundColor: 'rgba(255,255,255,0.7)',
    backdropFilter: 'blur(8px)',
    borderRadius: '12px',
    padding: '8px'
  },
  tab: {
    padding: '10px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s',
    borderRadius: '10px',
    color: '#0f2419'
  },
  activeTab: {
    backgroundColor: '#1a5f3a',
    color: 'white',
    boxShadow: '0 8px 16px rgba(15, 36, 25, 0.12)'
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 14px 30px rgba(15, 36, 25, 0.10)',
    border: '1px solid rgba(15, 36, 25, 0.08)'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  createBtn: {
    padding: '8px 16px',
    backgroundColor: '#1a5f3a',
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
    background: 'linear-gradient(135deg, #1a5f3a 0%, #2d7a50 60%, #3a8f60 100%)',
    color: 'white',
    padding: '20px',
    borderRadius: '14px',
    textAlign: 'left',
    boxShadow: '0 12px 22px rgba(15, 36, 25, 0.18)'
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
    marginTop: '12px',
    overflow: 'hidden',
    borderRadius: '12px',
    border: '1px solid rgba(15, 36, 25, 0.08)',
    fontSize: '14px',
    backgroundColor: 'white'
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
  },
  tableCell: {
    padding: '16px 12px',
    textAlign: 'left',
    borderBottom: '1px solid rgba(15, 36, 25, 0.06)',
    verticalAlign: 'middle',
    lineHeight: '1.5'
  },
  tableHeader: {
    padding: '18px 12px',
    textAlign: 'left',
    backgroundColor: '#f8faf9',
    fontWeight: '600',
    color: '#0f2419',
    borderBottom: '2px solid rgba(15, 36, 25, 0.12)',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  tableRow: {
    transition: 'background-color 0.2s ease'
  },
  tableRowHover: {
    backgroundColor: '#f8faf9'
  }
};

export default AdminScreen;
