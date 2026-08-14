import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import LoadingSpinner from '../components/LoadingSpinner';
import { useFetch } from '../hooks/useFetch';
import { getReviews } from '../api/reviews';

export default function Reviews() {
  const { data: reviews, loading, error } = useFetch(getReviews);

  return (
    <div>
      <section className="bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-primary/20 py-20 md:py-28">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Reviews" }]} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Student Reviews</h1>
            <p className="text-lg text-gray-300">Here's what they say about us</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          {loading ? (
            <LoadingSpinner size="lg" />
          ) : error ? (
            <div className="text-center py-12"><p className="text-error">{error}</p></div>
          ) : reviews?.length === 0 ? (
            <div className="text-center py-12"><p className="text-text-muted">No reviews yet</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(reviews || []).map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="card"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className={`h-4 w-4 ${j < (review.rating || 5) ? 'fill-accent text-accent' : 'text-border'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed mb-4">"{review.comment || review.text || ''}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {review.name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-secondary">{review.name}</p>
                      <p className="text-xs text-text-muted">{review.position || "Student"}</p>
                    </div>
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
