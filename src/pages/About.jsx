import { motion } from 'framer-motion';
import { CheckCircle, Target, Eye, Heart } from 'lucide-react';
import SectionTitle from '../components/SectionTitle';
import Breadcrumb from '../components/Breadcrumb';
import useSettingsStore from '../store/settingsStore';

const values = [
  { icon: Target, title: 'Our Mission', desc: "To contribute to every student's future success by providing quality, modern education." },
  { icon: Eye, title: "Our Vision", desc: "To become the most advanced and innovative learning center in Uzbekistan." },
  { icon: Heart, title: 'Our Values', desc: "Quality, integrity, respect, and continuous growth are our core principles." },
];

const milestones = [
  { year: '2015', event: "The learning center was founded" },
  { year: '2017', event: 'Our 1000th student graduated' },
  { year: '2020', event: 'Launched our online learning platform' },
  { year: '2023', event: "5 branches across Uzbekistan" },
  { year: '2025', event: 'Established international partnerships' },
];

export default function About() {
  const { settings } = useSettingsStore();

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-primary/20 py-20 md:py-28">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'About Us' }]} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About Us</h1>
            <p className="text-lg text-gray-300">{settings?.aboutDescription || "Learn about our learning center's history, mission, and values."}</p>
          </motion.div>
        </div>
      </section>

      {/* Mission/Vision/Values */}
      <section className="section-padding">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-hover text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-secondary mb-3">{item.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-surface-alt">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <SectionTitle title="Our journey" subtitle="Key milestones" />
          <div className="max-w-3xl mx-auto">
            {milestones.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 mb-8 last:mb-0"
              >
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white text-sm font-bold shrink-0">
                    {item.year.slice(2)}
                  </div>
                  {i < milestones.length - 1 && <div className="w-0.5 flex-1 bg-primary/20 mt-2" />}
                </div>
                <div className="pt-2">
                  <span className="text-xs font-semibold text-primary">{item.year}</span>
                  <p className="text-sm text-text-muted mt-1">{item.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="section-padding">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <SectionTitle title="Why choose us?" subtitle="When you choose us" />
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              '10 years of experience',
              'Qualified teachers',
              'Modern curricula',
              'Individual approach',
              'Affordable prices and payment options',
              'Online and offline learning',
              'Official certificate',
              'Practice and internships',
            ].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3"
              >
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="text-text-muted">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
