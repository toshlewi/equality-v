import { Schema, model, models } from 'mongoose';

// Product model for shop/e-commerce management
// Handles merchandise, books, and other products for sale
const ProductSchema = new Schema({
  name: { type: String, required: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true, maxlength: 2000 },
  shortDescription: { type: String, maxlength: 300 },
  // Pricing
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  compareAtPrice: { type: Number }, // Original price for showing discounts
  costPrice: { type: Number }, // Cost to produce/acquire
  // Inventory
  sku: { type: String, unique: true },
  stockQuantity: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  trackInventory: { type: Boolean, default: true },
  allowBackorder: { type: Boolean, default: false },
  // Product details
  category: { 
    type: String, 
    enum: ['merchandise', 'books', 'digital', 'services', 'other'],
    required: true 
  },
  subcategory: { type: String },
  tags: [{ type: String, maxlength: 50 }],
  // Media
  images: [{ 
    url: { type: String, required: true },
    alt: { type: String },
    isPrimary: { type: Boolean, default: false }
  }],
  // Product variants (size, color, etc.)
  variants: [{
    name: { type: String, required: true }, // e.g., "Size", "Color"
    options: [{ 
      value: { type: String, required: true }, // e.g., "Small", "Red"
      sku: { type: String },
      price: { type: Number },
      stockQuantity: { type: Number, default: 0 }
    }]
  }],
  // Physical product details
  weight: { type: Number }, // in grams
  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number }
  },
  // Digital product details
  isDigital: { type: Boolean, default: false },
  digitalFiles: [{ 
    name: { type: String },
    url: { type: String },
    type: { type: String }
  }],
  // Product status
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived', 'out_of_stock'],
    default: 'draft'
  },
  published: { type: Boolean, default: false },
  publishedAt: { type: Date },
  // SEO
  metaTitle: { type: String, maxlength: 60 },
  metaDescription: { type: String, maxlength: 160 },
  // Analytics
  viewCount: { type: Number, default: 0 },
  salesCount: { type: Number, default: 0 },
  // Shipping
  requiresShipping: { type: Boolean, default: true },
  shippingClass: { type: String },
  // Product management
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  // Featured and promotional
  featured: { type: Boolean, default: false },
  onSale: { type: Boolean, default: false },
  salePrice: { type: Number },
  saleStartDate: { type: Date },
  saleEndDate: { type: Date }
}, { 
  timestamps: true,
  indexes: [
    { status: 1, published: 1 },
    { category: 1, subcategory: 1 },
    { tags: 1 },
    { slug: 1 },
    { sku: 1 },
    { featured: 1, status: 1 },
    { onSale: 1, status: 1 }
  ]
});

// Pre-save middleware to generate slug and SKU
ProductSchema.pre('save', function(next) {
  // Generate slug from name
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  
  // Generate SKU if not provided
  if (!this.sku) {
    this.sku = `EV-${this._id.toString().slice(-8).toUpperCase()}`;
  }
  
  next();
});

// Virtual for current price (sale price or regular price)
ProductSchema.virtual('currentPrice').get(function() {
  if (this.onSale && this.salePrice && this.isSaleActive()) {
    return this.salePrice;
  }
  return this.price;
});

// Virtual for discount percentage
ProductSchema.virtual('discountPercentage').get(function() {
  if (this.onSale && this.salePrice && this.isSaleActive()) {
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
  }
  return 0;
});

// Method to check if sale is active
ProductSchema.methods.isSaleActive = function() {
  const now = new Date();
  if (!this.onSale || !this.saleStartDate || !this.saleEndDate) return false;
  return now >= this.saleStartDate && now <= this.saleEndDate;
};

// Virtual for stock status
ProductSchema.virtual('stockStatus').get(function() {
  if (!this.trackInventory) return 'in_stock';
  if (this.stockQuantity <= 0) return 'out_of_stock';
  if (this.stockQuantity <= this.lowStockThreshold) return 'low_stock';
  return 'in_stock';
});

export default models.Product || model('Product', ProductSchema);
