'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ShoppingBag, Heart, Star, Plus, Minus, Filter, Search, ShoppingCart } from 'lucide-react';

// Mock product data - in a real app, this would come from an API
const products = [
  {
    id: 1,
    name: "Feminist Power T-Shirt",
    price: 2599,
    originalPrice: 3599,
    image: "/api/placeholder/300/300",
    category: "apparel",
    rating: 4.8,
    reviews: 24,
    description: "Bold statement tee celebrating feminist power and solidarity",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Black", "White", "Navy"],
    inStock: true
  },
  {
    id: 2,
    name: "Equality Vanguard Mug",
    price: 1899,
    image: "/api/placeholder/300/300",
    category: "accessories",
    rating: 4.9,
    reviews: 18,
    description: "Start your day with feminist inspiration",
    inStock: true
  },
  {
    id: 3,
    name: "Pan-African Feminist Tote",
    price: 2299,
    image: "/api/placeholder/300/300",
    category: "accessories",
    rating: 4.7,
    reviews: 31,
    description: "Eco-friendly canvas tote for your daily adventures",
    colors: ["Black", "Natural", "Navy"],
    inStock: true
  },
  {
    id: 4,
    name: "Gender Justice Hoodie",
    price: 4599,
    originalPrice: 5599,
    image: "/api/placeholder/300/300",
    category: "apparel",
    rating: 4.9,
    reviews: 12,
    description: "Comfortable hoodie with powerful message",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Navy", "Forest Green"],
    inStock: true
  },
  {
    id: 5,
    name: "Feminist Book Collection",
    price: 8999,
    image: "/api/placeholder/300/300",
    category: "books",
    rating: 5.0,
    reviews: 8,
    description: "Curated collection of feminist literature",
    inStock: true
  },
  {
    id: 6,
    name: "Equality Vanguard Sticker Pack",
    price: 1299,
    image: "/api/placeholder/300/300",
    category: "accessories",
    rating: 4.6,
    reviews: 45,
    description: "Set of 10 feminist stickers for your laptop, water bottle, or anywhere",
    inStock: true
  }
];

const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'apparel', name: 'Apparel' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'books', name: 'Books' }
];

export default function BuyMerchPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product) => {
    setCart(prev => [...prev, { ...product, quantity: 1 }]);
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
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-league-spartan transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-[#042C45] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
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
                      backgroundImage: 'url(/images/shopplace.JPG)'
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
                      product.inStock 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
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
                    disabled={!product.inStock}
                    className="w-full py-3 bg-[#042C45] text-white rounded-lg hover:bg-[#042C45]/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-league-spartan font-semibold"
                  >
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2 font-fredoka">
                No products found
              </h3>
              <p className="text-gray-500 font-league-spartan">
                Try adjusting your search or filter criteria
              </p>
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
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                        <div 
                          className="w-12 h-12 bg-cover bg-center bg-no-repeat rounded flex-shrink-0"
                          style={{
                            backgroundImage: 'url(/images/shopplace.JPG)'
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
                      <button className="w-full py-3 bg-[#042C45] text-white rounded-lg hover:bg-[#042C45]/90 transition-colors font-league-spartan font-semibold">
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
    </div>
  );
}
