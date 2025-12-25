import { BrowserRouter, Routes, Route} from "react-router-dom";
import Layout from './components/Layout';
import AnimeMainList from './components/AnimeMainList';
import AnimeDetailedPage from './components/AnimeDetailedPage';
import FavoritePage from './components/FavouritePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes> 
        <Route element={<Layout/>}>
          <Route path="/" element={<AnimeMainList/>}/>
          <Route path="/anime/:id" element={<AnimeDetailedPage/>}/>
          <Route path="/favorites" element={<FavoritePage/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

