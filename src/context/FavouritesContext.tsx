import { createContext, useContext, useState, type ReactNode } from "react";

interface FavouritesContextType {
    favourites: number[];
    toggleFavourite: (id: number) => void;
    clearFavourites: () => void;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

export const FavouritesProvider = ({ children } : { children: ReactNode }) => {
    const [favourites, setFavourites] = useState<number[]>(() => {
        const stored = localStorage.getItem("favourites");
        return stored ? JSON.parse(stored) : [];
    });

    const toggleFavourite = (id: number) => {
        setFavourites(prev => {
            const updated = prev.includes(id) ? prev.filter(favourites => favourites !== id) : [...prev, id];
            localStorage.setItem("favourites", JSON.stringify(updated));
            return updated;
        })
    }

    const clearFavourites = () => {
        setFavourites([]);
        localStorage.removeItem("favourites");
    };

    return (
        <FavouritesContext.Provider value={{ favourites, toggleFavourite, clearFavourites}}>
            {children}
        </FavouritesContext.Provider>
    );
};

// Helper hook for convenience
export const useFavourites = () => {
    const context = useContext(FavouritesContext);
    if (!context) throw new Error('useFavourites must be used within FavouritesProvider');
    return context;
}