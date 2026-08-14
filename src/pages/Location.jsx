import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import LoadingSpinner from '../components/LoadingSpinner';
import { useFetch } from '../hooks/useFetch';
import { getBranches } from '../api/branches';

export default function Location() {
  const { data: branches, loading, error } = useFetch(getBranches);

  return (
    <div>
      <section className="bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-primary/20 py-20 md:py-28">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Locations' }]} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Locations</h1>
            <p className="text-lg text-gray-300">Choose the branch closest to you</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          {loading ? (
            <LoadingSpinner size="lg" />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-error mb-4">{error}</p>
            </div>
          ) : !branches?.length ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 mx-auto text-text-muted mb-4" />
              <p className="text-text-muted">No branches added yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {branches.map((branch, i) => (
                <motion.div
                  key={branch.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="card overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-secondary">{branch.name}</h3>
                  </div>
                  <p className="text-sm text-text-muted mb-4">{branch.location}</p>
                  <div className="rounded-xl overflow-hidden h-64 border border-border">
                    <iframe
                      title={branch.name}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(branch.location)}&output=embed`}
                    />
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