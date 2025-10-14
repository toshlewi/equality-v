import { Schema, model, models } from 'mongoose';

// Order model for shop/e-commerce order management
// Handles order processing, payment tracking, and fulfillment
const OrderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  // Customer information
  customer: {
    name: { type: String, required: true, maxlength: 100 },
    email: { type: String, required: true, maxlength: 255 },
    phone: { type: String, maxlength: 20 }
  },
  // Shipping address
  shippingAddress: {
    name: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
    phone: { type: String }
  },
  // Billing address (can be same as shipping)
  billingAddress: {
    name: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
    phone: { type: String }
  },
  // Order items
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    productSku: { type: String },
    variant: { type: String }, // Selected variant options
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true }
  }],
  // Pricing breakdown
  subtotal: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  shippingAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  // Discount information
  discountCode: { type: String },
  discountType: { type: String, enum: ['percentage', 'fixed', 'free_shipping'] },
  discountValue: { type: Number },
  // Payment information
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  paymentProvider: { type: String, enum: ['stripe', 'mpesa', 'bank_transfer', 'cash_on_delivery'] },
  paymentId: { type: String }, // Stripe payment intent ID or M-Pesa transaction ID
  paymentMethod: { type: String },
  paidAt: { type: Date },
  // Order status
  status: { 
    type: String, 
    enum: ['created', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'created'
  },
  // Fulfillment
  fulfillmentStatus: { 
    type: String, 
    enum: ['unfulfilled', 'partial', 'fulfilled', 'shipped', 'delivered'],
    default: 'unfulfilled'
  },
  // Shipping information
  shippingMethod: { type: String },
  trackingNumber: { type: String },
  trackingUrl: { type: String },
  shippedAt: { type: Date },
  deliveredAt: { type: Date },
  // Customer communication
  confirmationSent: { type: Boolean, default: false },
  confirmationSentAt: { type: Date },
  shippingNotificationSent: { type: Boolean, default: false },
  shippingNotificationSentAt: { type: Date },
  deliveryNotificationSent: { type: Boolean, default: false },
  deliveryNotificationSentAt: { type: Date },
  // Notes and special instructions
  notes: { type: String, maxlength: 1000 },
  customerNotes: { type: String, maxlength: 1000 },
  internalNotes: { type: String, maxlength: 1000 },
  // Refund information
  refundRequested: { type: Boolean, default: false },
  refundRequestedAt: { type: Date },
  refundAmount: { type: Number },
  refundReason: { type: String },
  refundProcessedAt: { type: Date },
  refundProcessedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  // Member association
  memberId: { type: Schema.Types.ObjectId, ref: 'Member' },
  isMember: { type: Boolean, default: false },
  memberDiscount: { type: Number, default: 0 },
  // Order management
  processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  processedAt: { type: Date },
  // Digital products
  digitalProducts: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    downloadUrl: { type: String },
    downloadExpiry: { type: Date },
    downloadCount: { type: Number, default: 0 },
    maxDownloads: { type: Number, default: 5 }
  }]
}, { 
  timestamps: true,
  indexes: [
    { orderNumber: 1 },
    { 'customer.email': 1 },
    { status: 1, createdAt: -1 },
    { paymentStatus: 1 },
    { memberId: 1 },
    { trackingNumber: 1 }
  ]
});

// Pre-save middleware to generate order number
OrderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.orderNumber = `EV-${timestamp}-${random}`;
  }
  next();
});

// Virtual for order status display
OrderSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    created: 'Order Created',
    paid: 'Payment Received',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for payment status display
OrderSchema.virtual('paymentStatusDisplay').get(function() {
  const statusMap = {
    pending: 'Pending Payment',
    paid: 'Paid',
    failed: 'Payment Failed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
    partially_refunded: 'Partially Refunded'
  };
  return statusMap[this.paymentStatus] || this.paymentStatus;
});

// Virtual for total items count
OrderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

export default models.Order || model('Order', OrderSchema);
