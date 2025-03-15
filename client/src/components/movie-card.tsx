import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StarRating } from "./star-rating";
import { Link } from "wouter";

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  releaseDate: string;
  rating?: number;
  onRate?: (rating: number) => void;
}

export function MovieCard({
  id,
  title,
  posterPath,
  releaseDate,
  rating,
  onRate,
}: MovieCardProps) {
  const year = new Date(releaseDate).getFullYear();
  const imageUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : "https://placehold.co/500x750?text=No+Poster";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/movie/${id}`}>
        <CardHeader className="p-0">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-[300px] object-cover"
          />
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg line-clamp-1">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{year}</p>
        </CardContent>
      </Link>
      {onRate && (
        <CardFooter className="p-4 pt-0">
          <StarRating value={rating} onChange={onRate} />
        </CardFooter>
      )}
    </Card>
  );
}
