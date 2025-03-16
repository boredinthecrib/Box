import { useQuery, useMutation } from "@tanstack/react-query";
import { MovieCard } from "@/components/movie-card";
import { useAuth } from "@/hooks/use-auth";
import type { Review } from "@shared/schema";
import type { TMDBMovie } from "@/types/tmdb";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Star } from "lucide-react";

interface ReviewedMovie extends TMDBMovie {
  rating: number;
  reviewId: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({ 
    queryKey: ["/api/reviews/user"] 
  });

  const { data: reviewedMovies, isLoading: moviesLoading } = useQuery<ReviewedMovie[]>({
    queryKey: ["/api/movies/reviewed", reviews],
    enabled: !!reviews && reviews.length > 0,
    queryFn: async () => {
      try {
        const movies = await Promise.all(
          reviews!.map(async (review) => {
            const response = await fetch(`/api/movies/${review.movieId}`);
            if (!response.ok) throw new Error('Failed to fetch movie details');
            const movie = await response.json();
            return {
              ...movie,
              rating: review.rating,
              reviewId: review._id,
            };
          }),
        );
        return movies;
      } catch (error) {
        console.error('Error fetching reviewed movies:', error);
        throw error;
      }
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: async ({ movieId, rating }: { movieId: number; rating: number }) => {
      await apiRequest("POST", "/api/reviews", { movieId, rating });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/user"] });
      toast({
        title: "Rating updated",
        description: "Your movie rating has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update rating",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isLoading = reviewsLoading || moviesLoading;

  // Calculate average rating
  const averageRating = reviews?.length 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">
            {user?.username}'s Movie Ratings
          </h1>
          {averageRating && (
            <div className="mt-4 flex items-center gap-2">
              <Star className="w-6 h-6 fill-current" />
              <span className="text-xl">
                Average Rating: {averageRating} / 5
                <span className="text-sm ml-2">({reviews?.length} movies rated)</span>
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reviewedMovies?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {reviewedMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
                releaseDate={movie.release_date}
                rating={movie.rating}
                onRate={(rating) =>
                  updateReviewMutation.mutate({ movieId: movie.id, rating })
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            You haven't rated any movies yet. Search for movies to start rating them!
          </div>
        )}
      </main>
    </div>
  );
}