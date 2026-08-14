import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import LoadingSpinner from '../components/LoadingSpinner';
import { useFetch } from '../hooks/useFetch';
import { getBlogPost } from '../api/blog';

export default function BlogDetails() {
  const { id } = useParams();
  const { data: post, loading, error } = useFetch(() => getBlogPost(id), [id]);

  if (loading) return <div className="pt-20"><LoadingSpinner size="lg" /></div>;
  if (error) return (
    <div className="pt-20 section-padding text-center">
      <p className="text-error mb-4">{error}</p>
      <Link to="/blog" className="btn-primary">Back to blog</Link>
    </div>
  );
  if (!post) return null;

  return (
    <div>
      <section className="bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-primary/20 py-20 md:py-28">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Blog', path: '/blog' }, { label: post.title }]} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{post.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Calendar className="h-4 w-4" />
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US') : ''}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom px-4 sm:px-6 lg:px-8 max-w-4xl">
          {post.image && (
            <img src={post.image} alt={post.title} className="w-full rounded-2xl mb-8 shadow-lg" />
          )}
          <div className="prose max-w-none text-text-muted leading-relaxed">
            {post.content?.split('\n').map((p, i) => <p key={i} className="mb-4">{p}</p>)}
          </div>
          <div className="mt-12 pt-8 border-t border-border">
            <Link to="/blog" className="btn-secondary">
              <ArrowLeft className="h-4 w-4" /> Back to blog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
