import { InsertUser, InsertReview } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { User, Review } from './db';
import { Types } from 'mongoose';

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: string): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  createUser(user: InsertUser): Promise<any>;
  getReview(userId: string, movieId: number): Promise<any>;
  createReview(userId: string, review: InsertReview): Promise<any>;
  updateReview(id: string, review: Partial<InsertReview>): Promise<any>;
  getUserReviews(userId: string): Promise<any[]>;
  sessionStore: session.Store;
}

export class MongoStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: string) {
    return await User.findById(id);
  }

  async getUserByUsername(username: string) {
    return await User.findOne({ username });
  }

  async createUser(insertUser: InsertUser) {
    const user = new User(insertUser);
    return await user.save();
  }

  async getReview(userId: string, movieId: number) {
    return await Review.findOne({ userId: new Types.ObjectId(userId), movieId });
  }

  async createReview(userId: string, insertReview: InsertReview) {
    const review = new Review({
      ...insertReview,
      userId: new Types.ObjectId(userId),
    });
    return await review.save();
  }

  async updateReview(id: string, reviewUpdate: Partial<InsertReview>) {
    return await Review.findByIdAndUpdate(
      id,
      { $set: reviewUpdate },
      { new: true }
    );
  }

  async getUserReviews(userId: string) {
    return await Review.find({ userId: new Types.ObjectId(userId) });
  }
}

export const storage = new MongoStorage();