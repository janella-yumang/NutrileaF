import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import HeaderNav from '../components/HeaderNav';
import FloatingChat from '../components/FloatingChat';

interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    originalPrice?: number;
    image: string | string[];
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
    const API_BASE = process.env.REACT_APP_API_URL || 'https://nutrilea-10.onrender.com/api';
    const BASE_URL = API_BASE.replace('/api', '');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const cartRef = React.useRef<HTMLDivElement | null>(null);

    // Helper function to get image URL
    const getImageUrl = (image: string | string[] | undefined) => {
        if (!image) return undefined; // Return undefined if no image
        
        // If image is an array, take the first one
        const imageUrl = Array.isArray(image) ? image[0] : image;
        
        // Check if it's an emoji (single character emojis are typically 1-2 chars long)
        const isEmoji = imageUrl && imageUrl.length <= 2 && /\p{Emoji}/u.test(imageUrl);
        if (isEmoji) return undefined; // Return undefined for emoji, we'll handle separately
        
        // If it's already a full URL or starts with /uploads/, return as is
        if (imageUrl.startsWith('http')) {
            return imageUrl;
        }
        if (imageUrl.startsWith('/uploads/')) {
            return `${BASE_URL}${imageUrl}`;
        }
        
        // If it's just a filename, construct the URL
        return `${BASE_URL}/uploads/${imageUrl}`;
    };

    // Helper function to get emoji from image
    const getImageEmoji = (image: string | string[] | undefined) => {
        if (!image) return '🌿';
        
        const imageUrl = Array.isArray(image) ? image[0] : image;
        const isEmoji = imageUrl && imageUrl.length <= 2 && /\p{Emoji}/u.test(imageUrl);
        
        return isEmoji ? imageUrl : '🌿';
    };

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem('cart');
            if (raw) setCart(JSON.parse(raw));
        } catch (e) { /* ignore */ }
    }, []);

    const persistCart = (newCart: CartItem[]) => {
        try {
            localStorage.setItem('cart', JSON.stringify(newCart));
            window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: newCart } }));
        } catch (e) {}
    };

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);

    // Fetch products from API
    const fetchProducts = useCallback(async () => {
        try {
            console.log('MarketScreen - API URL:', API_BASE);
            console.log('MarketScreen - Full products URL:', `${API_BASE}/market/products`);
            const timestamp = Date.now(); // Cache busting
            const response = await fetch(`${API_BASE}/market/products?t=${timestamp}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                setProducts(data.products);
            } else {
                throw new Error(data.error || 'Failed to fetch products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            // Set empty products array to prevent infinite loading
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            console.log('MarketScreen - API URL:', API_BASE);
            console.log('MarketScreen - Full categories URL:', `${API_BASE}/market/categories`);
            const response = await fetch(`${API_BASE}/market/categories`);
            console.log('MarketScreen - Categories response:', response);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                setCategories(data.categories);
            } else {
                throw new Error(data.error || 'Failed to fetch categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Set empty categories array to prevent issues
            setCategories([]);
        }
    }, []);

    // Load products and categories on mount
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts, fetchCategories]);

    // Handle click outside cart dropdown
    useEffect(() => {
        if (!cartOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (cartRef.current && !cartRef.current.contains(target)) {
                setCartOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [cartOpen]);

    const filteredProducts = products
        .filter(p => selectedCategory === 'all' ? true : p.category === selectedCategory)
        .filter(p => searchQuery.trim() === '' ? true : p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const featuredProducts: Product[] = [
        {
            id: 1,
            name: 'Premium Moringa Powder',
            category: 'featured',
            price: 299,
            description: '100% organic moringa leaf powder',
            image: '/images/products1.jpg',
            benefits: [],
            quantity: '250g'
        },
        {
            id: 2,
            name: 'Moringa Capsules',
            category: 'featured',
            price: 399,
            description: 'Convenient moringa supplement capsules',
            image: '/images/products2.jpg',
            benefits: [],
            quantity: '60 caps'
        },
        {
            id: 3,
            name: 'Moringa Tea',
            category: 'featured',
            price: 199,
            description: 'Refreshing moringa herbal tea blend',
            image: '/images/products3.jpg',
            benefits: [],
            quantity: '20 bags'
        },
        {
            id: 4,
            name: 'Moringa Oil',
            category: 'featured',
            price: 499,
            description: 'Cold-pressed moringa essential oil',
            image: '/images/products4.jpg',
            benefits: [],
            quantity: '30ml'
        }
    ];

    const heroSlides = [
        {
            id: 1,
            title: 'NutriLeaf Superfood Powder',
            subtitle: '100% organic malunggay powder for smoothies, soups, and rice.',
            ctaPrimary: 'Get the Powder',
            ctaSecondary: 'View Benefits',
            image: '/images/products1.jpg',
            badge: 'New Arrival'
        },
        {
            id: 2,
            title: 'Pure Malunggay Leaf Capsules',
            subtitle: 'Packed with Vitamin C and essential nutrients for daily wellness.',
            ctaPrimary: 'Shop Capsules',
            ctaSecondary: 'Learn More',
            image: '/images/products2.jpg',
            badge: 'Best Seller'
        },
        {
            id: 3,
            title: 'Moringa Herbal Tea Blend',
            subtitle: 'A calming brew with a clean, earthy finish.',
            ctaPrimary: 'Brew a Cup',
            ctaSecondary: 'See Recipe',
            image: '/images/products3.jpg',
            badge: 'Limited'
        },
        {
            id: 4,
            title: 'Cold-Pressed Moringa Oil',
            subtitle: 'Nourish skin and hair with antioxidant-rich oil.',
            ctaPrimary: 'Shop Oil',
            ctaSecondary: 'Ingredients',
            image: '/images/products4.jpg',
            badge: 'Premium'
        }
    ];
    const [heroIndex, setHeroIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % heroSlides.length);
        }, 4500);
        return () => clearInterval(timer);
    }, [heroSlides.length]);

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

    const cartCount = cart.reduce((sum, item) => sum + item.cartQuantity, 0);

    const selected = selectedProduct;
    const selectedImage = selected?.image;
    const selectedEmoji =
        typeof selectedImage === 'string' &&
        selectedImage.length > 0 &&
        !selectedImage.startsWith('http') &&
        !selectedImage.startsWith('/uploads/')
            ? selectedImage
            : '🌿';

    return (
        <React.Fragment>
        <div className="screen" style={{ position: 'relative' }}>
            <div className="header" style={{ height: 0 }} />

            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '24px 20px 80px 20px',
                minHeight: 'calc(100vh - 140px)'
            }}>
                {/* Hero Carousel */}
                <div style={{
                    marginBottom: '32px',
                    backgroundImage: `linear-gradient(90deg, rgba(7, 43, 24, 0.98) 0%, rgba(14, 74, 39, 0.9) 45%, rgba(20, 95, 52, 0.35) 70%, rgba(20, 95, 52, 0.05) 100%), url(${heroSlides[heroIndex].image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    borderRadius: '24px',
                    padding: '40px',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 22px 40px rgba(9, 48, 27, 0.25)',
                    minHeight: '380px',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <div style={{ maxWidth: '520px' }}>
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(255,255,255,0.18)',
                            padding: '6px 12px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.8px'
                        }}>
                            {heroSlides[heroIndex].badge}
                        </span>
                        <h2 style={{ fontSize: '36px', margin: '14px 0 12px 0', lineHeight: 1.1 }}>
                            {heroSlides[heroIndex].title}
                        </h2>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: '15px', lineHeight: 1.6 }}>
                            {heroSlides[heroIndex].subtitle}
                        </p>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '18px', flexWrap: 'wrap' }}>
                            <button style={{
                                background: 'white',
                                color: '#0b3b23',
                                border: 'none',
                                borderRadius: '999px',
                                padding: '10px 18px',
                                cursor: 'pointer',
                                fontWeight: 700
                            }}>
                                {heroSlides[heroIndex].ctaPrimary}
                            </button>
                            <button style={{
                                background: 'transparent',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.5)',
                                borderRadius: '999px',
                                padding: '10px 18px',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}>
                                {heroSlides[heroIndex].ctaSecondary}
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                        aria-label="Previous slide"
                        style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            cursor: 'pointer'
                        }}
                    >
                        ‹
                    </button>
                    <button
                        onClick={() => setHeroIndex((prev) => (prev + 1) % heroSlides.length)}
                        aria-label="Next slide"
                        style={{
                            position: 'absolute',
                            right: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            cursor: 'pointer'
                        }}
                    >
                        ›
                    </button>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '18px' }}>
                        {heroSlides.map((slide, index) => (
                            <button
                                key={slide.id}
                                onClick={() => setHeroIndex(index)}
                                aria-label={`Go to slide ${index + 1}`}
                                style={{
                                    width: index === heroIndex ? '26px' : '8px',
                                    height: '8px',
                                    borderRadius: '999px',
                                    border: 'none',
                                    background: index === heroIndex ? 'white' : 'rgba(255,255,255,0.4)',
                                    cursor: 'pointer',
                                    transition: 'width 0.2s ease'
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '12px',
                    marginBottom: '24px',
                    background: '#0f3c22',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    color: 'white'
                }}>
                    {[
                        { icon: '🚚', title: 'Free Delivery', text: 'Orders above ₱599' },
                        { icon: '🌿', title: '100% Organic', text: 'Certified pesticide-free' },
                        { icon: '🧪', title: 'Lab Tested', text: 'Third-party verified purity' },
                        { icon: '↩️', title: 'Easy Returns', text: '30-day hassle policy' }
                    ].map(item => (
                        <div key={item.title} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div style={{ fontSize: '18px' }}>{item.icon}</div>
                            <div>
                                <div style={{ fontSize: '12px', fontWeight: 700 }}>{item.title}</div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)' }}>{item.text}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search Bar */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', position: 'relative' }}>
                    <div style={{ flex: 1 }}>
                        <input
                            aria-label="Search products"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                            onFocus={(e) => {
                                setShowSuggestions(true);
                                e.currentTarget.style.boxShadow = '0 12px 28px rgba(26, 95, 58, 0.18)';
                                e.currentTarget.style.border = '2px solid #1a5f3a';
                            }}
                            onBlur={(e) => {
                                setTimeout(() => setShowSuggestions(false), 150);
                                e.currentTarget.style.boxShadow = '0 10px 24px rgba(15,36,25,0.12)';
                                e.currentTarget.style.border = '1px solid #d0e5d8';
                            }}
                            placeholder="Search malunggay products..."
                            style={{
                                width: '100%',
                                background: 'linear-gradient(135deg, #fafcfb 0%, #f4faf6 100%)',
                                border: '1px solid #d0e5d8',
                                borderRadius: '999px',
                                padding: '16px 20px',
                                boxShadow: '0 10px 24px rgba(15,36,25,0.12)',
                                fontSize: '15px',
                                fontWeight: 500,
                                transition: 'all 0.3s ease',
                                color: '#0f2419'
                            }}
                        />
                        {showSuggestions && searchQuery.trim() !== '' && (
                            <div style={{
                                position: 'absolute',
                                top: '60px',
                                width: 'min(900px, 100%)',
                                background: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                                maxHeight: '280px',
                                overflowY: 'auto',
                                zIndex: 1500,
                                border: '1px solid #f0f0f0'
                            }}>
                                {products
                                    .filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .slice(0, 6)
                                    .map(product => (
                                        <div
                                            key={product.id}
                                            onMouseDown={() => { setSelectedProduct(product); setSearchQuery(''); setShowSuggestions(false); }}
                                            style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #fafafa' }}
                                        >
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <img 
                                                    src={getImageUrl(product.image)} 
                                                    alt={product.name}
                                                    style={{ 
                                                        width: '24px', 
                                                        height: '24px', 
                                                        objectFit: 'cover',
                                                        borderRadius: '4px'
                                                    }}
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.nextElementSibling?.removeAttribute('style');
                                                    }}
                                                />
                                                <div style={{ fontSize: '14px', color: '#222' }}>{product.name}</div>
                                            </div>
                                            <div style={{ color: '#1a5f3a', fontWeight: 700 }}>₱{product.price}</div>
                                        </div>
                                    ))}
                                {products.filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                    <div style={{ padding: '12px 16px', color: '#888' }}>No results</div>
                                )}
                            </div>
                        )}
                    </div>
                    <select
                        aria-label="Sort products"
                        style={{
                            minWidth: '140px',
                            padding: '12px 14px',
                            borderRadius: '999px',
                            border: '1px solid #d9eadf',
                            background: '#f6faf7',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#1a3b2a'
                        }}
                        defaultValue="featured"
                    >
                        <option value="featured">Sort: Featured</option>
                        <option value="new">Sort: New</option>
                        <option value="price-low">Sort: Price Low</option>
                        <option value="price-high">Sort: Price High</option>
                    </select>
                    <div ref={cartRef} style={{ position: 'relative' }}>
                        <button
                            type="button"
                            onClick={() => setCartOpen((prev) => !prev)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                borderRadius: '999px',
                                padding: '12px 14px',
                                background: 'linear-gradient(135deg, #1a5f3a 0%, #2d7a50 100%)',
                                color: 'white',
                                border: 'none',
                                boxShadow: '0 10px 20px rgba(26, 95, 58, 0.18)',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '13px',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <ShoppingCart size={18} />
                            <span>Cart</span>
                            {cart.length > 0 && (
                                <span style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    borderRadius: '999px',
                                    padding: '2px 8px',
                                    fontSize: '12px',
                                    fontWeight: 700
                                }}>
                                    {cart.reduce((sum, item) => sum + item.cartQuantity, 0)}
                                </span>
                            )}
                        </button>

                        {cartOpen && (
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 10px)',
                                right: 0,
                                width: '320px',
                                background: 'white',
                                borderRadius: '14px',
                                boxShadow: '0 20px 45px rgba(0,0,0,0.16)',
                                border: '1px solid #edf3ef',
                                padding: '14px',
                                zIndex: 3000
                            }}>
                                <div style={{
                                    fontWeight: 700,
                                    marginBottom: '8px',
                                    color: '#0f2419',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <span>Cart summary</span>
                                    <span style={{ fontSize: '12px', color: '#6b7f71' }}>{cart.reduce((sum, item) => sum + item.cartQuantity, 0)} item(s)</span>
                                </div>

                                {cart.length === 0 ? (
                                    <div style={{ padding: '12px 8px', color: '#6b7f71', fontSize: '14px' }}>
                                        Your cart is empty.
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '10px', maxHeight: '220px', overflowY: 'auto' }}>
                                        {cart.slice(0, 4).map((item) => (
                                            <div key={item.id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '10px 12px',
                                                background: '#f7fbf8',
                                                borderRadius: '10px'
                                            }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f2419' }}>
                                                        {item.name}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#6b7f71' }}>
                                                        Qty: {item.cartQuantity}
                                                    </div>
                                                </div>
                                                <div style={{ fontWeight: 700, color: '#1a5f3a' }}>
                                                    ₱{item.price}
                                                </div>
                                            </div>
                                        ))}
                                        {cart.length > 4 && (
                                            <div style={{ fontSize: '12px', color: '#6b7f71', textAlign: 'center' }}>
                                                +{cart.length - 4} more item(s)
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div style={{
                                    display: 'flex',
                                    gap: '10px',
                                    marginTop: '12px'
                                }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCartOpen(false);
                                            navigate('/cart');
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '10px 12px',
                                            borderRadius: '999px',
                                            border: '1px solid #d9eadf',
                                            background: 'white',
                                            color: '#1a5f3a',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        View cart
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCartOpen(false);
                                            navigate('/checkout');
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '10px 12px',
                                            borderRadius: '999px',
                                            border: 'none',
                                            background: '#1a5f3a',
                                            color: 'white',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Checkout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                    {/* Category Filter */}
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        marginBottom: '28px',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-start'
                    }}>
                        <button
                            onClick={() => setSelectedCategory('all')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '999px',
                                border: selectedCategory === 'all' ? '1px solid #1a5f3a' : '1px solid #cfe2d6',
                                background: selectedCategory === 'all' ? '#1a5f3a' : '#f7fbf8',
                                color: selectedCategory === 'all' ? 'white' : '#1a3b2a',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            All Products
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.name)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '999px',
                                    border: selectedCategory === cat.name ? '1px solid #1a5f3a' : '1px solid #cfe2d6',
                                    background: selectedCategory === cat.name ? '#1a5f3a' : '#f7fbf8',
                                    color: selectedCategory === cat.name ? 'white' : '#1a3b2a',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                            Loading products...
                        </div>
                    ) : (
                        <React.Fragment>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '20px', color: '#123b24' }}>Our Products</h3>
                                    <div style={{ fontSize: '12px', color: '#6b7f74' }}>Showing {filteredProducts.length} products</div>
                                </div>
                                <button style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#1a5f3a',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}>
                                    View all →
                                </button>
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                gap: '24px'
                            }}>
                            {filteredProducts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#666', gridColumn: '1 / -1' }}>
                                    No products found
                                </div>
                            ) : (
                                filteredProducts.map((product, index) => (
                                    <div
                                        key={product.id}
                                        onClick={() => setSelectedProduct(product)}
                                        style={{
                                            background: '#ffffff',
                                            borderRadius: '18px',
                                            overflow: 'hidden',
                                            border: '2px solid transparent',
                                            boxShadow: '0 10px 22px rgba(15,36,25,0.08)',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.boxShadow = '0 16px 32px rgba(15,36,25,0.14)';
                                            e.currentTarget.style.transform = 'translateY(-6px)';
                                            e.currentTarget.style.border = '2px solid #a8d5b8';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.boxShadow = '0 10px 22px rgba(15,36,25,0.08)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.border = '2px solid transparent';
                                        }}
                                    >
                                        {/* Product Image */}
                                        <div style={{
                                            background: '#f4faf6',
                                            padding: '26px',
                                            textAlign: 'center',
                                            fontSize: '48px',
                                            minHeight: '180px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative'
                                        }}>
                                            <div style={{
                                                position: 'absolute',
                                                top: '12px',
                                                left: '12px',
                                                background: index % 3 === 0 ? '#ff814a' : '#31a46e',
                                                color: 'white',
                                                fontSize: '10px',
                                                fontWeight: 700,
                                                padding: '4px 8px',
                                                borderRadius: '999px'
                                            }}>
                                                {index % 3 === 0 ? 'HOT' : 'NEW'}
                                            </div>
                                            {getImageUrl(product.image) ? (
                                                <img 
                                                    src={getImageUrl(product.image)} 
                                                    alt={product.name}
                                                    style={{ 
                                                        maxWidth: '100%',
                                                        maxHeight: '100%',
                                                        objectFit: 'contain'
                                                    }}
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div style={{ fontSize: '48px' }}>
                                                    {getImageEmoji(product.image)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                                                color: '#7a8b82',
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
                                                        padding: '8px 14px',
                                                        borderRadius: '999px',
                                                        cursor: 'pointer',
                                                        fontWeight: '600',
                                                        fontSize: '13px',
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
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            </div>
                        </React.Fragment>
                    )}
                </div>
            </div>

        {/* Product Detail Modal */}
        {selected && (
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
                            width: 'min(1000px, 95%)',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            background: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
                        }}
                    >
                        {/* 50/50 Split: Image (right) and Details (left) */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '500px' }}>
                            {/* LEFT: Text Details */}
                            <div style={{ padding: '32px', borderRight: '1px solid #f0f0f0', overflowY: 'auto', maxHeight: '90vh' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div>
                                        <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', color: '#0f2419' }}>{selected.name}</h2>
                                        <div style={{ color: '#7a8b82', fontSize: '14px' }}>{selected.quantity}</div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedProduct(null)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '24px',
                                            cursor: 'pointer',
                                            color: '#999'
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1a5f3a', marginBottom: '8px' }}>
                                    ₱{selected.price}
                                </div>
                                {selected.originalPrice && (
                                    <div style={{ textDecoration: 'line-through', color: '#999', marginBottom: '16px' }}>
                                        ₱{selected.originalPrice}
                                    </div>
                                )}

                                <p style={{ color: '#444', lineHeight: '1.6', marginBottom: '16px' }}>{selected.description}</p>

                                {selected.benefits && selected.benefits.length > 0 && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <h4 style={{ marginBottom: '8px', color: '#0f2419', fontSize: '14px', fontWeight: '600' }}>Benefits</h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {selected.benefits.map((b: string, i: number) => (
                                                <div key={i} style={{ background: '#f0fdf4', color: '#1a5f3a', padding: '6px 12px', borderRadius: '999px', fontSize: '13px' }}>
                                                    ✓ {b}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selected.uses && selected.uses.length > 0 && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <h4 style={{ marginBottom: '8px', color: '#0f2419', fontSize: '14px', fontWeight: '600' }}>What it's for</h4>
                                        <ul style={{ margin: '0', paddingLeft: '24px' }}>
                                            {selected.uses.map((u: string, i: number) => <li key={i} style={{ color: '#555', marginBottom: '4px' }}>{u}</li>)}
                                        </ul>
                                    </div>
                                )}

                                {selected.howToUse && selected.howToUse.length > 0 && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <h4 style={{ marginBottom: '8px', color: '#0f2419', fontSize: '14px', fontWeight: '600' }}>How to use</h4>
                                        <ol style={{ margin: '0', paddingLeft: '24px' }}>
                                            {selected.howToUse.map((s: string, i: number) => <li key={i} style={{ color: '#555', marginBottom: '4px' }}>{s}</li>)}
                                        </ol>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                    <button
                                        onClick={() => { addToCart(selected); setSelectedProduct(null); }}
                                        style={{ 
                                            flex: 1, 
                                            background: '#1a5f3a', 
                                            color: 'white', 
                                            border: 'none', 
                                            padding: '12px 16px', 
                                            borderRadius: '8px', 
                                            cursor: 'pointer', 
                                            fontWeight: '600',
                                            fontSize: '14px'
                                        }}
                                    >
                                        🛒 Add to cart
                                    </button>
                                </div>
                            </div>

                            </div>
                        </div>

                        {/* REVIEWS SECTION */}
                        <div style={{ padding: '32px', borderTop: '1px solid #f0f0f0', background: '#f9f9f9' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#0f2419', fontSize: '18px', fontWeight: '600' }}>Customer Reviews</h3>
                            
                            {/* Review Form - Only show if user is logged in */}
                            {(() => {
                                const userJson = localStorage.getItem('nutrileaf_user');
                                const user = userJson ? JSON.parse(userJson) : null;
                                
                                return user && (
                                    <div style={{ 
                                        background: '#f9f9f9', 
                                        padding: '16px', 
                                        borderRadius: '8px', 
                                        marginBottom: '24px',
                                        border: '1px solid #f0f0f0'
                                    }}>
                                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>Share your experience</h4>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            const title = (e.target as any).reviewTitle.value;
                                            const content = (e.target as any).reviewContent.value;
                                            const rating = parseInt((e.target as any).reviewRating.value);
                                            
                                            const token = localStorage.getItem('nutrileaf_token');
                                            fetch('https://nutrilea-backend.onrender.com/api/reviews/submit', {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': `Bearer ${token}`
                                                },
                                                body: JSON.stringify({
                                                    productId: selected.id,
                                                    rating,
                                                    title,
                                                    content
                                                })
                                            })
                                            .then(r => r.json())
                                            .then(data => {
                                                if (data.success) {
                                                    alert('Review submitted successfully!');
                                                    (e.target as any).reset();
                                                    // Refresh modal to show new review
                                                    setSelectedProduct(null);
                                                    setSelectedProduct(selected);
                                                } else {
                                                    alert(data.error || 'Failed to submit review');
                                                }
                                            })
                                            .catch(err => alert('Error: ' + err.message));
                                        }}>
                                            <div style={{ marginBottom: '12px' }}>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Rating</label>
                                                <select name="reviewRating" required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px' }}>
                                                    <option value="">Select rating...</option>
                                                    <option value="1">1 star</option>
                                                    <option value="2">2 stars</option>
                                                    <option value="3">3 stars</option>
                                                    <option value="4">4 stars</option>
                                                    <option value="5">5 stars</option>
                                                </select>
                                            </div>
                                            <div style={{ marginBottom: '12px' }}>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Title</label>
                                                <input 
                                                    type="text" 
                                                    name="reviewTitle" 
                                                    placeholder="e.g., Great quality product" 
                                                    required 
                                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px', boxSizing: 'border-box' }} 
                                                />
                                            </div>
                                            <div style={{ marginBottom: '12px' }}>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Review</label>
                                                <textarea 
                                                    name="reviewContent" 
                                                    placeholder="Share your experience..." 
                                                    required 
                                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px', boxSizing: 'border-box', minHeight: '80px' }} 
                                                />
                                            </div>
                                            <button 
                                                type="submit"
                                                style={{ 
                                                    background: '#1a5f3a', 
                                                    color: 'white', 
                                                    border: 'none', 
                                                    padding: '8px 16px', 
                                                    borderRadius: '4px', 
                                                    cursor: 'pointer', 
                                                    fontWeight: '600',
                                                    fontSize: '13px'
                                                }}
                                            >
                                                Submit Review
                                            </button>
                                        </form>
                                    </div>
                                );
                            })()}

                            {/* Reviews List */}
                            <div>
                                {selected.reviews && selected.reviews.length > 0 ? (
                                    <div>
                                        {selected.reviews.map((r: any, i: number) => (
                                            <div key={i} style={{ paddingBottom: '16px', borderBottom: '1px solid #f0f0f0', marginBottom: '16px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                                    <div style={{ fontWeight: '600', color: '#0f2419' }}>{r.author || 'Anonymous'}</div>
                                                    <div style={{ color: '#1a5f3a', fontSize: '14px', fontWeight: '600' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                                                </div>
                                                {r.title && <div style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>{r.title}</div>}
                                                <div style={{ color: '#555', fontSize: '13px', lineHeight: '1.5' }}>{r.comment}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ color: '#999', fontSize: '14px', textAlign: 'center', padding: '24px' }}>
                                        No reviews yet. Be the first to review!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        <HeaderNav />
        <FloatingChat />
        </React.Fragment>
    );
};

export default MarketScreen;
