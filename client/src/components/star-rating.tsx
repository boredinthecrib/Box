import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
}

export function StarRating({
  value = 0,
  onChange,
  readonly = false,
}: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange?.(rating)}
          disabled={readonly}
          className={cn(
            "text-yellow-400 hover:scale-110 transition-transform",
            readonly && "cursor-default",
          )}
        >
          <Star
            className={cn(
              "w-5 h-5",
              rating <= value ? "fill-current" : "fill-none",
            )}
          />
        </button>
      ))}
    </div>
  );
}
