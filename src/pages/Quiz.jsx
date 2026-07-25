import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, Sparkles, RotateCcw,
  Languages, Globe2, Calculator, Brain, Rocket,
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';

// Har bir savol turli "fan"lardan (tillar, mantiq, texnologiya, qiziqish)
// va har bir javob ma'lum yo'nalishlarga ball qo'shadi.
// Savollar tartibi bosqichma-bosqich murakkablashadi.
const questions = [
  {
    id: 'q1',
    subject: 'Qiziqish',
    icon: Sparkles,
    question: "Bo'sh vaqtingizda ko'proq nima bilan shug'ullanishni yoqtirasiz?",
    options: [
      { label: 'Chet el filmlari/seriallarini asl tilida tomosha qilish', points: { ingliz: 2, koreys: 1 } },
      { label: 'Koreys drama va K-pop bilan qiziqish', points: { koreys: 3 } },
      { label: 'Kompyuter o\'yinlari yoki ilovalar bilan ishlash', points: { python: 2, frontend: 2 } },
      { label: 'Yangi narsalar yasash, chizish, dizayn qilish', points: { frontend: 3 } },
    ],
  },
  {
    id: 'q2',
    subject: 'Til',
    icon: Languages,
    question: 'Quyidagi tillardan qaysi biri sizga tabiiy yaqinroq tuyuladi?',
    options: [
      { label: 'Ingliz tili — deyarli hamma joyda kerak bo\'ladi', points: { ingliz: 3 } },
      { label: 'Nemis tili — aniqlik va tartibni yoqtiraman', points: { nemis: 3 } },
      { label: 'Rus tili — allaqachon biroz tushunaman', points: { rus: 3 } },
      { label: 'Hali aniq tanlamadim', points: { ingliz: 1, rus: 1 } },
    ],
  },
  {
    id: 'q3',
    subject: 'Mantiq',
    icon: Brain,
    question: 'Muammoni yechayotganda o\'zingizni qanday his qilasiz?',
    options: [
      { label: 'Bosqichma-bosqich, mantiqiy tartibda yechishni yoqtiraman', points: { python: 3, frontend: 1 } },
      { label: 'Chizib, vizual ko\'rib, keyin qaror qabul qilaman', points: { frontend: 3 } },
      { label: 'Odamlar bilan gaplashib, fikr almashib yechaman', points: { ingliz: 1, koreys: 1, rus: 1 } },
      { label: 'Qat\'iy qoidalarga amal qilib, tizimli harakat qilaman', points: { nemis: 2, python: 1 } },
    ],
  },
  {
    id: 'q4',
    subject: 'Matematika',
    icon: Calculator,
    question: 'Sonlar va formulalar bilan ishlash sizga qanday?',
    options: [
      { label: 'Yoqadi, mantiqiy masalalarni yechishni xohlayman', points: { python: 3 } },
      { label: 'O\'rtacha, lekin qiynalmayman', points: { frontend: 1, nemis: 1 } },
      { label: 'Unchalik emas, so\'z va tillar menga yaqinroq', points: { ingliz: 2, koreys: 1, rus: 1 } },
      { label: 'Aniq bilmayman, hali sinab ko\'rmaganman', points: {} },
    ],
  },
  {
    id: 'q5',
    subject: 'Maqsad',
    icon: Globe2,
    question: 'Kelajakda o\'zingizni qayerda ko\'rasiz?',
    options: [
      { label: 'Xorijda o\'qish yoki ishlash (Yevropa/Amerika)', points: { ingliz: 2, nemis: 2 } },
      { label: 'Janubiy Koreyada o\'qish yoki ishlash', points: { koreys: 3 } },
      { label: 'IT sohasida dasturchi yoki mutaxassis bo\'lish', points: { python: 2, frontend: 2 } },
      { label: 'MDH davlatlari bilan ishlash/muloqot qilish', points: { rus: 3 } },
    ],
  },
  {
    id: 'q6',
    subject: 'Qiyin savol',
    icon: Rocket,
    question:
      'Agar sizga bir vaqtning o\'zida ham qiyin, ham qiziqarli loyiha berilsa — masalan, yangi tilni chuqur o\'rganish YOKI to\'liq ishlaydigan veb-sahifa yaratish kerak bo\'lsa, qaysi birini tanlar edingiz?',
    options: [
      { label: 'Tilni chuqur o\'rganib, muloqot qila olishni afzal ko\'raman', points: { ingliz: 2, koreys: 1, nemis: 1, rus: 1 } },
      { label: 'Veb-sahifa/ilova yarataman — ko\'rinadigan natija muhim', points: { frontend: 3 } },
      { label: 'Backend/mantiqiy qismini yozib, tizimni ishlataman', points: { python: 3 } },
      { label: 'Ikkalasi ham qiziq, lekin til bilan boshlagan bo\'lardim', points: { ingliz: 1, nemis: 1 } },
    ],
  },
];

const resultInfo = {
  ingliz: {
    title: '🇬🇧 Ingliz tili',
    desc: 'Sizda tillarga va xalqaro muloqotga qiziqish yuqori. Ingliz tili sizga ta\'lim, karyera va sayohatda katta eshiklar ochadi.',
  },
  koreys: {
    title: '🇰🇷 Koreys tili',
    desc: 'Koreys madaniyati va tiliga bo\'lgan qiziqishingiz sezilarli. Bu yo\'nalish sizga yangi imkoniyatlar va tajriba beradi.',
  },
  nemis: {
    title: '🇩🇪 Nemis tili',
    desc: 'Siz aniqlik va tizimlilikni yoqtirasiz — bu aynan nemis tili va nemis madaniyatiga mos xususiyat.',
  },
  rus: {
    title: '🇷🇺 Rus tili',
    desc: 'Rus tili sizga mintaqaviy aloqalar va ish imkoniyatlarida katta yordam beradi.',
  },
  python: {
    title: '🐍 Python dasturlash',
    desc: 'Mantiqiy fikrlash va tizimli yondashuv sizning kuchli tomoningiz — bu aynan dasturlash uchun zarur bo\'lgan fazilat.',
  },
  frontend: {
    title: '💻 Frontend dasturlash',
    desc: 'Vizual fikrlash va ijodkorlik sizda yaxshi rivojlangan — foydalanuvchi ko\'radigan chiroyli va qulay interfeyslar yaratish sizga mos.',
  },
};

export default function Quiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0..questions.length-1, questions.length = natija
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);

  const current = questions[step];
  const progress = Math.round((step / questions.length) * 100);

  const handleAnswer = (option) => {
    setAnswers((prev) => ({ ...prev, [current.id]: option }));
    if (step < questions.length - 1) {
      setTimeout(() => setStep((s) => s + 1), 250);
    } else {
      setTimeout(() => setFinished(true), 250);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleRestart = () => {
    setAnswers({});
    setStep(0);
    setFinished(false);
  };

  // Natijani hisoblash: barcha javoblardagi ballarni yig'ib, eng ko'p ball olgan yo'nalishni topamiz
  const computeResult = () => {
    const totals = {};
    Object.values(answers).forEach((opt) => {
      Object.entries(opt.points || {}).forEach(([dir, pts]) => {
        totals[dir] = (totals[dir] || 0) + pts;
      });
    });
    let best = 'ingliz';
    let bestScore = -1;
    Object.entries(totals).forEach(([dir, score]) => {
      if (score > bestScore) {
        best = dir;
        bestScore = score;
      }
    });
    return best;
  };

  const handleGoToRegistration = () => {
    const direction = computeResult();
    navigate('/registration', { state: { suggestedDirection: direction } });
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-primary/20 py-20 md:py-28">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Kasb tanlash testi' }]} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              O'zingizga mos yo'nalishni toping
            </h1>
            <p className="text-white/70 max-w-xl">
              Bir necha oddiy savolga javob bering — sizga eng mos kursni tavsiya qilamiz.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-2xl mx-auto">
          {!finished ? (
            <>
              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-sm text-text-muted mb-2">
                  <span>Savol {step + 1} / {questions.length}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-alt overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="bg-surface border-2 border-border rounded-2xl p-6 md:p-8 shadow-sm"
                >
                  <div className="flex items-center gap-2 text-sky-500 text-xs font-semibold uppercase tracking-wide mb-3">
                    <current.icon className="h-4 w-4" />
                    {current.subject}
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-secondary mb-6">
                    {current.question}
                  </h2>
                  <div className="space-y-3">
                    {current.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(opt)}
                        className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-500/5 ${
                          answers[current.id]?.label === opt.label
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/10'
                            : 'border-border bg-background'
                        }`}
                      >
                        <span className="text-sm md:text-base text-text">{opt.label}</span>
                      </button>
                    ))}
                  </div>

                  {step > 0 && (
                    <button
                      onClick={handleBack}
                      className="mt-6 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" /> Oldingi savol
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center bg-surface border-2 border-border rounded-2xl p-8 md:p-12 shadow-sm"
            >
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <p className="text-sm text-text-muted mb-2">Sizga eng mos yo'nalish:</p>
              <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-4">
                {resultInfo[computeResult()].title}
              </h2>
              <p className="text-text-muted max-w-md mx-auto mb-8 leading-relaxed">
                {resultInfo[computeResult()].desc}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleGoToRegistration}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  Biz bilan birga testlarni oson yeching! <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={handleRestart}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-border text-text-muted hover:text-text hover:border-text-muted/40 font-medium px-6 py-3.5 rounded-xl transition-all"
                >
                  <RotateCcw className="h-4 w-4" /> Qayta topshirish
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
