"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { addFavorite, fetchFavoriteIds, removeFavorite } from "@/lib/api";

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);

  const reload = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetchFavoriteIds();
      setFavorites(res.data || []);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      if (!user) {
        setAuthRequired(true);
        return;
      }

      const isFav = favorites.includes(propertyId);
      // Optimistic UI
      setFavorites((prev) =>
        isFav ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]
      );

      try {
        if (isFav) await removeFavorite(propertyId);
        else await addFavorite(propertyId);
      } catch {
        // rollback
        setFavorites((prev) =>
          isFav ? [...prev, propertyId] : prev.filter((id) => id !== propertyId)
        );
      }
    },
    [user, favorites]
  );

  const clearAuthGate = () => setAuthRequired(false);

  return {
    favorites,
    loading,
    toggleFavorite,
    reload,
    authRequired,
    clearAuthGate,
  };
}
