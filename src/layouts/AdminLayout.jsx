import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Settings, LogOut, Menu, GraduationCap, MessageSquare, ChevronLeft,
  BookOpen, Users, MapPin, Newspaper, Star,
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';

const sidebarLinks = [
  { path: '/admin/applications', label: 'Applications', icon: MessageSquare },
  { path: '/admin/courses', label: 'Courses', icon: BookOpen },
  { path: '/admin/teachers', label: 'Teachers', icon: Users },
  { path: '/admin/branches', label: 'Branches', icon: MapPin },
  { path: '/admin/blog', label: 'Blog', icon: Newspaper },
  { path: '/admin/reviews', label: 'Reviews', icon: Star },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (link) => {
    if (link.end) return location.pathname === link.path;
    return location.pathname.startsWith(link.path);
  };

  return (
    <div className="min-h-screen bg-surface-alt">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-surface border-r border-border shadow-sm transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-border">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="font-semibold text-sm text-secondary">Admin Panel</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {sidebarLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link)
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-text-muted hover:text-text hover:bg-surface-alt'
                }`}
              >
                <link.icon className="h-[18px] w-[18px]" />
                <span>{link.label}</span>
                {isActive(link) && (
                  <motion.div layoutId="sidebar-active" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-border">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-error hover:bg-error/5 transition-all duration-200"
            >
              <LogOut className="h-[18px] w-[18px]" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-lg border-b border-border shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 ml-auto">
              <Link
                to="/"
                className="text-xs text-text-muted hover:text-primary transition-colors flex items-center gap-1"
              >
                Go to site
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#121212',
            color: '#f5f5f5',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#f8fafc' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#f8fafc' } },
        }}
      />
    </div>
  );
}
