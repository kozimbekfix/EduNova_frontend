import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, Sparkles, RotateCcw,
  Languages, Globe2, Calculator, Brain, Rocket,
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';

// Each question comes from a different "subject" (languages, logic, technology, interests)
// and each answer adds points toward certain directions.
// The questions gradually increase in complexity.
const questions = [
  {
    id: 'q1',
    subject: 'Interests',
    icon: Sparkles,
    question: "What do you enjoy doing most in your free time?",
    options: [
      { label: 'Watching foreign movies/series in their original language', points: { ingliz: 2, koreys: 1 } },
      { label: 'Following Korean dramas and K-pop', points: { koreys: 3 } },
      { label: 'Working with computer games or apps', points: { python: 2, frontend: 2 } },
      { label: 'Creating, drawing, or designing new things', points: { frontend: 3 } },
    ],
  },
  {
    id: 'q2',
    subject: 'Language',
    icon: Languages,
    question: 'Which of the following languages feels most natural to you?',
    options: [
      { label: 'English — it\'s useful almost everywhere', points: { ingliz: 3 } },
      { label: 'German — I like precision and order', points: { nemis: 3 } },
      { label: 'Russian — I already understand a bit', points: { rus: 3 } },
      { label: "I haven't decided yet", points: { ingliz: 1, rus: 1 } },
    ],
  },
  {
    id: 'q3',
    subject: 'Logic',
    icon: Brain,
    question: 'How do you feel when solving a problem?',
    options: [
      { label: 'I like solving it step by step, in a logical order', points: { python: 3, frontend: 1 } },
      { label: 'I sketch it out, look at it visually, then decide', points: { frontend: 3 } },
      { label: 'I talk it through with others and exchange ideas', points: { ingliz: 1, koreys: 1, rus: 1 } },
      { label: 'I follow strict rules and act systematically', points: { nemis: 2, python: 1 } },
    ],
  },
  {
    id: 'q4',
    subject: 'Math',
    icon: Calculator,
    question: 'How do you feel about working with numbers and formulas?',
    options: [
      { label: 'I like it, I enjoy solving logical problems', points: { python: 3 } },
      { label: "Average, but I don't struggle with it", points: { frontend: 1, nemis: 1 } },
      { label: "Not really, words and languages come more naturally to me", points: { ingliz: 2, koreys: 1, rus: 1 } },
      { label: "Not sure, I haven't really tried yet", points: {} },
    ],
  },
  {
    id: 'q5',
    subject: 'Goal',
    icon: Globe2,
    question: 'Where do you see yourself in the future?',
    options: [
      { label: 'Studying or working abroad (Europe/USA)', points: { ingliz: 2, nemis: 2 } },
      { label: 'Studying or working in South Korea', points: { koreys: 3 } },
      { label: 'Working as a developer or IT specialist', points: { python: 2, frontend: 2 } },
      { label: 'Working/communicating with CIS countries', points: { rus: 3 } },
    ],
  },
  {
    id: 'q6',
    subject: 'A tough question',
    icon: Rocket,
    question:
      'If you were given a project that is both difficult and interesting at the same time — for example, deeply learning a new language OR building a fully working website — which would you choose?',
    options: [
      { label: "I'd rather deeply learn a language and be able to communicate", points: { ingliz: 2, koreys: 1, nemis: 1, rus: 1 } },
      { label: "I'd build a website/app — a visible result matters to me", points: { frontend: 3 } },
      { label: "I'd write the backend/logic and get the system running", points: { python: 3 } },
      { label: "Both are interesting, but I'd start with the language", points: { ingliz: 1, nemis: 1 } },
    ],
  },
];

const resultInfo = {
  ingliz: {
    title: '🇬🇧 English',
    desc: 'You have a strong interest in languages and international communication. English will open big doors for you in education, career, and travel.',
  },
  koreys: {
    title: '🇰🇷 Korean',
    desc: 'Your interest in Korean culture and language really stands out. This path will bring you new opportunities and experiences.',
  },
  nemis: {
    title: '🇩🇪 German',
    desc: 'You like precision and structure — a trait that fits well with the German language and culture.',
  },
  rus: {
    title: '🇷🇺 Russian',
    desc: 'Russian will help you a lot with regional connections and job opportunities.',
  },
  python: {
    title: '🐍 Python Programming',
    desc: 'Logical thinking and a systematic approach are your strengths — exactly what programming requires.',
  },
  frontend: {
    title: '💻 Frontend Development',
    desc: 'You have strong visual thinking and creativity — building beautiful, user-friendly interfaces suits you well.',
  },
};

export default function Quiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0..questions.length-1, questions.length = result
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

  // Compute the result: sum up points from all answers and find the direction with the highest score
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
          <Breadcrumb items={[{ label: 'Career quiz' }]} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Find the right direction for you
            </h1>
            <p className="text-white/70 max-w-xl">
              Answer a few simple questions — we'll recommend the course that suits you best.
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
                  <span>Question {step + 1} / {questions.length}</span>
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
                      <ArrowLeft className="h-4 w-4" /> Previous question
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
              <p className="text-sm text-text-muted mb-2">The best fit for you is:</p>
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
                  Sign up and get started with us! <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={handleRestart}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-border text-text-muted hover:text-text hover:border-text-muted/40 font-medium px-6 py-3.5 rounded-xl transition-all"
                >
                  <RotateCcw className="h-4 w-4" /> Retake the quiz
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
