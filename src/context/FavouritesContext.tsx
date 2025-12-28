import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface FavouritesContextType {
  favourites: number[];
  toggleFavourite: (id: number) => void;
  clearFavourites: () => void;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

export const FavouritesProvider = ({ children }: { children: ReactNode }) => {
  const [favourites, setFavourites] = useState<number[]>(() => {
    const stored = localStorage.getItem("favourites");
    return stored ? JSON.parse(stored) : [];
  });

  /** Sync across tabs */
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "favourites") {
        setFavourites(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleFavourite = (id: number) => {
    setFavourites((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];

      localStorage.setItem("favourites", JSON.stringify(updated));
      return updated;
    });
  };

  const clearFavourites = () => {
    setFavourites([]);
    localStorage.removeItem("favourites");
  };

  return (
    <FavouritesContext.Provider value={{ favourites, toggleFavourite, clearFavourites }}>
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavourites = () => {
  const context = useContext(FavouritesContext);
  if (!context) throw new Error("useFavourites must be used inside FavouritesProvider");
  return context;
};
