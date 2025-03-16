import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TMDBMovie } from "@/types/tmdb";
import type { Review } from "@shared/schema";
import { ArrowLeft } from "lucide-react";

export default function MovieDetails() {
  const [, params] = useRoute("/movie/:id");
  const { toast } = useToast();
  const [comment, setComment] = useState("");

  const { data: movie, isLoading: movieLoading } = useQuery<TMDBMovie>({
    queryKey: [`/api/movies/${params?.id}`],
  });

  const { data: review } = useQuery<Review>({
    queryKey: [`/api/reviews/movie/${params?.id}`],
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      rating,
      comment,
    }: {
      rating: number;
      comment: string;
    }) => {
      await apiRequest("POST", "/api/reviews", {
        movieId: parseInt(params?.id!),
        rating,
        comment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/reviews/movie/${params?.id}`],
      });
      toast({
        title: "Review submitted",
        description: "Your review has been saved successfully.",
      });
    },
  });

  if (movieLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    );
  }

  if (!movie) return null;

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {backdropUrl && (
        <div
          className="h-[400px] bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        >
          <div className="h-full bg-black/50 flex items-end">
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-4xl font-bold text-white mb-2">{movie.title}</h1>
              <p className="text-white/80">{movie.release_date.split("-")[0]}</p>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-lg mb-8">{movie.overview}</p>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Your Review</h2>
            <div className="space-y-4">
              <StarRating
                value={review?.rating}
                onChange={(rating) =>
                  reviewMutation.mutate({ rating, comment: comment || "" })
                }
              />
              <Textarea
                placeholder="Write your review..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button
                onClick={() =>
                  reviewMutation.mutate({
                    rating: review?.rating || 0,
                    comment,
                  })
                }
                disabled={reviewMutation.isPending}
              >
                {reviewMutation.isPending ? "Saving..." : "Save Review"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}