import { motion } from 'framer-motion';
import Breadcrumb from '../components/Breadcrumb';
import LoadingSpinner from '../components/LoadingSpinner';
import { useFetch } from '../hooks/useFetch';
import { getTeachers } from '../api/teachers';

export default function Teachers() {
  const { data: teachers, loading, error } = useFetch(getTeachers);

  return (
    <div>
      <section className="bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-primary/20 py-20 md:py-28">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "O'qituvchilar" }]} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">O'qituvchilar</h1>
            <p className="text-lg text-gray-300">Tajribali va professional o'qituvchilar jamoasi</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          {loading ? (
            <LoadingSpinner size="lg" />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-error">{error}</p>
            </div>
          ) : teachers?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-muted">Hozircha o'qituvchilar qo'shilmagan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(teachers || []).map((teacher, i) => (
                <motion.div
                  key={teacher.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="card-hover text-center"
                >
                  <div className="mx-auto mb-4 h-24 w-24 rounded-full overflow-hidden ring-2 ring-primary/10">
                    {teacher.image ? (
                      <img src={teacher.image} alt={teacher.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                        {teacher.name?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-secondary">{teacher.name}</h3>
                  <p className="text-sm text-text-muted mt-1">{teacher.subject || teacher.position || ''}</p>
                  {teacher.bio && <p className="text-xs text-text-muted mt-3 line-clamp-3">{teacher.bio}</p>}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
