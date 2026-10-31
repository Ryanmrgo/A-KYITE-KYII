import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ArrowNav from "./components/ArrowNav";
import ArrowSearchModal from "./components/ArrowSearchModal";
import AuthModal from "./components/AuthModal";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import MoviePlayer from "./pages/MoviePlayer";
import TvPlayer from "./pages/TvPlayer";
import Favorites from "./pages/Favorites";

function AppContent() {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Global hotkey: '/' or 'Ctrl+K' to open instant search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.key === "/" && !["INPUT", "TEXTAREA"].includes(e.target.tagName)) ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")
      ) {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000000", color: "#ffffff" }}>
      <ScrollToTop />

      {/* ArrowTV Floating Left Navigation Dock (and Bottom Dock on Mobile) */}
      <ArrowNav
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* ArrowTV Global Instant Search Modal */}
      <ArrowSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Main Content Area (spaced for dock) */}
      <main className="md:pl-[68px] pb-16 md:pb-0 transition-all duration-300">
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/movies"    element={<Home />} />
          <Route path="/tv"        element={<Home />} />
          <Route path="/movie/:id" element={<MoviePlayer />} />
          <Route path="/tv/:id"    element={<TvPlayer />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
