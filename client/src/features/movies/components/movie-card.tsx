"use client";

import Image from "next/image";
import type { Movie } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export function MovieCard({
  movie,
  onOpen,
}: {
  movie: Movie;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="text-left focus-ring rounded-3xl"
      aria-label={`Open details for ${movie.title}`}
    >
      <Card
        className={cn(
          "surface overflow-hidden cursor-pointer group transition-all duration-300",
          "hover:shadow-xl hover:-translate-y-0.5",
        )}
      >
        <div className="relative aspect-[2/3] bg-muted">
          {movie.poster_path ? (
            <Image
              src={`${TMDB_IMAGE_BASE}${movie.poster_path}`}
              alt={movie.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No Poster
            </div>
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <p className="text-white text-sm font-medium line-clamp-3">
              {movie.overview || "No overview available."}
            </p>
          </div>
        </div>

        <CardContent className="p-4 space-y-2">
          <h3
            className="font-semibold leading-tight truncate text-base"
            title={movie.title}
          >
            {movie.title}
          </h3>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="mr-1 h-3 w-3" aria-hidden="true" />
              {movie.release_date || "Unknown"}
            </div>
            <div className="flex items-center">
              <Star
                className="mr-1 h-3 w-3 fill-current text-amber-500"
                aria-hidden="true"
              />
              <span className="text-foreground/90">
                {movie.vote_average.toFixed(1)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
