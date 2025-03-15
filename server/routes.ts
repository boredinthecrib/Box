import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertReviewSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  if (!process.env.TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY environment variable is required");
  }

  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";

  app.get("/api/movies/search", async (req, res) => {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ message: "Query parameter 'q' is required" });
    }

    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        query,
      )}`,
    );
    
    if (!response.ok) {
      return res.status(response.status).json({ message: "TMDB API error" });
    }

    const data = await response.json();
    res.json(data);
  });

  app.get("/api/movies/:id", async (req, res) => {
    const movieId = req.params.id;
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`,
    );

    if (!response.ok) {
      return res.status(response.status).json({ message: "TMDB API error" });
    }

    const data = await response.json();
    res.json(data);
  });

  app.post("/api/reviews", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const reviewData = insertReviewSchema.parse(req.body);
    const existingReview = await storage.getReview(
      req.user!.id,
      reviewData.movieId,
    );

    if (existingReview) {
      const updatedReview = await storage.updateReview(
        existingReview.id,
        reviewData,
      );
      return res.json(updatedReview);
    }

    const review = await storage.createReview(req.user!.id, reviewData);
    res.status(201).json(review);
  });

  app.get("/api/reviews/user", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const reviews = await storage.getUserReviews(req.user!.id);
    res.json(reviews);
  });

  app.get("/api/reviews/movie/:movieId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const review = await storage.getReview(
      req.user!.id,
      parseInt(req.params.movieId),
    );
    res.json(review || null);
  });

  const httpServer = createServer(app);
  return httpServer;
}
