"use client";

import { useState } from "react";
import { useAsync, useDebounce } from "react-use";
import { Shell } from "@/components/layout/shell";
import { api } from "@/lib/api";
import { Movie } from "@/types";
import { Search, Loader2, Calendar, Star, Info } from "lucide-react";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

function MovieCard({ movie, onClick }: { movie: Movie; onClick: () => void }) {
  return (
    <Card 
        className="overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 border-muted hover:border-primary/50"
        onClick={onClick}
    >
      <div className="relative aspect-[2/3] bg-muted">
        {movie.poster_path ? (
          <Image
            src={`${TMDB_IMAGE_BASE}${movie.poster_path}`}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No Poster
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
             <p className="text-white text-sm font-medium line-clamp-2">{movie.overview}</p>
        </div>
      </div>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold leading-tight truncate" title={movie.title}>{movie.title}</h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
                <Calendar className="mr-1 h-3 w-3" />
                {movie.release_date || "Unknown"}
            </div>
            <div className="flex items-center text-amber-500">
                <Star className="mr-1 h-3 w-3 fill-current" />
                {movie.vote_average.toFixed(1)}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MoviesPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  useDebounce(
    () => {
      setDebouncedQuery(query);
    },
    500,
    [query]
  );

  const searchState = useAsync(async () => {
    if (!debouncedQuery) return { results: [] };
    return api.movies.search(debouncedQuery);
  }, [debouncedQuery]);

  const detailState = useAsync(async () => {
    if (!selectedMovieId) return null;
    return api.movies.get(selectedMovieId);
  }, [selectedMovieId]);

  const movies = searchState.value?.results || [];

  return (
    <Shell>
      <div className="space-y-1">
          <h2 className="text-3xl font-bold font-display text-gradient">Movies</h2>
          <p className="text-muted-foreground">
            Discover movies powered by AI agents.
          </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
            placeholder="Search for movies (e.g., 'Inception')..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 text-lg shadow-sm"
        />
        {searchState.loading && (
            <div className="absolute right-3 top-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {movies.map((movie) => (
            <MovieCard 
                key={movie.id} 
                movie={movie} 
                onClick={() => setSelectedMovieId(movie.id)} 
            />
        ))}
      </div>

      {!searchState.loading && movies.length === 0 && debouncedQuery && (
          <div className="text-center py-20 text-muted-foreground">
              No movies found for "{debouncedQuery}".
          </div>
      )}

      {!debouncedQuery && (
           <div className="text-center py-20 text-muted-foreground">
              Start typing to search for movies...
          </div>
      )}

      <Dialog open={!!selectedMovieId} onOpenChange={(open) => !open && setSelectedMovieId(null)}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
             {detailState.loading ? (
                 <div className="h-[400px] flex items-center justify-center">
                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
             ) : detailState.value ? (
                 <div className="flex flex-col md:flex-row h-full max-h-[80vh]">
                     <div className="relative md:w-2/5 min-h-[300px] md:min-h-full">
                        {detailState.value.poster_path && (
                             <Image
                                src={`${TMDB_IMAGE_BASE}${detailState.value.poster_path}`}
                                alt={detailState.value.title}
                                fill
                                className="object-cover"
                             />
                        )}
                     </div>
                     <div className="flex-1 p-6 overflow-y-auto">
                        <DialogHeader>
                             <DialogTitle className="text-2xl font-display">{detailState.value.title}</DialogTitle>
                             <DialogDescription>
                                 Released: {detailState.value.release_date}
                             </DialogDescription>
                        </DialogHeader>
                        
                        <div className="mt-4 flex gap-2">
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-current" />
                                {detailState.value.vote_average.toFixed(1)}
                            </Badge>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <Info className="h-4 w-4" /> Overview
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {detailState.value.overview}
                                </p>
                            </div>
                        </div>
                     </div>
                 </div>
             ) : null}
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
