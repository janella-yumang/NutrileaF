import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderNav from '../components/HeaderNav';

interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    originalPrice?: number;
    image: string;
    description: string;
    benefits: string[];
    quantity?: string;
    uses?: string[];
    howToUse?: string[];
    reviews?: { author: string; rating: number; comment: string }[];
}

interface CartItem extends Product {
    cartQuantity: number;
}

const MarketScreen: React.FC = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem('cart');
            if (raw) setCart(JSON.parse(raw));
        } catch (e) { /* ignore */ }
    }, []);

    const persistCart = (newCart: CartItem[]) => {
        try { localStorage.setItem('cart', JSON.stringify(newCart)); } catch (e) {}
    };

    const products: Product[] = [
        {
            id: 1,
            name: 'Fresh Moringa Leaves Bundle',
            category: 'fresh',
            price: 349,
            originalPrice: 450,
            image: '🌿',
            description: 'Fresh, organic moringa leaves harvested daily. Perfect for salads, smoothies, and traditional cooking.',
            benefits: ['100% Organic', 'Rich in Iron', 'Fresh Picked', 'No Pesticides'],
            quantity: '250g'
        },
        {
            id: 2,
            name: 'Moringa Powder',
            category: 'powder',
            price: 599,
            image: '✨',
            description: 'Pure moringa leaf powder, finely ground. Easy to mix into smoothies, soups, and beverages.',
            benefits: ['High in Protein', 'Energy Boost', 'Easy to Use', 'Long Shelf Life'],
            quantity: '200g'
        },
        {
            id: 3,
            name: 'Moringa Tea Blend',
            category: 'tea',
            price: 279,
            originalPrice: 350,
            image: '🍵',
            description: 'Premium moringa tea blend with natural herbs. Smooth, earthy flavor with wellness benefits.',
            benefits: ['Detox Support', 'Antioxidants', 'Calming', 'Great Taste'],
            quantity: '20 Tea Bags'
            ,
            uses: ['Daily detox', 'Gentle digestion support', 'Relaxation in evenings'],
            howToUse: ['Steep 1 tea bag in hot water for 5-7 minutes', 'Optional: add honey or lemon'],
            reviews: [
                { author: 'Ari', rating: 5, comment: 'Great flavor and very calming.' },
                { author: 'Ben', rating: 4, comment: 'Helps with digestion, mild taste.' }
            ]
        },
        {
            id: 4,
            name: 'Organic Moringa Capsules',
            category: 'supplements',
            price: 699,
            image: '💊',
            description: 'Convenient daily supplement. Each capsule contains pure moringa leaf extract.',
            benefits: ['Nutrient Dense', 'Convenient', 'Vegan', 'Daily Wellness'],
            quantity: '90 Capsules'
        },
        {
            id: 5,
            name: 'Moringa Oil',
            category: 'oils',
            price: 899,
            image: '🫧',
            description: 'Cold-pressed moringa seed oil. Perfect for skincare, haircare, and culinary use.',
            benefits: ['Skin Care', 'Hair Health', 'Pure Extract', 'Multi-Use'],
            quantity: '100ml'
        },
        {
            id: 6,
            name: 'Moringa Honey Blend',
            category: 'specialty',
            price: 449,
            originalPrice: 550,
            image: '🍯',
            description: 'Raw honey infused with moringa. Perfect sweetener for tea or as a natural energy boost.',
            benefits: ['Natural Sweetener', 'Energy Rich', 'Immune Support', 'Raw & Unpasteurized'],
            quantity: '250g'
            ,
            uses: ['Natural sweetener', 'Spread on toast', 'Add to tea for energy'],
            howToUse: ['Use 1–2 teaspoons in beverages or spread as desired'],
            reviews: [
                { author: 'Clara', rating: 5, comment: 'Lovely blend, very natural.' }
            ]
        },
        {
            id: 7,
            name: 'Moringa Smoothie Mix',
            category: 'mixes',
            price: 549,
            image: '🥤',
            description: 'Ready-to-blend moringa mix with fruits and superfoods. Quick nutritious smoothies anytime.',
            benefits: ['Complete Nutrition', 'Easy to Use', 'Tasty', 'Convenient'],
            quantity: '400g'
        },
        {
            id: 8,
            name: 'Dried Moringa Leaves',
            category: 'fresh',
            price: 399,
            image: '🌱',
            description: 'Air-dried moringa leaves. Ideal for making tea, soups, or adding to cooking.',
            benefits: ['Long Lasting', 'Full Nutrition', 'No Processing', 'Eco-Friendly'],
            quantity: '200g'
        }
    ];

    const categories = [
        { id: 'all', name: 'All Products' },
        { id: 'fresh', name: 'Fresh' },
        { id: 'powder', name: 'Powder' },
        { id: 'tea', name: 'Tea' },
        { id: 'supplements', name: 'Supplements' },
        { id: 'oils', name: 'Oils' },
        { id: 'specialty', name: 'Specialty' },
        { id: 'mixes', name: 'Mixes' }
    ];

    const filteredProducts = products
        .filter(p => selectedCategory === 'all' ? true : p.category === selectedCategory)
        .filter(p => searchQuery.trim() === '' ? true : p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const addToCart = (product: Product) => {
        setCart(prevCart => {
            const existing = prevCart.find(item => item.id === product.id);
            let newCart: CartItem[];
            if (existing) {
                newCart = prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, cartQuantity: item.cartQuantity + 1 }
                        : item
                );
            } else {
                newCart = [...prevCart, { ...product, cartQuantity: 1 }];
            }
            persistCart(newCart);
            return newCart;
        });
    };

    const addToCartWithQuantity = (product: Product, quantity = 1) => {
        setCart(prevCart => {
            const existing = prevCart.find(item => item.id === product.id);
            let newCart: CartItem[];
            if (existing) {
                newCart = prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, cartQuantity: item.cartQuantity + quantity }
                        : item
                );
            } else {
                newCart = [...prevCart, { ...product, cartQuantity: quantity }];
            }
            persistCart(newCart);
            return newCart;
        });
    };

    const removeFromCart = (productId: number) => {
        setCart(prevCart => {
            const newCart = prevCart.filter(item => item.id !== productId);
            persistCart(newCart);
            return newCart;
        });
    };

    const updateQuantity = (productId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            setCart(prevCart => {
                const newCart = prevCart.map(item =>
                    item.id === productId ? { ...item, cartQuantity: quantity } : item
                );
                persistCart(newCart);
                return newCart;
            });
        }
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);
    const cartCount = cart.reduce((sum, item) => sum + item.cartQuantity, 0);

    return (
        <div className="screen" style={{ position: 'relative' }}>
            <div className="header" style={{ height: 0 }} />

            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '24px 20px 80px 20px',
                minHeight: 'calc(100vh - 140px)',
                display: 'flex',
                gap: '24px'
            }}>
                {/* Main Content */}
                <div style={{ flex: 1 }}>
                    {/* Hero Section */}
                    <div style={{
                        position: 'relative',
                        background: 'linear-gradient(135deg, #1a5f3a 0%, #2d7a50 100%)',
                        borderRadius: '16px',
                        padding: '56px 48px 40px 48px',
                        color: 'white',
                        marginBottom: '16px',
                        textAlign: 'center'
                    }}>

                        {/* Buttons over hero */}
                        <div style={{ position: 'absolute', top: '18px', left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 18px', zIndex: 1500 }}>
                            <button
                                onClick={() => navigate(-1)}
                                aria-label="Back"
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'rgba(255,255,255,0.95)',
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontSize: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 6px 18px rgba(15,36,25,0.06)'
                                }}
                            >
                                ←
                            </button>

                            <button
                                onClick={() => navigate('/cart')}
                                aria-label="Open cart"
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'rgba(255,255,255,0.95)',
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontSize: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    boxShadow: '0 6px 18px rgba(15,36,25,0.06)'
                                }}
                            >
                                🛒
                                {cartCount > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '-8px',
                                        right: '-8px',
                                        background: '#ff6b6b',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: '22px',
                                        height: '22px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        fontWeight: '700'
                                    }}>
                                        {cartCount}
                                    </div>
                                )}
                            </button>
                        </div>
                        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🌿</div>
                        <h1 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '42px',
                            fontWeight: '700',
                            marginBottom: '12px',
                            letterSpacing: '-0.5px'
                        }}>
                            Welcome to Moringa Store
                        </h1>
                        <p style={{
                            fontSize: '18px',
                            opacity: 0.95,
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            Discover premium moringa products sourced and packaged with care. Packed with nutrients to support your wellness journey.
                        </p>
                    </div>

                    {/* Search Bar with Autocomplete */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', position: 'relative' }}>
                        <input
                            aria-label="Search products"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                            placeholder="Search products, e.g. Moringa Powder"
                            style={{
                                width: 'min(800px, 95%)',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '1px solid #e0e0e0',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                            }}
                        />

                        {showSuggestions && searchQuery.trim() !== '' && (
                            <div style={{
                                position: 'absolute',
                                top: '56px',
                                width: 'min(800px, 95%)',
                                background: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                                maxHeight: '280px',
                                overflowY: 'auto',
                                zIndex: 1500,
                                border: '1px solid #f0f0f0'
                            }}>
                                {products
                                    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .slice(0, 6)
                                    .map(p => (
                                        <div
                                            key={p.id}
                                            onMouseDown={() => { setSelectedProduct(p); setSearchQuery(''); setShowSuggestions(false); }}
                                            style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #fafafa' }}
                                        >
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <div style={{ fontSize: '20px' }}>{p.image}</div>
                                                <div style={{ fontSize: '14px', color: '#222' }}>{p.name}</div>
                                            </div>
                                            <div style={{ color: '#1a5f3a', fontWeight: 700 }}>₱{p.price}</div>
                                        </div>
                                    ))}
                                {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                    <div style={{ padding: '12px 16px', color: '#888' }}>No results</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Category Filter */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '32px',
                        flexWrap: 'wrap'
                    }}>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '20px',
                                    border: selectedCategory === cat.id ? '2px solid #1a5f3a' : '2px solid #d0d0d0',
                                    background: selectedCategory === cat.id ? '#1a5f3a' : 'white',
                                    color: selectedCategory === cat.id ? 'white' : '#333',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Products Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: '24px'
                    }}>
                        {filteredProducts.map(product => (
                            <div
                                key={product.id}
                                onClick={() => setSelectedProduct(product)}
                                style={{
                                    background: '#ffffff',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid #eef6ef',
                                    boxShadow: '0 8px 24px rgba(15,36,25,0.06)',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = '0 12px 30px rgba(15,36,25,0.08)';
                                        e.currentTarget.style.transform = 'translateY(-6px)';
                                        e.currentTarget.style.border = '1px solid #bde9c9';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,36,25,0.06)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.border = '1px solid #eef6ef';
                                    }}
                            >
                                {/* Product Image */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #f0fdf4 0%, #e8f5e9 100%)',
                                    padding: '32px',
                                    textAlign: 'center',
                                    fontSize: '48px',
                                    minHeight: '180px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {product.image}
                                </div>

                                {/* Product Info */}
                                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    {product.originalPrice && (
                                        <div style={{
                                            display: 'inline-block',
                                            background: '#ff6b6b',
                                            color: 'white',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            marginBottom: '8px',
                                            width: 'fit-content'
                                        }}>
                                            Sale
                                        </div>
                                    )}
                                    <h3 style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#0f2419',
                                        marginBottom: '4px',
                                        lineHeight: '1.3'
                                    }}>
                                        {product.name}
                                    </h3>
                                    <p style={{
                                        fontSize: '12px',
                                        color: '#999',
                                        marginBottom: '8px'
                                    }}>
                                        {product.quantity}
                                    </p>
                                    <p style={{
                                        fontSize: '13px',
                                        color: '#666',
                                        marginBottom: '12px',
                                        lineHeight: '1.4',
                                        flex: 1
                                    }}>
                                        {product.description}
                                    </p>

                                    {/* Price and Add-to-cart row */}
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontSize: '20px',
                                                fontWeight: '700',
                                                color: '#1a5f3a'
                                            }}>
                                                ₱{product.price}
                                            </div>
                                            {product.originalPrice && (
                                                <div style={{
                                                    fontSize: '13px',
                                                    color: '#999',
                                                    textDecoration: 'line-through'
                                                }}>
                                                    ₱{product.originalPrice}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                            aria-label={`Add ${product.name} to cart`}
                                            style={{
                                                background: '#1a5f3a',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 12px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                display: 'flex',
                                                gap: '8px',
                                                alignItems: 'center'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(26, 95, 58, 0.3)';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            🛒 Add
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                                            style={{
                                                background: 'white',
                                                color: '#1a5f3a',
                                                border: '1px solid #1a5f3a',
                                                padding: '8px 12px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cart is now a separate page at /cart */}

                {/* Product Detail Modal */}
                {selectedProduct && (
                    <div
                        onClick={() => setSelectedProduct(null)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2000
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: 'min(900px, 95%)',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                background: 'white',
                                borderRadius: '12px',
                                padding: '20px',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ fontSize: '48px' }}>{selectedProduct.image}</div>
                                    <div>
                                        <h2 style={{ margin: 0 }}>{selectedProduct.name}</h2>
                                        <div style={{ color: '#666', fontSize: '14px' }}>{selectedProduct.quantity}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a5f3a' }}>₱{selectedProduct.price}</div>
                                    {selectedProduct.originalPrice && (
                                        <div style={{ textDecoration: 'line-through', color: '#999' }}>₱{selectedProduct.originalPrice}</div>
                                    )}
                                </div>
                            </div>

                            <hr style={{ margin: '16px 0' }} />

                            <p style={{ color: '#444' }}>{selectedProduct.description}</p>

                            {selectedProduct.uses && (
                                <div style={{ marginTop: '10px' }}>
                                    <h4 style={{ marginBottom: '8px' }}>What it's for</h4>
                                    <ul>
                                        {selectedProduct.uses.map((u, i) => <li key={i}>{u}</li>)}
                                    </ul>
                                </div>
                            )}

                            {selectedProduct.howToUse && (
                                <div style={{ marginTop: '10px' }}>
                                    <h4 style={{ marginBottom: '8px' }}>How to use</h4>
                                    <ol>
                                        {selectedProduct.howToUse.map((s, i) => <li key={i}>{s}</li>)}
                                    </ol>
                                </div>
                            )}

                            {selectedProduct.reviews && (
                                <div style={{ marginTop: '10px' }}>
                                    <h4 style={{ marginBottom: '8px' }}>Reviews</h4>
                                    {selectedProduct.reviews.map((r, i) => (
                                        <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <strong>{r.author}</strong>
                                                <span style={{ color: '#1a5f3a' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                                            </div>
                                            <div style={{ color: '#555' }}>{r.comment}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', alignItems: 'center' }}>
                                <button
                                    onClick={() => { addToCartWithQuantity(selectedProduct, 1); setSelectedProduct(null); }}
                                    style={{ background: '#1a5f3a', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Add to cart
                                </button>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    style={{ background: 'white', color: '#1a5f3a', border: '1px solid #1a5f3a', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <HeaderNav />
        </div>
    );
};

export default MarketScreen;