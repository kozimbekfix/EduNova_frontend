import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Calendar, ArrowRight, FileText } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import LoadingSpinner from '../components/LoadingSpinner';
import { useFetch } from '../hooks/useFetch';
import { getBlogPosts } from '../api/blog';

export default function Blog() {
  const { data: posts, loading, error } = useFetch(getBlogPosts);
  const [search, setSearch] = useState('');

  const filtered = (posts || []).filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <section className="bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-primary/20 py-20 md:py-28">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Blog' }]} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Blog</h1>
            <p className="text-lg text-gray-300">Latest news and articles</p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 bg-surface border-b border-border">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input type="text" placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          {loading ? (
            <LoadingSpinner size="lg" />
          ) : error ? (
            <div className="text-center py-12"><p className="text-error">{error}</p></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-text-muted mb-4" />
              <p className="text-text-muted">No articles found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group card-hover"
                >
                  {post.image && (
                    <div className="relative -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-2xl h-48">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US') : ''}
                  </div>
                  <h3 className="text-lg font-semibold text-secondary mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                  <p className="text-sm text-text-muted line-clamp-3 mb-4">{post.excerpt || post.content?.slice(0, 150) || ''}</p>
                  <Link to={`/blog/${post.id}`} className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
                    Read <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
