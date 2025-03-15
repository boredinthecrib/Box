import mongoose from 'mongoose';
import { log } from './vite';

const MONGODB_URI = "mongodb+srv://lemaerick6:mynewMongodbpwd2323@cluster1.lq7vc.mongodb.net/?retryWrites=true&w=majority&appName=cluster1";

export async function connectDB() {
  try {
    log('Connecting to MongoDB...', 'mongodb');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    log('Connected to MongoDB successfully', 'mongodb');
  } catch (error) {
    log('MongoDB connection error: ' + error, 'mongodb');
    throw error; // Re-throw to handle in index.ts
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Add toObject configuration to the schema
userSchema.set('toObject', {
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

// Review Schema
const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movieId: { type: Number, required: true },
  rating: { type: Number, required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Add toObject configuration to the schema
reviewSchema.set('toObject', {
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

export const User = mongoose.model('User', userSchema);
export const Review = mongoose.model('Review', reviewSchema);