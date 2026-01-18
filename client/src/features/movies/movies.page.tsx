"use client";

import { useTitle } from "react-use";
import { MoviesSearch } from "./components/movies-search";
import { MovieCard } from "./components/movie-card";
import { MovieDetailDialog } from "./components/movie-detail-dialog";
import { useMoviesController } from "./movies.controller";

export function MoviesPage() {
  useTitle("Arbiter • Movies");
  const ctrl = useMoviesController();

  return (
    <>
      <div className="space-y-1">
        <h2 className="text-4xl font-bold font-display text-gradient">
          Movies
        </h2>
        <p className="font-sans">
          Discover movies powered by AI agents.
        </p>
      </div>

      <MoviesSearch
        value={ctrl.state.query}
        onChange={ctrl.setQuery}
        loading={ctrl.searchLoading}
      />

      {ctrl.state.debounced ? (
        ctrl.movies.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {ctrl.movies.map((m) => (
              <MovieCard
                key={m.id}
                movie={m}
                onOpen={() => ctrl.select(m.id)}
              />
            ))}
          </div>
        ) : (
          !ctrl.searchLoading && (
            <div className="text-center py-20 text-muted-foreground">
              No movies found for “{ctrl.state.debounced}”.
            </div>
          )
        )
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          Start typing to search for movies…
        </div>
      )}

      <MovieDetailDialog
        open={!!ctrl.state.selectedId}
        onOpenChange={(v) => !v && ctrl.close()}
        loading={ctrl.detailLoading}
        movie={ctrl.detail || null}
      />
    </>
  );
}
