import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderNav from '../components/HeaderNav';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  cartQuantity: number;
}

interface Order {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  deliveryAddress: string;
  paymentMethod: string;
  totalAmount: number;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

const OrderHistoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('nutrileaf_token');
    const userJson = localStorage.getItem('nutrileaf_user');
    
    if (!token || !userJson) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(userJson);
      setUserId(user.id);
    } catch (e) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const apiBase = process.env.REACT_APP_API_URL || 'https://nutrilea-10.onrender.com/api';
        const token = localStorage.getItem('nutrileaf_token');
        
        const res = await fetch(`${apiBase}/orders/my`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await res.json();
        if (data.success && data.orders) {
          setOrders(data.orders);
        } else {
          setError(data.error || 'Failed to load orders');
        }
      } catch (err) {
        setError(`Error: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'processing': return '#2196f3';
      case 'shipped': return '#9c27b0';
      case 'delivered': return '#4caf50';
      case 'cancelled': return '#f44336';
      default: return '#999';
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: string } = {
      pending: '⏳ Pending',
      processing: '🔄 Processing',
      shipped: '📦 Shipped',
      delivered: '✅ Delivered',
      cancelled: '❌ Cancelled'
    };
    return badges[status] || status;
  };

  return (
    <div className="screen" style={{ padding: 24 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Order History</h1>
        <p style={{ color: '#666', marginBottom: 24 }}>View all your orders and their status</p>

        {error && (
          <div style={{ background: '#fee', color: '#c33', padding: 16, borderRadius: 8, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ background: 'white', padding: 40, borderRadius: 12, textAlign: 'center' }}>
            <p style={{ color: '#666', margin: 0 }}>No orders yet.</p>
            <button
              onClick={() => navigate('/market')}
              style={{
                marginTop: 16,
                padding: '10px 20px',
                background: '#1a5f3a',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  background: 'white',
                  borderRadius: 12,
                  border: '1px solid #e0e0e0',
                  overflow: 'hidden'
                }}
              >
                {/* Order Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 16,
                  borderBottom: '1px solid #e0e0e0',
                  background: '#f9f9f9'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>Order #{order.id}</div>
                    <div style={{ color: '#666', fontSize: 14 }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
                    </div>
                  </div>
                  <div style={{
                    padding: '6px 12px',
                    background: getStatusColor(order.status),
                    color: 'white',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    textAlign: 'center'
                  }}>
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Order Items */}
                <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Items</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                        <div>{item.name} × {item.cartQuantity}</div>
                        <div>₱{(item.price * item.cartQuantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Details */}
                <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 14 }}>
                  <div>
                    <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>Delivery Address</div>
                    <div style={{ fontWeight: 500 }}>{order.deliveryAddress}</div>
                  </div>
                  <div>
                    <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>Payment Method</div>
                    <div style={{ fontWeight: 500 }}>
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'gcash' ? 'GCash' : 'Credit/Debit Card'}
                    </div>
                  </div>
                </div>

                {/* Order Total */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 16,
                  background: '#f9f9f9',
                  borderTop: '1px solid #e0e0e0'
                }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>Total Amount</div>
                  <div style={{ fontWeight: 700, fontSize: 20, color: '#1a5f3a' }}>₱{order.totalAmount.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/market')}
            style={{
              padding: '10px 20px',
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate('/cart')}
            style={{
              padding: '10px 20px',
              background: '#1a5f3a',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            View Cart
          </button>
        </div>
      </div>

      <HeaderNav />
    </div>
  );
};

export default OrderHistoryScreen;
