import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Clock, BookOpen } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import LoadingSpinner from '../components/LoadingSpinner';
import { useFetch } from '../hooks/useFetch';
import { getCourses } from '../api/courses';

export default function Courses() {
  const { data: courses, loading, error } = useFetch(getCourses);
  const [search, setSearch] = useState('');

  const filtered = (courses || []).filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-primary/20 py-20 md:py-28">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Courses' }]} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Courses</h1>
            <p className="text-lg text-gray-300">Courses built around the latest trends</p>
          </motion.div>
        </div>
      </section>

      {/* Search */}
      <section className="py-8 bg-surface border-b border-border">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
      </section>

      {/* Courses grid */}
      <section className="section-padding">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          {loading ? (
            <LoadingSpinner size="lg" />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-error mb-4">{error}</p>
              <p className="text-text-muted">Please make sure the backend server is running</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-text-muted mb-4" />
              <p className="text-text-muted">No courses found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group card-hover"
                >
                  {course.image && (
                    <div className="relative -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-2xl h-48">
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-secondary mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                  <p className="text-sm text-text-muted line-clamp-3 mb-4">{course.description || ''}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      {course.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {course.duration}
                        </span>
                      )}
                    </div>
                    <Link to={`/courses/${course.id}`} className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
                      Details <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
