import { useState, useEffect, useCallback } from "react";

export interface Photo {
  id?: number;
  src: string;
  date: string;
  message: string;
  section: "polaroid" | "film";
  added_by?: string;
  added_at?: string;
  sort_order?: number;
}

export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch("/api/photos");
      if (!res.ok) throw new Error("Failed to fetch photos");
      const data = await res.json();
      setPhotos(data);
      setError(null);
    } catch (err) {
      setError(String(err));
      const { photos: staticPhotos } = await import("@/data/photos");
      setPhotos(staticPhotos);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const polaroidPhotos = photos.filter((p) => p.section === "polaroid");
  const filmPhotos = photos.filter((p) => p.section === "film");

  return { photos, polaroidPhotos, filmPhotos, loading, error, refetch: fetchPhotos };
}
