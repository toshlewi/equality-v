import { Schema, model, models } from 'mongoose';

const VideoResourceSchema = new Schema({
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, maxlength: 2000 },
  thumbnail: { type: String },
  videoUrl: { type: String, required: true },
  duration: { type: Number },
  author: { type: String },
  views: { type: Number, default: 0 },
  tags: [{ type: String, maxlength: 50 }],
  publishedAt: { type: Date },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  visible: { type: Boolean, default: true }
}, { timestamps: true });

const VideoResource = models.VideoResource || model('VideoResource', VideoResourceSchema);
export default VideoResource;


