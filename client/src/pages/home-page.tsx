import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MovieCard } from "@/components/movie-card";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { LogOut, User } from "lucide-react";
import type { TMDBSearchResponse } from "@/types/tmdb";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const { user, logoutMutation } = useAuth();

  const { data: searchResults, isLoading: searchLoading } = useQuery<TMDBSearchResponse>({
    queryKey: ["/api/movies/search", search],
    queryFn: async () => {
      if (!search) return { page: 1, results: [], total_pages: 0, total_results: 0 };
      const response = await fetch(`/api/movies/search?q=${encodeURIComponent(search)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }
      return response.json();
    },
    enabled: search.length > 0,
  });

  const { data: popularMovies, isLoading: popularLoading } = useQuery<TMDBSearchResponse>({
    queryKey: ["/api/movies/popular"],
    enabled: !search,
  });

  const isLoading = searchLoading || popularLoading;
  const movies = search ? searchResults?.results : popularMovies?.results;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">MovieRater</h1>
          <div className="flex items-center gap-4">
            <Link href="/profile" className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {user?.username}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto mb-8">
          <Input
            type="search"
            placeholder="Search for movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-[400px] bg-muted animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : movies?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
                releaseDate={movie.release_date}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            {search ? "No movies found" : "Failed to load recommendations"}
          </div>
        )}
      </main>
    </div>
  );
}