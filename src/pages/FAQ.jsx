import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';

const faqs = [
  { q: "Kurslarga qanday yozilish mumkin?", a: "Sahifamizdagi 'Ro'yxatdan o'tish' formasini to'ldiring yoki telefon orqali bog'laning. Biz siz bilan bog'lanib, barcha ma'lumotlarni taqdim etamiz." },
  { q: "Darslar qanday formatda o'tadi?", a: "Darslar online va offline formatda mavjud. Sizga qulay variantni tanlashingiz mumkin. Online darslar Zoom orqali, offline darslar esa markazimizda o'tkaziladi." },
  { q: "To'lov tizimi qanday?", a: "Har oy yoki to'liq kurs uchun to'lov qilishingiz mumkin. Birinchi dars bepul! Naqd va plastik karta orqali to'lov qabul qilinadi." },
  { q: "Sertifikat beriladimi?", a: "Ha, kurs yakunida rasmiy sertifikat taqdim etiladi. Sertifikat davlat tomonidan tan olingan va xalqaro standartlarga javob beradi." },
  { q: "Guruhlar necha kishidan iborat?", a: "Guruhlar 8-12 kishidan iborat. Bu har bir o'quvchiga individual yondashish imkonini beradi." },
  { q: "Dars jadvalini o'zgartirish mumkinmi?", a: "Ha, sizga qulay vaqtni tanlashingiz mumkin. Mavjud guruhlar jadvali bilan tanishib, o'zingizga mosini toping." },
  { q: "Qanday fanlar bo'yicha darslar bor?", a: "Matematika, Ingliz tili, Fizika, Kimyo, Biologiya, Tarix, Dasturlash va boshqa fanlar bo'yicha darslar mavjud." },
  { q: "Chegirma yoki aksiyalar bormi?", a: "Ha, mavsumiy aksiyalar va maxsus chegirmalar mavjud. Doimiy mijozlarimiz uchun maxsus bonus dasturi ishlab chiqilgan." },
];

export default function FAQ() {
  const [openId, setOpenId] = useState(null);

  return (
    <div>
      <section className="bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-primary/20 py-20 md:py-28">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'FAQ' }]} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Ko'p beriladigan savollar</h1>
            <p className="text-lg text-gray-300">Eng ko'p so'raladigan savollarga javoblar</p>
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
