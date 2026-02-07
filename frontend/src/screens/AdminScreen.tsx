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
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
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

  const fetchStats = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/stats`, { headers: adminHeaders });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch Products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/products`, { headers: adminHeaders });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setLoading(false);
  };

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/users`, { headers: adminHeaders });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setLoading(false);
  };

  // Fetch Orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/orders`, { headers: adminHeaders });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
    setLoading(false);
  };

  // Fetch Forum Threads
  const fetchForumThreads = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/forum/threads`, { headers: adminHeaders });
      const data = await res.json();
      if (data.success) {
        setForumThreads(data.threads);
      }
    } catch (error) {
      console.error('Error fetching forum threads:', error);
    }
    setLoading(false);
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
      if (type === 'product') {
        endpoint = `/api/admin/products/${id}`;
      } else if (type === 'user') {
        endpoint = `/api/admin/users/${id}`;
      } else if (type === 'order') {
        endpoint = `/api/admin/orders/${id}`;
      } else if (type === 'thread') {
        endpoint = `/api/admin/forum/threads/${id}`;
      }

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
      }
    } catch (error) {
      console.error('Error deleting:', error);
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
        {['dashboard', 'products', 'users', 'orders', 'forum'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab === 'products') fetchProducts();
              else if (tab === 'users') fetchUsers();
              else if (tab === 'orders') fetchOrders();
              else if (tab === 'forum') fetchForumThreads();
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
          <h2>Manage Products</h2>
          {loading ? <p>Loading...</p> : (
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
          <h2>Manage Users</h2>
          {loading ? <p>Loading...</p> : (
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
          {loading ? <p>Loading...</p> : (
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
          {loading ? <p>Loading...</p> : (
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
