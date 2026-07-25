import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, BookOpen, Users, Star, Award, Clock, Shield, Zap,
  CheckCircle, ChevronRight, GraduationCap, Phone, Languages, Code2, HelpCircle, MapPin,
} from 'lucide-react';
import SectionTitle from '../components/SectionTitle';
import LoadingSpinner from '../components/LoadingSpinner';
import { getCourses } from '../api/courses';
import { getTeachers } from '../api/teachers';
import { getReviews } from '../api/reviews';
import { getSettings } from '../api/settings';
import { getBranches } from '../api/branches';
import useLocaleStore from '../store/localeStore';

const galleryImages = [
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80',
];

function AchievementsSwiper() {
  const { t } = useLocaleStore();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const achievements = [
    {
      icon: Languages,
      stat: '850+',
      label: t('achievement.lang.students', "O'quvchi"),
      title: t('achievement.lang.title', 'Chet tillari'),
      sub: 'Ingliz · Koreys · Nemis · Rus',
      items: [
        { label: t('achievement.ielts', 'IELTS 7.0+'), value: '320' },
        { label: t('achievement.topik', 'TOPIK 2+'), value: '200' },
        { label: t('achievement.goethe', 'Goethe'), value: '150' },
        { label: t('achievement.cert', 'Sertifikat'), value: '180' },
      ],
      desc: t('home.achievements.lang.desc', "4 xil chet tilida 850+ o'quvchi xalqaro sertifikatlarga ega bo'ldi. Ingliz, Koreys, Nemis va Rus tillari."),
      bg: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&q=80',
    },
    {
      icon: Code2,
      stat: '200+',
      label: t('achievement.dev.students', 'Dasturchi'),
      title: t('achievement.dev.title', 'Dasturlash'),
      sub: 'Python · Frontend · Web',
      items: [
        { label: t('achievement.job', "Ishga joylashgan"), value: '120' },
        { label: t('achievement.portfolio', 'Portfolio'), value: '180' },
        { label: t('achievement.dev.cert', 'Sertifikat'), value: '200' },
        { label: t('achievement.projects', 'Loyihalar'), value: '300+' },
      ],
      desc: t('home.achievements.dev.desc', "200+ o'quvchi dasturlashni o'rganib, IT sohasida faoliyat yuritmoqda. Python va Frontend yo'nalishlari."),
      bg: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80',
    },
  ];

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % achievements.length);
  }, [achievements.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + achievements.length) % achievements.length);
  }, [achievements.length]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = achievements[current];
  const Icon = slide.icon;

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 400 : -400, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -400 : 400, opacity: 0 }),
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-primary/10">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-5"
        style={{ backgroundImage: `url(${slide.bg})` }}
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="h-full w-full" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="flex items-center">
          <button
            onClick={prev}
            className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10 transition-all mr-6 shrink-0 backdrop-blur-sm"
            aria-label={t('home.hero.prev', 'Oldingi')}
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
          </button>

          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="text-center"
              >
                {/* Badge */}
                <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-xs font-medium text-primary border border-primary/20 mb-4">
                  <Zap className="h-3.5 w-3.5 mr-1.5" />
                  {t('home.hero.badge', "EduNova o'quv markazi")}
                </span>

                {/* Main title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight max-w-4xl mx-auto mt-2">
                  {t('home.hero.title', 'Chet tillari va')}{' '}
                  <span className="text-primary">{t('home.hero.title.highlight', 'dasturlashni')}</span>{' '}
                  {t('home.hero.title.end', "o'rganing")}
                </h1>
                <p className="mt-2 text-sm md:text-base text-gray-300 max-w-2xl mx-auto">
                  {slide.title} — {slide.sub}. {slide.desc}
                </p>

                {/* Buttons */}
                <div className="mt-3 flex flex-wrap justify-center gap-3">
                  <Link to="/registration" className="btn-primary text-sm px-6 py-2.5 shadow-lg shadow-primary/25">
                    {t('home.hero.btn.free', 'Bepul darsga yozilish')} <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link to="/courses" className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 bg-transparent px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:border-white/50">
                    {t('home.hero.btn.courses', "Kurslarni ko'rish")}
                  </Link>
                </div>

                {/* Stats grid */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 max-w-2xl mx-auto">
                  <div className="col-span-2 md:col-span-2 flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/15 text-primary mb-1">
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-white">{slide.stat}</p>
                    <p className="text-xs text-gray-400">{slide.label}</p>
                  </div>
                  {slide.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                      <p className="text-lg md:text-xl font-bold text-primary-light">{item.value}</p>
                      <p className="text-[10px] text-gray-400">{item.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={next}
            className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10 transition-all ml-6 shrink-0 backdrop-blur-sm"
            aria-label={t('home.hero.next', 'Keyingi')}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-4">
          {achievements.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
              className={`transition-all duration-300 rounded-full ${
                i === current
                  ? 'w-10 h-2.5 bg-primary shadow-lg shadow-primary/30'
                  : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`${t('home.hero.slide', 'Slayd')} ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useLocaleStore();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [branches, setBranches] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [coursesData, teachersData, reviewsData, branchesData, settingsData] = await Promise.all([
          getCourses().catch(() => []),
          getTeachers().catch(() => []),
          getReviews().catch(() => []),
          getBranches().catch(() => []),
          getSettings().catch(() => null),
        ]);
        setCourses(coursesData || []);
        setTeachers(teachersData || []);
        setReviews(reviewsData || []);
        setBranches(branchesData || []);
        setSettings(settingsData);
      } catch (err) {
        console.error('Home fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const stats = [
    { label: t('home.stats.students', "O'quvchilar"), value: '500+', icon: Users },
    { label: t('home.stats.courses', 'Kurslar'), value: '20+', icon: BookOpen },
    { label: t('home.stats.experience', 'Tajriba'), value: '10 yil', icon: Clock },
    { label: t('home.stats.awards', 'Mukofotlar'), value: '15+', icon: Award },
  ];

  const advantages = [
    { title: t('home.advantages.modern', "Zamonaviy ta'lim"), desc: t('home.advantages.modern.desc', "Eng so'nggi metodikalar asosida ta'lim"), icon: Zap },
    { title: t('home.advantages.teachers', 'Tajribali ustozlar'), desc: t('home.advantages.teachers.desc', 'Professional va sertifikatlangan o\'qituvchilar'), icon: Star },
    { title: t('home.advantages.schedule', 'Moslashuvchan jadval'), desc: t('home.advantages.schedule.desc', "Sizga qulay vaqtda darslarda qatnashing"), icon: Clock },
    { title: t('home.advantages.quality', 'Sifat kafolati'), desc: t('home.advantages.quality.desc', '100% natija kafolati bilan ta\'lim'), icon: Shield },
  ];

  const faqData = [
    { q: t('home.faq.q1', "Kurslarga qanday yozilish mumkin?"), a: t('home.faq.a1', "Sahifamizdagi 'Ro'yxatdan o'tish' formasini to'ldiring yoki telefon orqali bog'laning.") },
    { q: t('home.faq.q2', "Darslar qanday formatda o'tadi?"), a: t('home.faq.a2', "Darslar online va offline formatda mavjud. Sizga qulay variantni tanlashingiz mumkin.") },
    { q: t('home.faq.q3', "To'lov tizimi qanday?"), a: t('home.faq.a3', "Har oy yoki to'liq kurs uchun to'lov qilishingiz mumkin. Birinchi dars bepul!") },
    { q: t('home.faq.q4', "Sertifikat beriladimi?"), a: t('home.faq.a4', "Ha, kurs yakunida rasmiy sertifikat taqdim etiladi.") },
  ];

  if (loading) return <LoadingSpinner size="lg" text={t('loading.text', 'Yuklanmoqda...')} />;

  return (
    <div>
      {/* Hero + Achievements Wrapper */}
      <AchievementsSwiper />

      {/* Ro'yxatdan o'tish CTA — diqqatni tortishi uchun eng tepaga ko'chirildi */}
      <section className="section-padding bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-white/80" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('home.cta.title', "Hoziroq ro'yxatdan o'ting!")}
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-xl mx-auto">
              {t('home.cta.subtitle', "Birinchi darsga bepul qatnashing va o'zingiz uchun eng mos kursni toping.")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/registration" className="btn-secondary bg-surface text-secondary border-0 hover:bg-gray-100 text-base px-8 py-3.5">
                {t('home.cta.register', "Ro'yxatdan o'tish")}
              </Link>
              <Link to="/contact" className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-3.5 rounded-lg text-base font-semibold transition-all">
                {t('home.cta.contact', "Bog'lanish")}
              </Link>
            </div>
            {settings?.phone && (
              <div className="mt-6">
                <a href={`tel:${settings.phone}`} className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>{settings.phone}</span>
                </a>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Kasb/kurs tanlash viktorinasi banneri */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 to-blue-600 text-white px-8 py-10 md:px-14 md:py-14 flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="absolute -right-10 -bottom-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="relative max-w-xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                {t('home.quiz.title', "O'zingizga mos sohani topishga qiynalyapsizmi?")}
              </h2>
              <p className="text-sky-50/90 text-base leading-relaxed">
                {t('home.quiz.desc', "Ushbu qisqa viktorina sizni qaysi kursni tanlashingizda taklif beradi. Shaxsiy tavsiya olish uchun bir nechta oddiy savollarga javob bering.")}
              </p>
              <Link
                to="/quiz"
                className="mt-6 inline-flex items-center gap-2 bg-white text-sky-600 font-semibold px-6 py-3 rounded-xl hover:bg-sky-50 transition-colors shadow-lg"
              >
                {t('home.quiz.btn', '5 daqiqalik test')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative shrink-0 h-32 w-32 md:h-40 md:w-40 rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center rotate-6">
              <HelpCircle className="h-16 w-16 md:h-20 md:w-20 text-white/90" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Advantages */}
      <section className="section-padding bg-surface-alt">
        <div className="container-custom">
          <SectionTitle title={t('home.advantages.title', 'Nega aynan biz?')} subtitle={t('home.advantages.subtitle', "Bizni tanlashning 4 sababi")} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group card-hover text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-secondary mb-2">{item.title}</h3>
                <p className="text-sm text-text-muted">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionTitle
                title={settings?.aboutTitle || t('about.title', "Biz haqimizda")}
                subtitle={settings?.aboutDescription || t('about.subtitle', "10 yillik tajribaga ega ta'lim markazi")}
                center={false}
              />
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>{settings?.aboutText1 || t('home.about.text1', "Bizning ta'lim markazimiz 2015-yildan beri faoliyat yuritib, minglab o'quvchilarga sifatli ta'lim berib kelmoqda.")}</p>
                <p>{settings?.aboutText2 || t('home.about.text2', "Eng muhimi, biz har bir o'quvchiga individual yondashamiz va ularning muvaffaqiyati uchun barcha sharoitlarni yaratamiz.")}</p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-text-muted">{t('home.about.check1', 'Professional ustozlar')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-text-muted">{t('home.about.check2', "Zamonaviy dasturlar")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-text-muted">{t('home.about.check3', 'Qulay narxlar')}</span>
                </div>
              </div>
              <Link to="/about" className="btn-primary mt-8">
                {t('home.about.more', 'Batafsil')} <ChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80"
                  alt="About"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-primary text-white p-6 rounded-2xl shadow-lg hidden md:block">
                <p className="text-3xl font-bold">10+</p>
                <p className="text-sm text-primary-100">{t('home.about.experience', 'Yillik tajriba')}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Courses */}
      {courses.length > 0 && (
        <section className="section-padding bg-surface-alt">
          <div className="container-custom">
            <SectionTitle title={t('home.courses.title', 'Bizning kurslar')} subtitle={t('home.courses.subtitle', "Eng so'nggi trendlar asosida tuzilgan dasturlar")} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 6).map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group card-hover"
                >
                  {course.image && (
                    <div className="relative -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-2xl h-48">
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-secondary mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-text-muted line-clamp-2 mb-4">
                    {course.description || course.shortDescription || ''}
                  </p>
                  <div className="flex items-center justify-between">
                    {course.price && (
                      <span className="text-lg font-bold text-primary">{course.price}</span>
                    )}
                    <Link to={`/courses/${course.id}`} className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
                      {t('home.courses.details', 'Batafsil')} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
            {courses.length > 6 && (
              <div className="text-center mt-10">
                <Link to="/courses" className="btn-primary">{t('home.courses.all', 'Barcha kurslar')}</Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Teachers */}
      {teachers.length > 0 && (
        <section className="section-padding">
          <div className="container-custom">
            <SectionTitle title={t('home.teachers.title', 'Bizning jamoa')} subtitle={t('home.teachers.subtitle', "Tajribali va professional o'qituvchilar")} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teachers.slice(0, 4).map((teacher, i) => (
                <motion.div
                  key={teacher.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group card-hover text-center"
                >
                  <div className="mx-auto mb-4 h-24 w-24 rounded-full overflow-hidden ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                    {teacher.image ? (
                      <img src={teacher.image} alt={teacher.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                        {teacher.name?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-secondary">{teacher.name}</h3>
                  <p className="text-sm text-text-muted mt-1">{teacher.subject || teacher.position || ''}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Statistics */}
      <section className="section-padding bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 text-white">
                  <stat.icon className="h-6 w-6" />
                </div>
                <p className="text-3xl md:text-4xl font-bold">{stat.value}</p>
                <p className="text-sm text-primary-100 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="section-padding bg-surface-alt">
          <div className="container-custom">
            <SectionTitle title={t('home.reviews.title', "O'quvchilar fikrlari")} subtitle={t('home.reviews.subtitle', 'Ular biz haqimizda shunday deyishadi')} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.slice(0, 3).map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="card"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className={`h-4 w-4 ${j < (review.rating || 5) ? 'fill-accent text-accent' : 'text-border'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed mb-4">"{review.comment || review.text || ''}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {review.name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-secondary">{review.name}</p>
                      <p className="text-xs text-text-muted">{review.position || t('home.reviews.student', "O'quvchi")}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
{/* Filiallar */}
{branches.length > 0 && (
        <section className="section-padding bg-surface-alt">
          <div className="container-custom">
            <SectionTitle title="Filiallarimiz" subtitle="Bizga eng yaqin filialni tanlang" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {branches.slice(0, 2).map((branch, i) => (
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
            {branches.length > 2 && (
              <div className="text-center mt-10">
                <Link to="/location" className="btn-primary">Barcha filiallar</Link>
              </div>
            )}
          </div>
        </section>
      )}
      {/* Gallery */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionTitle title={t('home.gallery.title', 'Galeriya')} subtitle={t('home.gallery.subtitle', 'Markazimizdan lavhalar')} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative overflow-hidden rounded-xl group cursor-pointer ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
              >
                <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover aspect-square group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl">
          <SectionTitle title={t('home.faq.title', "Ko'p beriladigan savollar")} subtitle={t('home.faq.subtitle', "Eng ko'p so'raladigan savollarga javoblar")} />
          <div className="space-y-3">
            {faqData.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left text-sm font-medium text-secondary hover:bg-surface-alt transition-colors"
                >
                  {item.q}
                  <ChevronRight className={`h-5 w-5 text-text-muted transition-transform duration-200 ${openFaq === i ? 'rotate-90' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-text-muted leading-relaxed border-t border-border pt-3">
                    {item.a}
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