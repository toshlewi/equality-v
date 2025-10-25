import mongoose, { Schema, model, models } from 'mongoose';

const OrderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    }
  },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: String
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  total: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['stripe', 'mpesa', 'bank_transfer', 'paypal'],
    required: true 
  },
  paymentId: String,
  transactionId: String,
  shippingMethod: String,
  trackingNumber: String,
  notes: String,
  processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  processedAt: Date,
  shippedAt: Date,
  deliveredAt: Date
}, { 
  timestamps: true,
  indexes: [
    { orderNumber: 1 },
    { 'customerInfo.email': 1 },
    { status: 1 },
    { createdAt: -1 }
  ]
});

export default models.Order || model('Order', OrderSchema);