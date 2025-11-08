import { Schema, model, models } from 'mongoose';

const ProductSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDescription: String,
  price: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  compareAtPrice: Number,
  costPrice: Number,
  sku: { type: String, unique: true, sparse: true },
  barcode: String,
  category: { 
    type: String, 
    enum: ['book', 'merchandise', 'digital', 'service', 'other'],
    required: true 
  },
  subcategory: String,
  tags: [String],
  status: { 
    type: String, 
    enum: ['draft', 'active', 'inactive', 'archived'],
    default: 'draft' 
  },
  isDigital: { type: Boolean, default: false },
  isPhysical: { type: Boolean, default: true },
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: { type: String, default: 'cm' }
  },
  inventory: {
    trackQuantity: { type: Boolean, default: false },
    quantity: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    allowBackorder: { type: Boolean, default: false }
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  files: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  variants: [{
    name: String,
    options: [{
      name: String,
      value: String,
      priceAdjustment: { type: Number, default: 0 }
    }]
  }],
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  isFeatured: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  isOnSale: { type: Boolean, default: false },
  saleStartDate: Date,
  saleEndDate: Date,
  viewCount: { type: Number, default: 0 },
  purchaseCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: true,
  indexes: [
    { slug: 1 },
    { sku: 1 },
    { status: 1 },
    { category: 1 },
    { price: 1 },
    { name: 'text', description: 'text' }
  ]
});

export default models.Product || model('Product', ProductSchema);