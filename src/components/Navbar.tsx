import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sofa, KeyRound, Menu, X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "صفحه اصلی", path: "/" },
    { label: "گالری محصولات", path: "/products" },
    { label: "درباره ما", path: "/about" },
    { label: "ارتباط با ما", path: "/contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-stone-50/95 backdrop-blur-md shadow-sm border-b border-stone-200/50 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-stone-50 group-hover:bg-stone-800 transition-colors">
                <Sofa className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-stone-900 font-sans uppercase">
                modern<span className="text-amber-600 font-light">-home</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {!isAdmin && (
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative text-sm font-medium transition-colors hover:text-stone-900 py-1 ${
                      isActive ? "text-stone-900 font-semibold" : "text-stone-500"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900 rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Auth Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAdmin ? (
              <Link
                to="/"
                className="flex items-center gap-2 text-xs font-medium text-stone-600 hover:text-stone-900 border border-stone-200 bg-stone-50 px-4  py-2 rounded-lg transition-colors"
              >
                <span>بازدید از سایت عمومی</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                to="/admin"
                className="flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-stone-900 border border-stone-200/80 px-4 py-2 rounded-lg hover:bg-stone-50 transition-colors"
                title="پنل مدیریت واسطه‌گری"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>ورود به پنل مدیریت</span>
              </Link>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-stone-600 hover:text-stone-900 p-2 rounded-lg hover:bg-stone-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="md:hidden border-b border-stone-200 bg-stone-50 px-4 pt-2 pb-6 space-y-3 shadow-lg"
          >
            {!isAdmin ? (
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2.5 rounded-lg text-base font-medium ${
                      location.pathname === link.path
                        ? "bg-stone-100 text-stone-900 font-bold"
                        : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-stone-200">
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full text-center bg-stone-900 text-stone-50 px-4 py-3 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>ورود به پنل مدیریت</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full text-center bg-stone-900 text-stone-50 px-4 py-3 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors"
                >
                  <span>بازدید از سایت عمومی</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
