import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Camera, Menu, X, Instagram, Mail } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

export default function PublicLayout({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Activities', path: '/activities' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-rose-600 selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-rose-600 rounded-lg flex items-center justify-center group-hover:bg-rose-700 transition-colors">
                <Camera className="text-white w-6 h-6" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tighter">KLISE</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-rose-500",
                    location.pathname === link.path ? "text-rose-500" : "text-zinc-400"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-white/20 rounded-full hover:bg-white hover:text-black transition-all"
              >
                Admin
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white p-2"
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-zinc-900 border-b border-white/10"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "block px-3 py-3 rounded-md text-base font-medium",
                    location.pathname === link.path ? "bg-white/5 text-rose-500" : "text-zinc-400 hover:text-white"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-3 text-zinc-400 hover:text-white"
              >
                Admin Login
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Camera className="text-rose-600 w-6 h-6" />
                <span className="font-display font-bold text-xl">KLISE</span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Capturing moments, telling stories. A community dedicated to the art of photography and cinematography.
              </p>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><Link to="/about" className="hover:text-rose-500 transition-colors">About Us</Link></li>
                <li><Link to="/activities" className="hover:text-rose-500 transition-colors">Activities</Link></li>
                <li><Link to="/gallery" className="hover:text-rose-500 transition-colors">Gallery</Link></li>
                <li><Link to="/contact" className="hover:text-rose-500 transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg mb-4">Connect</h3>
              <div className="flex gap-4">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-rose-600 hover:text-white transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="mailto:contact@klise.com" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-rose-600 hover:text-white transition-all">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 text-center text-zinc-600 text-xs">
            © {new Date().getFullYear()} KLISE Community. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
