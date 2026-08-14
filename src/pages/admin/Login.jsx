import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, LogIn, Eye, EyeOff, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginAdmin } from '../../api/auth';
import useAuthStore from '../../store/authStore';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter your login and password');
      return;
    }
    setLoading(true);
    try {
      const data = await loginAdmin(username, password);
      login(data.token, data.admin);
      toast.success('Signed in successfully');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Incorrect login or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-primary/20 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative"
      >
        {/* Close button */}
        <button
          onClick={() => navigate('/')}
          className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border shadow-md text-text-muted hover:text-text hover:bg-surface-alt transition-all duration-200 hover:scale-105"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="bg-surface rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-secondary">Admin Panel</h1>
            <p className="text-sm text-text-muted mt-1">Sign in to the system</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Login</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="Admin login"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? 'Signing in...' : <><LogIn className="h-4 w-4" /> Sign in</>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
