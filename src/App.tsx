import { BrowserRouter, Routes, Route} from "react-router-dom";
import Layout from './components/Layout';
import AnimeMainList from './components/AnimeMainList';
import AnimeDetailedPage from './components/AnimeDetailedPage';
import FavoritePage from './components/FavouritePage';
import { FavouritesProvider } from "./context/FavouritesContext";
import { AnimeProvider } from "./context/AnimeContext";

export default function App() {
  return (
    <FavouritesProvider>
      <AnimeProvider>
        <BrowserRouter>
          <Routes> 
            <Route element={<Layout/>}>
              <Route path="/" element={<AnimeMainList/>}/>
              <Route path="/anime/:id" element={<AnimeDetailedPage/>}/>
              <Route path="/favorites" element={<FavoritePage/>}/>
            </Route>
          </Routes>
        </BrowserRouter>
      </AnimeProvider>
    </FavouritesProvider>
  )
};


