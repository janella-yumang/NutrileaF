import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderNav from '../components/HeaderNav';

interface CartItem {
    id: number;
    name: string;
    price: number;
    cartQuantity: number;
}

const CartScreen: React.FC = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState<CartItem[]>([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('cart');
            if (raw) setCart(JSON.parse(raw));
        } catch (e) {}
    }, []);

    const persist = (c: CartItem[]) => {
        try {
            localStorage.setItem('cart', JSON.stringify(c));
            window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: c } }));
        } catch (e) {}
    };

    const updateQuantity = (id: number, qty: number) => {
        if (qty <= 0) return removeItem(id);
        const next = cart.map(it => it.id === id ? { ...it, cartQuantity: qty } : it);
        setCart(next); persist(next);
    };

    const removeItem = (id: number) => {
        const next = cart.filter(it => it.id !== id);
        setCart(next); persist(next);
    };

    const total = cart.reduce((s, it) => s + (it.price || 0) * (it.cartQuantity || 1), 0);

    return (
        <div className="screen" style={{ padding: 24 }}>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                <h2>Cart</h2>
                {cart.length === 0 ? (
                    <div style={{ padding: 24, background: 'white', borderRadius: 8 }}>Your cart is empty.</div>
                ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                        {cart.map(it => (
                            <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'white', padding: 12, borderRadius: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{it.name}</div>
                                    <div style={{ color: '#666' }}>₱{it.price}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <button onClick={() => updateQuantity(it.id, it.cartQuantity - 1)} style={{ width: 32, height: 32 }}>−</button>
                                    <div style={{ minWidth: 28, textAlign: 'center' }}>{it.cartQuantity}</div>
                                    <button onClick={() => updateQuantity(it.id, it.cartQuantity + 1)} style={{ width: 32, height: 32 }}>+</button>
                                    <button onClick={() => removeItem(it.id)} style={{ marginLeft: 8, color: '#ff6b6b' }}>Remove</button>
                                </div>
                            </div>
                        ))}

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, padding: 12 }}>
                            <div>Total</div>
                            <div>₱{total.toFixed(2)}</div>
                        </div>

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            <button onClick={() => navigate('/market')} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', background: 'white' }}>Continue shopping</button>
                            <button onClick={() => navigate('/order-history')} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #ddd', background: 'white' }}>Order History</button>
                            <button onClick={() => navigate('/checkout', { state: { cart } })} style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#1a5f3a', color: 'white' }}>Proceed to Checkout</button>
                        </div>
                    </div>
                )}
            </div>

            <HeaderNav />
        </div>
    );
};

export default CartScreen;
