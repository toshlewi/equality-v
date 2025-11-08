import { Schema, model, models } from 'mongoose';

const OrderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  // Customer information
  customerInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    company: String,
    // Billing address
    billingAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    },
    // Shipping address (can be different from billing)
    shippingAddress: {
      firstName: String,
      lastName: String,
      company: String,
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
      phone: String
    }
  },
  // Order items
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    sku: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: String,
    variantId: String, // For product variants
    variantName: String, // Human-readable variant name
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: { type: String, default: 'cm' }
    }
  }],
  // Pricing breakdown
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  couponCode: String,
  couponDiscount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  // Order status
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending' 
  },
  // Payment information
  paymentMethod: { 
    type: String, 
    enum: ['stripe', 'mpesa', 'bank_transfer', 'paypal', 'cash_on_delivery'],
    required: true 
  },
  paymentId: String,
  transactionId: String,
  paymentIntentId: String, // For Stripe
  checkoutSessionId: String, // For Stripe Checkout
  // Shipping information
  shippingMethod: String,
  shippingCost: { type: Number, default: 0 },
  trackingNumber: String,
  trackingUrl: String,
  carrier: String,
  estimatedDelivery: Date,
  // Order notes and special instructions
  notes: String,
  specialInstructions: String,
  // Staff information
  processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  processedAt: Date,
  shippedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  shippedAt: Date,
  deliveredAt: Date,
  // Refund information
  refunds: [{
    amount: { type: Number, required: true },
    reason: String,
    status: { 
      type: String, 
      enum: ['pending', 'processed', 'failed'],
      default: 'pending' 
    },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    processedAt: Date,
    refundId: String, // External refund ID
    notes: String
  }],
  // Analytics and tracking
  source: String, // How the order was created
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  utmTerm: String,
  utmContent: String,
  // Customer communication
  emailsSent: [{
    type: { 
      type: String, 
      enum: ['confirmation', 'shipped', 'delivered', 'cancelled', 'refunded'] 
    },
    sentAt: { type: Date, default: Date.now },
    emailId: String
  }],
  // Flags
  isGift: { type: Boolean, default: false },
  giftMessage: String,
  isRush: { type: Boolean, default: false },
  requiresSignature: { type: Boolean, default: false },
  // Metadata
  cartId: { type: Schema.Types.ObjectId, ref: 'Cart' },
  customerId: { type: Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: true,
  indexes: [
    { orderNumber: 1 },
    { 'customerInfo.email': 1 },
    { status: 1 },
    { paymentStatus: 1 },
    { createdAt: -1 },
    { 'customerInfo.billingAddress.country': 1 },
    { paymentMethod: 1 },
    { trackingNumber: 1 }
  ]
});

// Virtual for customer full name
OrderSchema.virtual('customerFullName').get(function() {
  if (!this.customerInfo) return '';
  return `${this.customerInfo.firstName || ''} ${this.customerInfo.lastName || ''}`.trim();
});

// Virtual for formatted total
OrderSchema.virtual('formattedTotal').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.total);
});

// Virtual for item count
OrderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for total refunded amount
OrderSchema.virtual('totalRefunded').get(function() {
  return this.refunds
    .filter(refund => refund.status === 'processed')
    .reduce((total, refund) => total + refund.amount, 0);
});

// Virtual for order age in days
OrderSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to generate order number
OrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const OrderModel = this.constructor as typeof import('./Order').default;
    const count = await OrderModel.countDocuments();
    this.orderNumber = `EV-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Method to add refund
OrderSchema.methods.addRefund = function(amount: number, reason: string, processedBy: string, refundId: string) {
  this.refunds.push({
    amount,
    reason,
    processedBy,
    refundId,
    processedAt: new Date(),
    status: 'processed'
  });
  
  // Update payment status if fully refunded
  const totalRefunded = this.totalRefunded + amount;
  if (totalRefunded >= this.total) {
    this.paymentStatus = 'refunded';
  } else if (totalRefunded > 0) {
    this.paymentStatus = 'partially_refunded';
  }
  
  return this.save();
};

// Method to update status
OrderSchema.methods.updateStatus = function(newStatus: string, updatedBy: string) {
  this.status = newStatus;
  
  if (newStatus === 'confirmed' && !this.processedAt) {
    this.processedAt = new Date();
    this.processedBy = updatedBy;
  } else if (newStatus === 'shipped' && !this.shippedAt) {
    this.shippedAt = new Date();
    this.shippedBy = updatedBy;
  } else if (newStatus === 'delivered' && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }
  
  return this.save();
};

// Static method to get order statistics
OrderSchema.statics.getStats = function(startDate?: Date, endDate?: Date) {
  const match: { createdAt?: { $gte: Date; $lte: Date } } = {};
  if (startDate && endDate) {
    match.createdAt = { $gte: startDate, $lte: endDate };
  }
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
        statusBreakdown: {
          $push: {
            status: '$status',
            total: '$total'
          }
        }
      }
    }
  ]);
};

export default models.Order || model('Order', OrderSchema);