import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import MoviePlayer from "./pages/MoviePlayer";
import TvPlayer from "./pages/TvPlayer";
import Favorites from "./pages/Favorites";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <div style={{ minHeight: "100vh", backgroundColor: "#131313" }}>
          <ScrollToTop />
          <Navbar />
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/movies"      element={<Home />} />
            <Route path="/tv"          element={<Home />} />
            <Route path="/movie/:id"   element={<MoviePlayer />} />
            <Route path="/tv/:id"      element={<TvPlayer />} />
            <Route path="/favorites"   element={<Favorites />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
