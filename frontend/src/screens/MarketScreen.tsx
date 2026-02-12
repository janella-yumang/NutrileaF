import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderNav from '../components/HeaderNav';

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
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Helper function to get image URL
    const getImageUrl = (image: string | string[] | undefined) => {
        if (!image) return '🌿'; // Default emoji if no image
        
        // If image is an array, take the first one
        const imageUrl = Array.isArray(image) ? image[0] : image;
        
        // If it's already a full URL or starts with /uploads/, return as is
        if (imageUrl.startsWith('http') || imageUrl.startsWith('/uploads/')) {
            return imageUrl;
        }
        
        // If it's just a filename, construct the URL
        const apiUrl = process.env.REACT_APP_API_URL || 'https://nutrileaf-10.onrender.com/api';
        const baseUrl = apiUrl.replace('/api', '');
        return `${baseUrl}/uploads/${imageUrl}`;
    };

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

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);

    // Fetch products from API
    const fetchProducts = useCallback(async () => {
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'https://nutrilea-10.onrender.com/api';
            console.log('MarketScreen - API URL:', apiUrl);
            console.log('MarketScreen - Full products URL:', `${apiUrl}/market/products`);
            const response = await fetch(`${apiUrl}/market/products`);
            
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
            const apiUrl = process.env.REACT_APP_API_URL || 'https://nutrilea-10.onrender.com/api';
            console.log('MarketScreen - API URL:', apiUrl);
            console.log('MarketScreen - Full categories URL:', `${apiUrl}/market/categories`);
            const response = await fetch(`${apiUrl}/market/categories`);
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

            {/* Simple Header with Cart */}
            <div style={{
                position: 'sticky',
                top: '0',
                background: 'white',
                borderBottom: '1px solid #e0e0e0',
                padding: '16px 20px',
                zIndex: 100,
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ 
                        margin: 0, 
                        fontSize: '24px', 
                        fontWeight: '600',
                        color: '#1a5f3a'
                    }}>
                        🌿 NutriLeaf Store
                    </h1>
                    
                    <button
                        onClick={() => navigate('/cart')}
                        aria-label="Shopping cart"
                        style={{
                            background: '#1a5f3a',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 12px rgba(26, 95, 58, 0.2)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(26, 95, 58, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 95, 58, 0.2)';
                        }}
                    >
                        🛒 Cart
                        {cartCount > 0 && (
                            <span style={{
                                background: '#ff6b6b',
                                color: 'white',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: '700',
                                marginLeft: '4px'
                            }}>
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '24px 20px 80px 20px',
                minHeight: 'calc(100vh - 140px)'
            }}>
                {/* Product Carousel */}
                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ 
                        fontSize: '20px', 
                        fontWeight: '600', 
                        marginBottom: '16px',
                        color: '#333'
                    }}>
                        Featured Products
                    </h2>
                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        overflowX: 'auto',
                        padding: '8px 0',
                        scrollBehavior: 'smooth'
                    }}>
                        {/* Use carousel images instead of first 8 products */}
                        {featuredProducts.map(product => (
                            <div
                                key={product.id}
                                onClick={() => setSelectedProduct(product)}
                                style={{
                                    minWidth: '200px',
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    border: '1px solid #e0e0e0',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                }}
                            >
                                <div style={{ marginBottom: '12px' }}>
                                    <img 
                                        src={getImageUrl(product.image)} 
                                        alt={product.name}
                                        style={{ 
                                            width: '100%',
                                            height: '150px',
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            backgroundColor: '#f8f9fa'
                                        }}
                                        onError={(e) => {
                                            const target = e.currentTarget;
                                            target.style.display = 'none';
                                            const fallback = target.nextElementSibling as HTMLElement;
                                            if (fallback) fallback.style.display = 'flex';
                                        }}
                                    />
                                    <div style={{
                                        display: 'none',
                                        width: '100%',
                                        height: '150px',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '48px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '8px'
                                    }}>
                                        🌿
                                    </div>
                                </div>
                                <h3 style={{
                                    margin: '0 0 8px 0',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#333',
                                    lineHeight: '1.3'
                                }}>
                                    {product.name}
                                </h3>
                                <p style={{
                                    margin: '0 0 12px 0',
                                    fontSize: '14px',
                                    color: '#666',
                                    lineHeight: '1.4'
                                }}>
                                    {product.description.length > 60 
                                        ? `${product.description.substring(0, 60)}...` 
                                        : product.description}
                                </p>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <span style={{
                                            fontSize: '18px',
                                            fontWeight: '700',
                                            color: '#1a5f3a'
                                        }}>
                                            ₱{product.price}
                                        </span>
                                        {product.originalPrice && (
                                            <span style={{
                                                fontSize: '14px',
                                                color: '#999',
                                                textDecoration: 'line-through',
                                                marginLeft: '8px'
                                            }}>
                                                ₱{product.originalPrice}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(product);
                                        }}
                                        style={{
                                            background: '#1a5f3a',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#2d7a50';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#1a5f3a';
                                        }}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Search Bar */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px', position: 'relative' }}>
                    <input
                        aria-label="Search products"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        placeholder="Search products, e.g. Moringa Powder"
                        style={{
                            width: 'min(600px, 90%)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            fontSize: '16px'
                        }}
                    />
                    
                    {showSuggestions && searchQuery.trim() !== '' && (
                        <div style={{
                            position: 'absolute',
                            top: '60px',
                            width: 'min(600px, 90%)',
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
                                                    // Fallback to emoji if image fails to load
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

                    {/* Category Filter */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '32px',
                        flexWrap: 'wrap'
                    }}>
                        <button
                            onClick={() => setSelectedCategory('all')}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '20px',
                                border: selectedCategory === 'all' ? '2px solid #1a5f3a' : '2px solid #d0d0d0',
                                background: selectedCategory === 'all' ? '#1a5f3a' : 'white',
                                color: selectedCategory === 'all' ? 'white' : '#333',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            All Products
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.name)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '20px',
                                    border: selectedCategory === cat.name ? '2px solid #1a5f3a' : '2px solid #d0d0d0',
                                    background: selectedCategory === cat.name ? '#1a5f3a' : 'white',
                                    color: selectedCategory === cat.name ? 'white' : '#333',
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
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                            Loading products...
                        </div>
                    ) : (
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
                                filteredProducts.map(product => (
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
                                            justifyContent: 'center',
                                            position: 'relative'
                                        }}>
                                            <img 
                                                src={getImageUrl(product.image)} 
                                                alt={product.name}
                                                style={{ 
                                                    maxWidth: '100%',
                                                    maxHeight: '100%',
                                                    objectFit: 'contain'
                                                }}
                                                onError={(e) => {
                                                    // Fallback to emoji if image fails to load
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                            <div style={{ 
                                                position: 'absolute',
                                                fontSize: '48px',
                                                display: 'none' // Hidden by default, shown if image fails
                                            }}>
                                                {typeof product.image === 'string' && product.image.length > 0 && !product.image.startsWith('http') && !product.image.startsWith('/uploads/') ? product.image : '🌿'}
                                            </div>
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
                                ))
                            )}
                        </div>
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
                                <img 
                                    src={getImageUrl(selected?.image)} 
                                    alt={selected.name}
                                    style={{ 
                                        width: '80px',
                                        height: '80px',
                                        objectFit: 'cover',
                                        borderRadius: '8px'
                                    }}
                                    onError={(e) => {
                                        // Fallback to emoji if image fails to load
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.removeAttribute('style');
                                    }}
                                />
                                <div style={{ 
                                    fontSize: '48px',
                                    display: 'none' // Hidden by default, shown if image fails
                                }}>
                                    {selectedEmoji}
                                </div>
                                <div>
                                    <h2 style={{ margin: 0 }}>{selected.name}</h2>
                                    <div style={{ color: '#666', fontSize: '14px' }}>{selected.quantity}</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a5f3a' }}>₱{selected.price}</div>
                                {selected.originalPrice && (
                                    <div style={{ textDecoration: 'line-through', color: '#999' }}>₱{selected.originalPrice}</div>
                                )}
                            </div>
                        </div>

                        <hr style={{ margin: '16px 0' }} />

                        <p style={{ color: '#444' }}>{selected.description}</p>

                        {selected.uses && (
                            <div style={{ marginTop: '10px' }}>
                                <h4 style={{ marginBottom: '8px' }}>What it's for</h4>
                                <ul>
                                    {selected.uses.map((u, i) => <li key={i}>{u}</li>)}
                                </ul>
                            </div>
                        )}

                        {selected.howToUse && (
                            <div style={{ marginTop: '10px' }}>
                                <h4 style={{ marginBottom: '8px' }}>How to use</h4>
                                <ol>
                                    {selected.howToUse.map((s, i) => <li key={i}>{s}</li>)}
                                </ol>
                            </div>
                        )}

                        {selected.reviews && (
                            <div style={{ marginTop: '10px' }}>
                                <h4 style={{ marginBottom: '8px' }}>Reviews</h4>
                                {selected.reviews.map((r, i) => (
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
                                onClick={() => { addToCart(selected); setSelectedProduct(null); }}
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

        <HeaderNav />
        </React.Fragment>
    );
};

export default MarketScreen;
