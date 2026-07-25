import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, MapPin, Star, FileText, MessageSquare, TrendingUp } from 'lucide-react';
import { getCourses } from '../../api/courses';
import { getTeachers } from '../../api/teachers';
import { getBranches } from '../../api/branches';
import { getReviews } from '../../api/reviews';
import { getBlogPosts } from '../../api/blog';
import { getApplications } from '../../api/applications';

const statCards = [
  { key: 'courses', label: 'Kurslar', icon: BookOpen, color: 'bg-blue-500', api: getCourses },
  { key: 'teachers', label: "O'qituvchilar", icon: Users, color: 'bg-emerald-500', api: getTeachers },
  { key: 'branches', label: 'Filiallar', icon: MapPin, color: 'bg-violet-500', api: getBranches },
  { key: 'reviews', label: 'Fikrlar', icon: Star, color: 'bg-amber-500', api: getReviews },
  { key: 'blog', label: 'Blog', icon: FileText, color: 'bg-rose-500', api: getBlogPosts },
  { key: 'applications', label: 'Arizalar', icon: MessageSquare, color: 'bg-cyan-500', api: getApplications },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const results = await Promise.allSettled(
          statCards.map(async (card) => {
            const data = await card.api();
            return { key: card.key, count: Array.isArray(data) ? data.length : 0 };
          })
        );
        const statsMap = {};
        results.forEach((r) => {
          if (r.status === 'fulfilled') statsMap[r.value.key] = r.value.count;
        });
        setStats(statsMap);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary">Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Admin panelga xush kelibsiz</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color} text-white shadow-sm`}>
                <card.icon className="h-5 w-5" />
              </div>
              <TrendingUp className="h-4 w-4 text-text-muted" />
            </div>
            <p className="text-2xl font-bold text-secondary">
              {loading ? (
                <span className="inline-block w-8 h-6 bg-gray-200 rounded animate-pulse" />
              ) : (
                stats[card.key] ?? 0
              )}
            </p>
            <p className="text-sm text-text-muted mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
