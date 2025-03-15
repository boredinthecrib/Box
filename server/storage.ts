import { User, InsertUser, Review, InsertReview } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getReview(userId: number, movieId: number): Promise<Review | undefined>;
  createReview(userId: number, review: InsertReview): Promise<Review>;
  updateReview(id: number, review: Partial<InsertReview>): Promise<Review>;
  getUserReviews(userId: number): Promise<Review[]>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private reviews: Map<number, Review>;
  private currentUserId: number;
  private currentReviewId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.reviews = new Map();
    this.currentUserId = 1;
    this.currentReviewId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getReview(userId: number, movieId: number): Promise<Review | undefined> {
    return Array.from(this.reviews.values()).find(
      (review) => review.userId === userId && review.movieId === movieId,
    );
  }

  async createReview(userId: number, insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const review = {
      ...insertReview,
      id,
      userId,
      createdAt: new Date(),
    };
    this.reviews.set(id, review);
    return review;
  }

  async updateReview(
    id: number,
    reviewUpdate: Partial<InsertReview>,
  ): Promise<Review> {
    const existingReview = this.reviews.get(id);
    if (!existingReview) {
      throw new Error("Review not found");
    }
    const updatedReview = { ...existingReview, ...reviewUpdate };
    this.reviews.set(id, updatedReview);
    return updatedReview;
  }

  async getUserReviews(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.userId === userId,
    );
  }
}

export const storage = new MemStorage();
