import { Schema, model, models } from 'mongoose';

const SettingSchema = new Schema({
  key: { type: String, required: true, unique: true, maxlength: 100 },
  value: { type: Schema.Types.Mixed, required: true },
  type: { 
    type: String, 
    enum: ['string', 'number', 'boolean', 'text', 'email', 'url', 'json', 'array'],
    default: 'string'
  },
  description: { type: String, maxlength: 500 },
  category: { type: String, default: 'general' },
  isPublic: { type: Boolean, default: false },
  isRequired: { type: Boolean, default: false },
  validation: {
    min: Number,
    max: Number,
    pattern: String,
    options: [String]
  },
  // Metadata
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: true,
  indexes: [
    { key: 1 },
    { category: 1 },
    { isPublic: 1 }
  ]
});

// Method to get typed value
SettingSchema.methods.getTypedValue = function() {
  switch (this.type) {
    case 'number':
      return Number(this.value);
    case 'boolean':
      return this.value === 'true' || this.value === true;
    case 'json':
      try {
        return JSON.parse(this.value);
      } catch {
        return this.value;
      }
    case 'array':
      try {
        return JSON.parse(this.value);
      } catch {
        return Array.isArray(this.value) ? this.value : [this.value];
      }
    default:
      return this.value;
  }
};

// Static method to get setting by key
SettingSchema.statics.getSetting = async function(key: string) {
  const setting = await this.findOne({ key });
  return setting ? setting.getTypedValue() : null;
};

// Static method to set setting
SettingSchema.statics.setSetting = async function(key: string, value: any, type = 'string') {
  const setting = await this.findOneAndUpdate(
    { key },
    { 
      value: type === 'json' || type === 'array' ? JSON.stringify(value) : value,
      type,
      updatedAt: new Date()
    },
    { upsert: true, new: true }
  );
  return setting;
};

// Static method to get settings by category
SettingSchema.statics.getSettingsByCategory = async function(category: string) {
  const settings = await this.find({ category });
  const result: any = {};
  settings.forEach((setting: any) => {
    result[setting.key] = setting.getTypedValue();
  });
  return result;
};

export default models.Setting || model('Setting', SettingSchema);
