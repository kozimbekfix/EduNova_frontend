import { motion } from 'framer-motion';

export default function SectionTitle({ title, subtitle, light = false, center = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className={`mb-12 md:mb-16 ${center ? 'text-center' : ''}`}
    >
      <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight ${
        light ? 'text-white' : 'text-secondary'
      }`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-base md:text-lg max-w-2xl ${center ? 'mx-auto' : ''} ${
          light ? 'text-gray-300' : 'text-text-muted'
        }`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
