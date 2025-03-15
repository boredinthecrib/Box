import { useQuery } from "@tanstack/react-query";
import { MovieCard } from "@/components/movie-card";
import { useAuth } from "@/hooks/use-auth";
import type { Review } from "@shared/schema";
import type { TMDBMovie } from "@/types/tmdb";

interface ReviewedMovie extends TMDBMovie {
  rating: number;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: reviews } = useQuery<Review[]>({ queryKey: ["/api/reviews/user"] });

  const { data: reviewedMovies } = useQuery<ReviewedMovie[]>({
    queryKey: ["/api/movies/reviewed", reviews],
    enabled: !!reviews,
    queryFn: async () => {
      const movies = await Promise.all(
        reviews!.map((review) =>
          fetch(`/api/movies/${review.movieId}`).then((res) => res.json()),
        ),
      );
      return movies.map((movie, index) => ({
        ...movie,
        rating: reviews![index].rating,
      }));
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">
            {user?.username}'s Movie Ratings
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {reviewedMovies?.length ? (
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
                  fetch("/api/reviews", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      movieId: movie.id,
                      rating,
                    }),
                  })
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            You haven't rated any movies yet
          </div>
        )}
      </main>
    </div>
  );
}