import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for Google OAuth users
  profilePhoto: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [{ type: String }],
  location: { type: String, default: '' },
  institution: { type: String, default: '' },
  experience: { type: String, default: '' },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  googleId: { type: String }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
