import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, CheckCircle } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import LoadingSpinner from '../components/LoadingSpinner';
import { useFetch } from '../hooks/useFetch';
import { getCourse } from '../api/courses';

export default function CourseDetails() {
  const { id } = useParams();
  const { data: course, loading, error } = useFetch(() => getCourse(id), [id]);

  if (loading) return <div className="pt-20"><LoadingSpinner size="lg" /></div>;
  if (error) return (
    <div className="pt-20 section-padding text-center">
      <p className="text-error mb-4">{error}</p>
      <Link to="/courses" className="btn-primary">Back to courses</Link>
    </div>
  );
  if (!course) return null;

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-primary/20 py-20 md:py-28">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Courses', path: '/courses' }, { label: course.title }]} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{course.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              {course.duration && (
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.duration}</span>
              )}
              {course.price && (
                <span className="text-xl font-bold text-primary">{course.price}</span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {course.image && (
                <img src={course.image} alt={course.title} className="w-full rounded-2xl mb-8 shadow-lg" />
              )}
              <div className="prose max-w-none">
                <p className="text-text-muted leading-relaxed">{course.description || ''}</p>
              </div>
              {course.benefits?.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-secondary mb-4">What you'll learn</h3>
                  <ul className="space-y-2">
                    {course.benefits.map((b, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-text-muted">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" /> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card sticky top-24">
                <h3 className="font-semibold text-secondary mb-4">About the course</h3>
                <div className="space-y-3 text-sm">
                  {course.duration && (
                    <div className="flex justify-between"><span className="text-text-muted">Duration</span><span className="font-medium">{course.duration}</span></div>
                  )}
                  {course.price && (
                    <div className="flex justify-between"><span className="text-text-muted">Price</span><span className="font-bold text-primary">{course.price}</span></div>
                  )}
                </div>
                <Link to="/registration" className="btn-primary w-full justify-center mt-6">Sign Up</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
