import { Schema, model, models } from 'mongoose';

const AudioPodcastSchema = new Schema({
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, maxlength: 2000 },
  audioUrl: { type: String, required: true },
  thumbnail: { type: String },
  duration: { type: Number },
  author: { type: String },
  publishedAt: { type: Date },
  category: { type: String },
  episode: { type: Number },
  season: { type: Number },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  visible: { type: Boolean, default: true }
}, { timestamps: true });

const AudioPodcast = models.AudioPodcast || model('AudioPodcast', AudioPodcastSchema);
export default AudioPodcast;


