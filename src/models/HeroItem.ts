import { Schema, model, models } from 'mongoose';

const HeroItemSchema = new Schema({
  title: { type: String, required: true, maxlength: 200 },
  text: { type: String, maxlength: 500 },
  backgroundImage: { type: String, required: true },
  type: { type: String, enum: ['video', 'image', 'audio', 'story'], default: 'image' },
  duration: { type: Number },
  author: { type: String },
  views: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  visible: { type: Boolean, default: true },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const HeroItem = models.HeroItem || model('HeroItem', HeroItemSchema);
export default HeroItem;


