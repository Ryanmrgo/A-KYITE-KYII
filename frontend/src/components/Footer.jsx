export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/10 py-12 mt-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">
        {/* Brand */}
        <div>
          <span className="text-xl font-black text-red-600 mb-4 block font-headline tracking-tighter uppercase">
            CINEMA
          </span>
          <p className="text-sm tracking-wide text-on-surface-variant max-w-xs mx-auto md:mx-0">
            The premium streaming experience for the true cinephile. Experience
            movies as they were meant to be seen.
          </p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-on-surface font-bold text-sm mb-2">
              Explore
            </span>
            <a
              href="#"
              className="text-on-surface-variant hover:text-red-500 transition-colors text-xs tracking-wide"
            >
              Support
            </a>
            <a
              href="#"
              className="text-on-surface-variant hover:text-red-500 transition-colors text-xs tracking-wide"
            >
              Privacy Policy
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-on-surface font-bold text-sm mb-2">
              Company
            </span>
            <a
              href="#"
              className="text-on-surface-variant hover:text-red-500 transition-colors text-xs tracking-wide"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-on-surface-variant hover:text-red-500 transition-colors text-xs tracking-wide"
            >
              Contact Us
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-on-surface font-bold text-sm mb-2">
              Help
            </span>
            <a
              href="#"
              className="text-on-surface-variant hover:text-red-500 transition-colors text-xs tracking-wide"
            >
              Help Center
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 mt-12 pt-8 border-t border-outline-variant/10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="text-sm tracking-wide text-on-surface-variant/60">
          © 2025 CINEMA. All rights reserved.
        </span>
        <div className="flex gap-6">
          <span className="material-symbols-outlined text-on-surface-variant hover:text-red-500 cursor-pointer transition-colors">
            public
          </span>
          <span className="material-symbols-outlined text-on-surface-variant hover:text-red-500 cursor-pointer transition-colors">
            play_circle
          </span>
          <span className="material-symbols-outlined text-on-surface-variant hover:text-red-500 cursor-pointer transition-colors">
            campaign
          </span>
        </div>
      </div>
    </footer>
  );
}
