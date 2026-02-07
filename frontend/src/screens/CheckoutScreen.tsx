import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HeaderNav from '../components/HeaderNav';

const CheckoutScreen: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const cart = (location.state && (location.state as any).cart) || [];

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'cod'|'gcash'|'card'>('cod');
    const [cardNumber, setCardNumber] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const total = cart.reduce((s: number, it: any) => s + (it.price || 0) * (it.cartQuantity || 1), 0);

    const handlePlaceOrder = async () => {
        if (!name || !address || !phone) {
            setError('Please fill name, address, and phone.');
            return;
        }
        if (paymentMethod === 'card' && cardNumber.trim().length < 12) {
            setError('Please enter a valid card number.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            // Call backend API to save order to PostgreSQL
            const apiUrl = process.env.REACT_APP_API_URL || 'https://nutrilea-backend.onrender.com/api';
            const response = await fetch(`${apiUrl}/api/orders/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userName: name,
                    userPhone: phone,
                    deliveryAddress: address,
                    paymentMethod: paymentMethod,
                    totalAmount: total,
                    items: cart
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Clear cart from localStorage
                localStorage.removeItem('cart');
                alert(`Order #${data.orderId} placed successfully!`);
                navigate('/market', { replace: true });
            } else {
                setError(data.error || 'Failed to place order');
            }
        } catch (err) {
            setError(`Error: ${(err as Error).message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="screen" style={{ padding: 24 }}>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                <h2>Checkout</h2>

                {error && (
                    <div style={{ background: '#fee', color: '#c33', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                        {error}
                    </div>
                )}

                <section style={{ background: 'white', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                    <h4 style={{ marginTop: 0 }}>Delivery Information</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                        <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} style={{ padding: 10, borderRadius: 6, border: '1px solid #e6e6e6' }} />
                        <input placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: 10, borderRadius: 6, border: '1px solid #e6e6e6' }} />
                        <textarea placeholder="Delivery address" value={address} onChange={e => setAddress(e.target.value)} style={{ padding: 10, borderRadius: 6, border: '1px solid #e6e6e6' }} />
                    </div>
                </section>

                <section style={{ background: 'white', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                    <h4 style={{ marginTop: 0 }}>Payment Method</h4>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input type="radio" name="pm" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} /> Cash on Delivery
                        </label>
                        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input type="radio" name="pm" checked={paymentMethod === 'gcash'} onChange={() => setPaymentMethod('gcash')} /> GCash
                        </label>
                        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input type="radio" name="pm" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /> Credit/Debit Card
                        </label>
                    </div>

                    {paymentMethod === 'card' && (
                        <div style={{ marginTop: 12 }}>
                            <input placeholder="Card number" value={cardNumber} onChange={e => setCardNumber(e.target.value)} style={{ padding: 10, borderRadius: 6, border: '1px solid #e6e6e6', width: '100%' }} />
                        </div>
                    )}
                </section>

                <section style={{ background: 'white', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                    <h4 style={{ marginTop: 0 }}>Order Summary</h4>
                    {cart.length === 0 ? (
                        <div>Your cart is empty.</div>
                    ) : (
                        <div style={{ display: 'grid', gap: 8 }}>
                            {cart.map((it: any) => (
                                <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div>{it.name} × {it.cartQuantity}</div>
                                    <div>₱{(it.price * it.cartQuantity).toFixed(2)}</div>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                <div>Total</div>
                                <div>₱{total.toFixed(2)}</div>
                            </div>
                        </div>
                    )}
                </section>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button onClick={() => navigate(-1)} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', background: 'white' }}>Continue shopping</button>
                    <button onClick={handlePlaceOrder} disabled={submitting || cart.length === 0} style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#1a5f3a', color: 'white' }}>{submitting ? 'Placing...' : 'Place order'}</button>
                </div>
            </div>

            <HeaderNav />
        </div>
    );
};

export default CheckoutScreen;
