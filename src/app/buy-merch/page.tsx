'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ShoppingBag, Heart, Star, Plus, Minus, Filter, Search, ShoppingCart, X } from 'lucide-react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

// Initialize Stripe
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

// Card payment form component
function CardPaymentForm({ 
  clientSecret, 
  onPaymentSuccess, 
  onPaymentError,
  amount 
}: { 
  clientSecret: string; 
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  amount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      setIsProcessing(false);
      return;
    }

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment failed');
        onPaymentError(confirmError.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent.id);
      } else {
        setError('Payment was not successful');
        onPaymentError('Payment was not successful');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during payment';
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'League Spartan, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <label className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
          Card Details *
        </label>
        <CardElement options={cardElementOptions} />
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm font-league-spartan">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full px-6 py-3 bg-[#042C45] text-white rounded-lg hover:bg-[#042C45]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-league-spartan"
      >
        {isProcessing ? 'Processing Payment...' : `Pay KSh ${amount.toLocaleString()}`}
      </button>
    </form>
  );
}

// Replace mock products with live data
interface ShopProduct {
  id: string;
  name: string;
  price: number;
  currency?: string;
  images?: string[];
  category?: string;
  stockQuantity?: number;
  isActive?: boolean;
  description?: string;
}

export default function BuyMerchPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'info' | 'payment'>('info');
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'stripe' as 'stripe' | 'mpesa',
    acceptTerms: false
  });
  const [paymentData, setPaymentData] = useState<{
    clientSecret?: string;
    orderId?: string;
    checkoutRequestId?: string;
    amount: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [mpesaPhone, setMpesaPhone] = useState('');
  const paymentPollInterval = useRef<NodeJS.Timeout | null>(null);

  // Fetch products from API (initial, on tab focus, and periodic refresh)
  useEffect(() => {
    let isMounted = true;
    let refreshTimer: NodeJS.Timeout | null = null;

    const loadProducts = async () => {
      if (!isMounted) return;
      setIsLoadingProducts(true);
      setProductsError(null);
      try {
        const res = await fetch(`/api/products?limit=60&sortBy=createdAt&sortOrder=desc`, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to load products');
        }
        if (isMounted) {
          const list = Array.isArray(data.data) ? data.data : (data.data?.products || []);
          setProducts(list);
        }
      } catch (err: any) {
        if (isMounted) setProductsError(err.message || 'Failed to load products');
      } finally {
        if (isMounted) setIsLoadingProducts(false);
      }
    };

    // Initial load
    loadProducts();

    // Refresh when tab becomes visible
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadProducts();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Periodic refresh every 30s
    refreshTimer = setInterval(loadProducts, 30000);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', onVisibility);
      if (refreshTimer) clearInterval(refreshTimer);
    };
  }, []);

  const categories = ['all', ...Array.from(new Set(products.map(p => (p as any).category).filter(Boolean) as string[]))];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product) => {
    if (product && product.inStock === false) {
      setError('This item is currently out of stock.');
      return;
    }
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      setCart(prev => prev.filter(item => item.id !== productId));
    } else {
      setCart(prev => prev.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const formatPrice = (price) => {
    return `KSh ${price.toLocaleString()}`;
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowCart(false);
    setShowCheckout(true);
    setCheckoutStep('info');
  };

  // Get reCAPTCHA token
  const getRecaptchaToken = async (): Promise<string> => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    
    if (!siteKey || siteKey === 'your_recaptcha_site_key' || siteKey.trim() === '') {
      return 'dev-placeholder-token';
    }

    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.grecaptcha) {
        resolve('dev-placeholder-token');
        return;
      }

      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(siteKey, { action: 'order' })
          .then((token: string) => {
            resolve(token);
          })
          .catch(() => {
            resolve('dev-placeholder-token');
          });
      });
    });
  };

  // Load reCAPTCHA script
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (typeof window !== 'undefined' && !window.grecaptcha && siteKey && siteKey !== 'your_recaptcha_site_key' && siteKey.trim() !== '') {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Client-side validation
      if (!checkoutForm.name || checkoutForm.name.trim().length < 2) {
        throw new Error('Please enter your name (at least 2 characters).');
      }
      
      if (!checkoutForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutForm.email)) {
        throw new Error('Please enter a valid email address.');
      }
      
      if (!checkoutForm.phone || checkoutForm.phone.trim().length < 10) {
        throw new Error('Please enter a valid phone number (at least 10 characters).');
      }

      // Validate address fields (API requires full address object)
      const trimmedAddress = checkoutForm.address?.trim() || '';
      if (!trimmedAddress || trimmedAddress.length < 5) {
        setError('Please enter a valid street address (at least 5 characters).');
        setIsSubmitting(false);
        return;
      }
      
      const trimmedCity = checkoutForm.city?.trim() || '';
      if (!trimmedCity || trimmedCity.length < 2) {
        setError('Please enter a valid city (at least 2 characters).');
        setIsSubmitting(false);
        return;
      }
      
      const trimmedPostalCode = checkoutForm.postalCode?.trim() || '';
      if (!trimmedPostalCode || trimmedPostalCode.length < 3) {
        setError('Please enter a valid postal code (at least 3 characters).');
        setIsSubmitting(false);
        return;
      }
      
      if (!checkoutForm.acceptTerms) {
        throw new Error('Please accept the Terms and Conditions and Privacy Policy.');
      }

      // Get reCAPTCHA token
      const recaptchaToken = await getRecaptchaToken();

      const total = getTotalPrice();

      // Create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.id.toString(),
            quantity: item.quantity,
            // Provide name/price for demo mode fallback on the server
            name: item.name,
            price: item.price,
          })),
          customerInfo: {
            name: checkoutForm.name.trim(),
            email: checkoutForm.email.trim().toLowerCase(),
            phone: checkoutForm.phone.trim(),
            address: {
              street: trimmedAddress,
              city: trimmedCity,
              state: 'N/A', // Default state if not provided
              postalCode: trimmedPostalCode,
              country: 'Kenya' // Default country
            }
          },
          paymentMethod: checkoutForm.paymentMethod,
          shippingMethod: 'standard',
          termsAccepted: checkoutForm.acceptTerms,
          privacyAccepted: checkoutForm.acceptTerms,
          recaptchaToken: recaptchaToken,
          // Hint to server to skip DB product validation in demo
          skipValidation: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.details 
          ? Array.isArray(data.details) 
            ? data.details.map((err: any) => `${err.path?.join('.')}: ${err.message}`).join(', ')
            : data.error || 'Failed to create order'
          : data.error || 'Failed to create order';
        throw new Error(errorMessage);
      }

      // Store payment data and move to payment step
      setPaymentData({
        clientSecret: data.data?.clientSecret,
        orderId: data.data?.orderId,
        checkoutRequestId: data.data?.checkoutRequestId,
        amount: total
      });

      // For M-Pesa, use the phone number from form
      if (checkoutForm.paymentMethod === 'mpesa') {
        let phoneNumber = checkoutForm.phone.trim();
        if (!phoneNumber.startsWith('254')) {
          if (phoneNumber.startsWith('0')) {
            phoneNumber = '254' + phoneNumber.substring(1);
          } else if (phoneNumber.startsWith('7')) {
            phoneNumber = '254' + phoneNumber;
          } else {
            phoneNumber = '254' + phoneNumber;
          }
        }
        setMpesaPhone(phoneNumber);
      }

      setCheckoutStep('payment');
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Stripe payment success
  const handleStripePaymentSuccess = async (paymentIntentId: string) => {
    setPaymentConfirmed(true);
    setSuccess(true);
    
    setTimeout(() => {
      setShowCheckout(false);
      setCart([]);
      setCheckoutStep('info');
      setPaymentData(null);
      setPaymentConfirmed(false);
    }, 2000);
  };

  // Handle M-Pesa STK Push
  const handleMpesaPayment = async () => {
    if (!mpesaPhone || mpesaPhone.trim().length < 10) {
      setError('Please enter a valid M-Pesa phone number (e.g., 254712345678)');
      return;
    }

    setIsProcessingPayment(true);
    setError(null);

    try {
      const amount = getTotalPrice();
      
      const response = await fetch('/api/mpesa/stk-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: mpesaPhone.trim(),
          amount: amount,
          accountReference: `order_${paymentData?.orderId}`,
          transactionDesc: 'Equality Vanguard Shop Order'
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.details 
          ? Array.isArray(data.details) 
            ? data.details.map((err: any) => `${err.path?.join('.')}: ${err.message}`).join(', ')
            : data.error || 'Failed to initiate M-Pesa payment'
          : data.error || 'Failed to initiate M-Pesa payment';
        throw new Error(errorMessage);
      }

      if (data.data?.checkoutRequestId) {
        setPaymentData(prev => prev ? {
          ...prev,
          checkoutRequestId: data.data.checkoutRequestId
        } : null);

        startPaymentPolling(data.data.checkoutRequestId);
      }
    } catch (err: any) {
      console.error('M-Pesa payment error:', err);
      setError(err.message || 'Failed to initiate M-Pesa payment');
      setIsProcessingPayment(false);
    }
  };

  // Poll for M-Pesa payment status
  const startPaymentPolling = (checkoutRequestId: string) => {
    if (paymentPollInterval.current) {
      clearInterval(paymentPollInterval.current);
    }

    paymentPollInterval.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/mpesa/query-status?checkoutRequestId=${checkoutRequestId}`);
        const data = await response.json();

        if (data.success && data.data?.resultCode === 0) {
          if (paymentPollInterval.current) {
            clearInterval(paymentPollInterval.current);
            paymentPollInterval.current = null;
          }
          setPaymentConfirmed(true);
          setSuccess(true);
          setIsProcessingPayment(false);
          
          setTimeout(() => {
            setShowCheckout(false);
            setCart([]);
            setCheckoutStep('info');
            setPaymentData(null);
            setPaymentConfirmed(false);
          }, 2000);
        } else if (data.data?.resultCode && data.data.resultCode !== 1032) {
          if (paymentPollInterval.current) {
            clearInterval(paymentPollInterval.current);
            paymentPollInterval.current = null;
          }
          setError(data.data.resultDesc || 'Payment failed');
          setIsProcessingPayment(false);
        }
      } catch (err) {
        console.error('Error polling payment status:', err);
      }
    }, 3000);

    setTimeout(() => {
      if (paymentPollInterval.current) {
        clearInterval(paymentPollInterval.current);
        paymentPollInterval.current = null;
      }
      if (!paymentConfirmed) {
        setError('Payment timeout. Please try again.');
        setIsProcessingPayment(false);
      }
    }, 120000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header 
        className="relative bg-[#FF7D05] text-white py-16 px-4 overflow-hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/images/shopplace.JPG)'
            }}
          >
            {/* Overlay for better text readability */}
            <div className="w-full h-full bg-gradient-to-br from-[#FF7D05]/80 via-[#FF7D05]/60 to-[#042C45]/40"></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto">
          <Link 
            href="/get-involved"
            className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-8 font-league-spartan"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Get Involved
          </Link>
          
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6 font-fredoka drop-shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Your New Favorite Feminist Everything
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-league-spartan drop-shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Show your support with our feminist merchandise. Wear your values proudly.
            </motion.p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-20 right-1/3 w-8 h-8 bg-white/10 rounded-full"></div>
        </div>
      </motion.header>

      {/* Search and Filter Bar */}
      <motion.section 
        className="py-8 px-4 bg-gray-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042C45] focus:border-transparent font-league-spartan"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-league-spartan transition-colors ${
                    selectedCategory === category
                      ? 'bg-[#042C45] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category === 'all' ? 'All Products' : category}
                </button>
              ))}
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative px-4 py-3 bg-[#042C45] text-white rounded-lg hover:bg-[#042C45]/90 transition-colors font-league-spartan flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Cart ({cart.length})
            </button>
          </div>
        </div>
      </motion.section>

      {/* Products Grid */}
      <motion.section 
        className="py-12 px-4"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <div className="max-w-6xl mx-auto">
          {isLoadingProducts ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2 font-fredoka">
                Loading products...
              </h3>
              <p className="text-gray-500 font-league-spartan">
                Please wait while we fetch the latest products.
              </p>
            </div>
          ) : productsError ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2 font-fredoka">
                Error loading products
              </h3>
              <p className="text-gray-500 font-league-spartan">
                {productsError}. Please try again later.
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2 font-fredoka">
                No products found
              </h3>
              <p className="text-gray-500 font-league-spartan">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  {/* Product Image */}
                  <div className="relative">
                    <div 
                      className="w-full h-64 bg-cover bg-center bg-no-repeat"
                      style={{
                        backgroundImage: product.images && product.images.length > 0 ? `url(${product.images[0]})` : 'url(/images/shopplace.JPG)'
                      }}
                    >
                      <div className="w-full h-full bg-black/20 flex items-center justify-center">
                        <div className="text-center text-white">
                          <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-80" />
                          <p className="text-sm font-league-spartan opacity-80">{product.name}</p>
                        </div>
                      </div>
                    </div>
                    {product.originalPrice && (
                      <div className="absolute top-2 left-2 bg-[#FF7D05] text-white px-2 py-1 rounded text-sm font-league-spartan font-semibold">
                        Sale
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-[#042C45] font-fredoka">
                        {product.name}
                      </h3>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm text-gray-600 font-league-spartan">
                          {product.rating} ({product.reviews})
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 font-league-spartan">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-[#042C45] font-fredoka">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-lg text-gray-500 line-through font-league-spartan">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                      <span className={`text-sm px-2 py-1 rounded font-league-spartan ${
                        product.stockQuantity && product.stockQuantity > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stockQuantity && product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Product Options */}
                    {product.sizes && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2 font-league-spartan">Size:</p>
                        <div className="flex gap-2 flex-wrap">
                          {product.sizes.map((size) => (
                            <button
                              key={size}
                              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 font-league-spartan"
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.colors && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2 font-league-spartan">Color:</p>
                        <div className="flex gap-2">
                          {product.colors.map((color) => (
                            <button
                              key={color}
                              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 font-league-spartan"
                            >
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => addToCart(product)}
                      disabled={!product.stockQuantity || product.stockQuantity <= 0}
                      className="w-full py-3 bg-[#042C45] text-white rounded-lg hover:bg-[#042C45]/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-league-spartan font-semibold"
                    >
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* Shopping Cart Sidebar */}
      {showCart && (
          <motion.div
          className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50"
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#042C45] font-fredoka">
                  Shopping Cart ({cart.length})
                </h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8 flex-1 flex flex-col justify-center">
                  <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-league-spartan mb-6">Your cart is empty</p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="px-6 py-3 bg-[#042C45] text-white rounded-lg hover:bg-[#042C45]/90 transition-colors font-league-spartan font-semibold"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  {/* Scrollable cart items */}
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                    {cart.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                        <div 
                          className="w-12 h-12 bg-cover bg-center bg-no-repeat rounded flex-shrink-0"
                          style={{
                            backgroundImage: item.images && item.images.length > 0 ? `url(${item.images[0]})` : 'url(/images/shopplace.JPG)'
                          }}
                        >
                          <div className="w-full h-full bg-black/30 rounded flex items-center justify-center">
                            <ShoppingBag className="w-3 h-3 text-white opacity-80" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[#042C45] font-fredoka text-sm truncate">{item.name}</h4>
                          <p className="text-xs text-gray-600 font-league-spartan">{formatPrice(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-league-spartan text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Fixed bottom section */}
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-[#042C45] font-fredoka">Total:</span>
                      <span className="text-lg font-bold text-[#042C45] font-fredoka">
                        {formatPrice(getTotalPrice())}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <button 
                        onClick={handleCheckout}
                        className="w-full py-3 bg-[#042C45] text-white rounded-lg hover:bg-[#042C45]/90 transition-colors font-league-spartan font-semibold"
                      >
                        Checkout
                      </button>
                      <button
                        onClick={() => setShowCart(false)}
                        className="w-full py-2 border border-[#042C45] text-[#042C45] rounded-lg hover:bg-[#042C45] hover:text-white transition-colors font-league-spartan"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
      )}

      {/* Features Section */}
      <motion.section 
        className="py-16 px-4 bg-gray-50"
        initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.0 }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#042C45] text-center mb-12 font-fredoka">
            Why Shop With Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Heart className="w-8 h-8" />,
                title: "Ethically Made",
                description: "All products are ethically sourced and made with sustainable materials"
              },
              {
                icon: <ShoppingBag className="w-8 h-8" />,
                title: "Feminist Design",
                description: "Unique designs that celebrate feminist values and African heritage"
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: "Support the Movement",
                description: "Proceeds directly support our gender justice initiatives"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="text-center p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.2 }}
              >
                <div className="text-[#042C45] mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#042C45] mb-3 font-fredoka">
                  {feature.title}
                </h3>
                <p className="text-gray-600 font-league-spartan">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => !paymentConfirmed && setShowCheckout(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#042C45] font-fredoka">
                    Checkout
                  </h2>
                  <button
                    onClick={() => {
                      setShowCheckout(false);
                      setCheckoutStep('info');
                      setPaymentData(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {checkoutStep === 'info' && (
                    <motion.div
                      key="info"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              value={checkoutForm.name}
                              onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD935] focus:border-transparent transition-colors font-league-spartan"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
                              Email *
                            </label>
                            <input
                              type="email"
                              value={checkoutForm.email}
                              onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD935] focus:border-transparent transition-colors font-league-spartan"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            value={checkoutForm.phone}
                            onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD935] focus:border-transparent transition-colors font-league-spartan"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            value={checkoutForm.address}
                            onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                            required
                            minLength={5}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD935] focus:border-transparent transition-colors font-league-spartan"
                            placeholder="Enter your street address"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
                              City *
                            </label>
                            <input
                              type="text"
                              value={checkoutForm.city}
                              onChange={(e) => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                              required
                              minLength={2}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD935] focus:border-transparent transition-colors font-league-spartan"
                              placeholder="Enter your city"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
                              Postal Code *
                            </label>
                            <input
                              type="text"
                              value={checkoutForm.postalCode}
                              onChange={(e) => setCheckoutForm({ ...checkoutForm, postalCode: e.target.value })}
                              required
                              minLength={3}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD935] focus:border-transparent transition-colors font-league-spartan"
                              placeholder="Enter postal code"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
                            Payment Method *
                          </label>
                          <select
                            value={checkoutForm.paymentMethod}
                            onChange={(e) => setCheckoutForm({ ...checkoutForm, paymentMethod: e.target.value as 'stripe' | 'mpesa' })}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD935] focus:border-transparent transition-colors font-league-spartan"
                          >
                            <option value="stripe">Credit/Debit Card (Stripe)</option>
                            <option value="mpesa">M-Pesa</option>
                          </select>
                        </div>

                        <div className="bg-gradient-to-r from-[#FFD935] to-[#FFD935]/80 rounded-xl p-4 border-2 border-[#042C45]/20">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-[#042C45] font-fredoka">Total:</span>
                            <span className="text-2xl font-bold text-[#042C45] font-fredoka">
                              {formatPrice(getTotalPrice())}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            id="acceptTerms"
                            checked={checkoutForm.acceptTerms}
                            onChange={(e) => setCheckoutForm({ ...checkoutForm, acceptTerms: e.target.checked })}
                            required
                            className="mt-1 h-4 w-4 text-[#FFD935] focus:ring-[#FFD935] border-gray-300 rounded"
                          />
                          <label htmlFor="acceptTerms" className="text-sm text-gray-600 font-league-spartan">
                            I accept the Terms and Conditions and Privacy Policy *
                          </label>
                        </div>

                        {error && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-700 text-sm font-league-spartan">{error}</p>
                          </div>
                        )}

                        <div className="flex gap-4 pt-4">
                          <button
                            type="button"
                            onClick={() => setShowCheckout(false)}
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-league-spartan disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting || !checkoutForm.acceptTerms}
                            className="flex-1 px-6 py-3 bg-[#042C45] text-white rounded-lg hover:bg-[#042C45]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-league-spartan"
                          >
                            {isSubmitting ? 'Processing...' : 'Continue to Payment'}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {checkoutStep === 'payment' && paymentData && (
                    <motion.div
                      key="payment"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="space-y-6">
                        <div className="flex items-center justify-between mb-6">
                          <button
                            onClick={() => setCheckoutStep('info')}
                            className="text-[#042C45] hover:text-[#042C45]/80 font-league-spartan flex items-center gap-2"
                          >
                            ← Back
                          </button>
                          <div className="text-sm text-gray-600 font-league-spartan">
                            Step 2 of 2
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-[#FFD935] to-[#FFD935]/80 rounded-xl p-6 border-2 border-[#042C45]/20">
                          <div className="text-center">
                            <h3 className="text-xl font-bold text-[#042C45] mb-2 font-fredoka">
                              Payment Amount
                            </h3>
                            <div className="text-3xl font-bold text-[#042C45] font-fredoka">
                              {formatPrice(paymentData.amount)}
                            </div>
                          </div>
                        </div>

                        {checkoutForm.paymentMethod === 'stripe' && paymentData.clientSecret && stripePromise && (
                          <Elements stripe={stripePromise} options={{
                            clientSecret: paymentData.clientSecret,
                            appearance: { theme: 'stripe' },
                          }}>
                            <CardPaymentForm
                              clientSecret={paymentData.clientSecret}
                              onPaymentSuccess={handleStripePaymentSuccess}
                              onPaymentError={(err) => setError(err)}
                              amount={paymentData.amount}
                            />
                          </Elements>
                        )}
                        
                        {checkoutForm.paymentMethod === 'stripe' && !stripePromise && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-yellow-700 text-sm font-league-spartan">
                              Stripe is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment variables.
                            </p>
                          </div>
                        )}

                        {checkoutForm.paymentMethod === 'mpesa' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
                                M-Pesa Phone Number *
                              </label>
                              <input
                                type="tel"
                                value={mpesaPhone}
                                onChange={(e) => setMpesaPhone(e.target.value)}
                                required
                                placeholder="254712345678"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD935] focus:border-transparent transition-colors font-league-spartan"
                              />
                              <p className="text-xs text-gray-500 mt-1 font-league-spartan">
                                Format: 254712345678 (include country code)
                              </p>
                            </div>

                            <button
                              onClick={handleMpesaPayment}
                              disabled={!mpesaPhone || isProcessingPayment || paymentConfirmed}
                              className="w-full px-6 py-3 bg-[#66623C] text-white rounded-lg hover:bg-[#66623C]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-league-spartan"
                            >
                              {isProcessingPayment 
                                ? 'Processing STK Push...' 
                                : paymentConfirmed 
                                ? 'Payment Confirmed!' 
                                : 'Send M-Pesa STK Push'}
                            </button>

                            {isProcessingPayment && !paymentConfirmed && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-blue-700 text-sm font-league-spartan">
                                  Please check your phone and complete the M-Pesa payment. We're waiting for confirmation...
                                </p>
                              </div>
                            )}

                            {error && error.includes('not configured') && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-yellow-800 text-sm font-league-spartan font-semibold mb-2">
                                  M-Pesa Configuration Required
                                </p>
                                <p className="text-yellow-700 text-sm font-league-spartan">
                                  {error}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {error && !error.includes('not configured') && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-700 text-sm font-league-spartan">{error}</p>
                          </div>
                        )}

                        {paymentConfirmed && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-700 text-sm font-league-spartan">
                              ✅ Payment confirmed! Your order is being processed. You'll receive a confirmation email shortly.
                            </p>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            setShowCheckout(false);
                            setCheckoutStep('info');
                            setPaymentData(null);
                          }}
                          className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-league-spartan"
                        >
                          {paymentConfirmed ? 'Close' : 'Cancel'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
