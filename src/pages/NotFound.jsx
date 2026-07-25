import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center section-padding">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center max-w-md"
      >
        <p className="text-8xl font-bold text-primary/20 mb-4">404</p>
        <h1 className="text-2xl font-bold text-secondary mb-2">Sahifa topilmadi</h1>
        <p className="text-text-muted mb-8">Qidirgan sahifangiz mavjud emas yoki olib tashlangan.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/" className="btn-primary">
            <Home className="h-4 w-4" /> Bosh sahifa
          </Link>
          <button onClick={() => window.history.back()} className="btn-secondary">
            <ArrowLeft className="h-4 w-4" /> Orqaga
          </button>
        </div>
      </motion.div>
    </div>
  );
}
