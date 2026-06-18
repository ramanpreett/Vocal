import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mediaType: { type: String, enum: ['image', 'video', 'pdf', 'carousel', 'tool'], required: true },
  mediaUrl: { type: String }, // Optional for carousels
  mediaUrls: [{ type: String }], // Used for carousel posts
  thumbnailUrl: { type: String, default: null },
  caption: { type: String, default: '' },
  toolName: { type: String },
  toolPurpose: { type: String },
  toolLink: { type: String },
  skill: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

export default mongoose.model('Post', postSchema);
