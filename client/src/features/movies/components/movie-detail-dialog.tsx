"use client";

import Image from "next/image";
import type { Movie } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Info, Star } from "lucide-react";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export function MovieDetailDialog({
  open,
  onOpenChange,
  loading,
  movie,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  loading: boolean;
  movie: Movie | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] p-0 overflow-hidden surface">
        {loading ? (
          <div className="h-[420px] flex items-center justify-center">
            <Loader2
              className="h-8 w-8 animate-spin text-primary"
              aria-hidden="true"
            />
          </div>
        ) : movie ? (
          <div className="flex flex-col md:flex-row max-h-[80vh]">
            <div className="relative md:w-2/5 min-h-[320px] md:min-h-full bg-muted">
              {movie.poster_path && (
                <Image
                  src={`${TMDB_IMAGE_BASE}${movie.poster_path}`}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display">
                  {movie.title}
                </DialogTitle>
                <DialogDescription>
                  Released: {movie.release_date}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 flex gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                  {movie.vote_average.toFixed(1)}
                </Badge>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-lg font-mono">
                    <Info className="h-4 w-4" aria-hidden="true" />
                    Overview
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {movie.overview}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
