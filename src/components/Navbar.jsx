import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap, Sun, Moon, Globe, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSettingsStore from '../store/settingsStore';
import useThemeStore from '../store/themeStore';
import useLocaleStore from '../store/localeStore';
import useAuthStore from '../store/authStore';

const navPaths = [
  { path: '/', key: 'nav.home' },
  { path: '/courses', key: 'nav.courses' },
  { path: '/teachers', key: 'nav.teachers' },
  { path: '/blog', key: 'nav.blog' },
  { path: '/contact', key: 'nav.contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const location = useLocation();
  const { settings } = useSettingsStore();
  const { theme, toggleTheme } = useThemeStore();
  const { t, locale, setLocale } = useLocaleStore();
  const { token } = useAuthStore();
  const adminPath = token ? '/admin' : '/admin/login';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setLangOpen(false);
  }, [location]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-surface/95 backdrop-blur-lg shadow-sm border-b border-border'
          : 'bg-surface/80'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/30 group-hover:scale-105">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-secondary">
              {settings?.siteName || "EduNova"}
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navPaths.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  location.pathname === link.path
                    ? 'text-primary bg-primary/5'
                    : 'text-text-muted hover:text-text hover:bg-surface-alt'
                }`}
              >
                {t(link.key, link.path)}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                  />
                )}
              </Link>
            ))}

            {/* Admin link */}
            <Link
              to={adminPath}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-all duration-200"
            >
              <Shield className="h-4 w-4" />
              <span>{t('nav.admin', 'Admin')}</span>
            </Link>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-all"
              aria-label={theme === 'dark' ? t('nav.light', 'Light') : t('nav.dark', 'Dark')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Language switcher */}
            <div className="relative ml-1">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-all"
              >
                <Globe className="h-4 w-4" />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 mt-2 w-28 rounded-xl border border-border bg-surface shadow-lg overflow-hidden"
                  >
                    <button
                      onClick={() => { setLocale('uz'); setLangOpen(false); }}
                      className={`w-full px-4 py-2.5 text-sm text-left transition-colors ${locale === 'uz' ? 'text-primary bg-primary/5 font-medium' : 'text-text-muted hover:text-text hover:bg-surface-alt'}`}
                    >
                      O'zbek
                    </button>
                    <button
                      onClick={() => { setLocale('ru'); setLangOpen(false); }}
                      className={`w-full px-4 py-2.5 text-sm text-left transition-colors ${locale === 'ru' ? 'text-primary bg-primary/5 font-medium' : 'text-text-muted hover:text-text hover:bg-surface-alt'}`}
                    >
                      Русский
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/registration" className="btn-primary ml-2 text-sm">
              {t('nav.register', "Ro'yxatdan o'tish")}
            </Link>
          </div>

          {/* Mobile right group */}
          <div className="flex lg:hidden items-center gap-1">
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-all"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-all relative"
            >
              <Globe className="h-4 w-4" />
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 top-full mt-2 w-28 rounded-xl border border-border bg-surface shadow-lg overflow-hidden"
                  >
                    <button
                      onClick={() => { setLocale('uz'); setLangOpen(false); }}
                      className={`w-full px-4 py-2.5 text-sm text-left transition-colors ${locale === 'uz' ? 'text-primary bg-primary/5 font-medium' : 'text-text-muted hover:text-text hover:bg-surface-alt'}`}
                    >
                      O'zbek
                    </button>
                    <button
                      onClick={() => { setLocale('ru'); setLangOpen(false); }}
                      className={`w-full px-4 py-2.5 text-sm text-left transition-colors ${locale === 'ru' ? 'text-primary bg-primary/5 font-medium' : 'text-text-muted hover:text-text hover:bg-surface-alt'}`}
                    >
                      Русский
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-colors"
              aria-label="Menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border bg-surface/95 backdrop-blur-lg"
          >
            <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
              {navPaths.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'text-primary bg-primary/5'
                      : 'text-text-muted hover:text-text hover:bg-surface-alt'
                  }`}
                >
                  {t(link.key, link.path)}
                </Link>
              ))}
              <Link
                to={adminPath}
                className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-text-muted hover:text-primary hover:bg-primary/5 transition-colors"
              >
                <Shield className="h-4 w-4" />
                <span>{t('nav.admin', 'Admin')}</span>
              </Link>
              <Link to="/registration" className="btn-primary w-full mt-2 text-center">
                {t('nav.register', "Ro'yxatdan o'tish")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
