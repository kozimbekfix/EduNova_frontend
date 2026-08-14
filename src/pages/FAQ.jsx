import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';

const faqs = [
  { q: "How can I sign up for courses?", a: "Fill out the 'Sign Up' form on our website or contact us by phone. We'll get in touch with you and provide all the details." },
  { q: "What format are the lessons taught in?", a: "Lessons are available online and offline. You can choose whichever option suits you. Online lessons are held via Zoom, and offline lessons take place at our center." },
  { q: "How does payment work?", a: "You can pay monthly or for the full course. The first lesson is free! We accept both cash and card payments." },
  { q: "Is a certificate issued?", a: "Yes, an official certificate is issued upon completion of the course. The certificate is officially recognized and meets international standards." },
  { q: "How many students are in each group?", a: "Groups consist of 8-12 students. This allows for an individual approach to each student." },
  { q: "Can I change my class schedule?", a: "Yes, you can choose a time that's convenient for you. Check the schedule of available groups and find the one that fits you best." },
  { q: "What subjects are offered?", a: "We offer classes in Mathematics, English, Physics, Chemistry, Biology, History, Programming, and other subjects." },
  { q: "Are there any discounts or promotions?", a: "Yes, we run seasonal promotions and special discounts. We also have a special bonus program for our regular students." },
];

export default function FAQ() {
  const [openId, setOpenId] = useState(null);

  return (
    <div>
      <section className="bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-primary/20 py-20 md:py-28">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'FAQ' }]} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-gray-300">Answers to the most common questions</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenId(openId === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 md:p-5 text-left text-sm font-medium text-secondary hover:bg-surface-alt transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown className={`h-5 w-5 text-text-muted shrink-0 transition-transform duration-200 ${openId === i ? 'rotate-180' : ''}`} />
                </button>
                {openId === i && (
                  <div className="px-4 md:px-5 pb-4 md:pb-5 text-sm text-text-muted leading-relaxed border-t border-border pt-4">
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
