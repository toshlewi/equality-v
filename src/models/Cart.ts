import { Schema, model, models } from 'mongoose';

const CartSchema = new Schema({
  sessionId: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', sparse: true },
  items: [{
    productId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true 
    },
    quantity: { type: Number, required: true, min: 1 },
    variantId: String, // For product variants (size, color, etc.)
    price: { type: Number, required: true },
    name: { type: String, required: true }, // Snapshot of product name
    image: String, // Snapshot of product image
    addedAt: { type: Date, default: Date.now }
  }],
  status: { 
    type: String, 
    enum: ['active', 'abandoned', 'converted', 'expired'], 
    default: 'active' 
  },
  // Pricing
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  // Shipping information
  shippingAddress: {
    firstName: String,
    lastName: String,
    company: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    phone: String
  },
  // Coupon/discount information
  couponCode: String,
  couponDiscount: { type: Number, default: 0 },
  // Expiration
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // 7 days
  // Metadata
  lastActivity: { type: Date, default: Date.now },
  abandonedAt: Date,
  convertedAt: Date,
  // Analytics
  source: String, // How the cart was created (direct, referral, etc.)
  utmSource: String,
  utmMedium: String,
  utmCampaign: String
}, { 
  timestamps: true,
  indexes: [
    { sessionId: 1 },
    { userId: 1 },
    { status: 1 },
    { expiresAt: 1 },
    { lastActivity: 1 },
    { 'items.productId': 1 }
  ]
});

// Virtual for item count
CartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for unique product count
CartSchema.virtual('uniqueProductCount').get(function() {
  return this.items.length;
});

// Virtual for formatted total
CartSchema.virtual('formattedTotal').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.total);
});

// Virtual for formatted subtotal
CartSchema.virtual('formattedSubtotal').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.subtotal);
});

// Virtual for cart age in days
CartSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to calculate totals
CartSchema.pre('save', function(next) {
  // Calculate subtotal
  this.subtotal = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  // Calculate total
  this.total = this.subtotal + this.tax + this.shipping - this.discount - this.couponDiscount;
  
  // Update last activity
  this.lastActivity = new Date();
  
  next();
});

// Method to add item to cart
CartSchema.methods.addItem = function(productId: string, quantity: number, variantId?: string, price?: number, name?: string, image?: string) {
  const existingItem = this.items.find((item: any) => 
    item.productId.toString() === productId.toString() && item.variantId === variantId
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({
      productId,
      quantity,
      variantId,
      price,
      name,
      image,
      addedAt: new Date()
    });
  }
  
  return this.save();
};

// Method to remove item from cart
CartSchema.methods.removeItem = function(productId: string, variantId?: string) {
  this.items = this.items.filter((item: any) => 
    !(item.productId.toString() === productId.toString() && item.variantId === variantId)
  );
  return this.save();
};

// Method to update item quantity
CartSchema.methods.updateItemQuantity = function(productId: string, variantId?: string, quantity?: number) {
  const item = this.items.find((item: any) => 
    item.productId.toString() === productId.toString() && item.variantId === variantId
  );
  
  if (item) {
    if (quantity === undefined || quantity <= 0) {
      return this.removeItem(productId, variantId);
    } else {
      item.quantity = quantity;
      return this.save();
    }
  }
  
  return Promise.resolve(this);
};

// Method to clear cart
CartSchema.methods.clear = function() {
  this.items = [];
  this.subtotal = 0;
  this.tax = 0;
  this.shipping = 0;
  this.discount = 0;
  this.couponDiscount = 0;
  this.total = 0;
  this.couponCode = undefined;
  return this.save();
};

// Method to check if cart is expired
CartSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Static method to clean up expired carts
CartSchema.statics.cleanupExpired = function() {
  return this.updateMany(
    { 
      status: 'active', 
      expiresAt: { $lt: new Date() } 
    },
    { 
      $set: { 
        status: 'expired',
        abandonedAt: new Date()
      } 
    }
  );
};

export default models.Cart || model('Cart', CartSchema);
