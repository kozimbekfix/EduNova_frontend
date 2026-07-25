import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, CheckCircle, User, Phone, BookOpen, MessageSquare,
  Sparkles, ArrowRight, Edit3, RefreshCw,
  Clock3, Bell, MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumb from '../components/Breadcrumb';
import useSettingsStore from '../store/settingsStore';
import { submitApplication, checkMyApplication } from '../api/applications';
import { getCourses } from '../api/courses';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const successVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const particles = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 4 + Math.random() * 8,
  duration: 3 + Math.random() * 4,
  delay: Math.random() * 2,
}));

// Vaqt variantlari
const timeSlots = [
  { value: 'ertalab', label: '☀️ Ertalab (9:00 - 12:00)' },
  { value: 'kunduzi', label: '🌤️ Kunduzi (14:00 - 17:00)' },
  { value: 'kechqurun', label: '🌆 Kechqurun (18:00 - 21:00)' },
];

// Yo'nalish variantlari
const directions = [
  { value: 'ingliz', label: '🇬🇧 Ingliz tili' },
  { value: 'koreys', label: '🇰🇷 Koreys tili' },
  { value: 'nemis', label: '🇩🇪 Nemis tili' },
  { value: 'rus', label: '🇷🇺 Rus tili' },
  { value: 'python', label: '🐍 Python dasturlash' },
  { value: 'frontend', label: '💻 Frontend dasturlash' },
];

// Client ID ni olish/yaratish
function getClientId() {
  let id = localStorage.getItem('edunova_client_id');
  if (!id) {
    id = 'client_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('edunova_client_id', id);
  }
  return id;
}

export default function Registration() {
  const location = useLocation();
  const suggestedDirection = location.state?.suggestedDirection;
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ fullName: '', phone: '', telegramUsername: '', courseName: '', direction: suggestedDirection || '', preferredTime: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [step, setStep] = useState(1);
  const [existingApp, setExistingApp] = useState(null);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const { settings } = useSettingsStore();
  const botUsername = settings?.botUsername || 'edunova_bot';
  const botLink = settings?.botLink || 'https://t.me/edunova_bot';

  const clientId = getClientId();

  // Mavjud arizani tekshirish
  useEffect(() => {
    async function checkExisting() {
      try {
        const result = await checkMyApplication(clientId);
        if (result?.exists && result?.application) {
          const app = result.application;
          setExistingApp(app);
          setForm({
            fullName: app.fullName || '',
            phone: app.phone || '',
            telegramUsername: app.telegramUsername || '',
            courseName: app.courseName || '',
            direction: app.direction || '',
            preferredTime: app.preferredTime || '',
            message: app.message || '',
          });
          if (app.notificationMessage || app.room) {
            setSuccess(true);
          }
        }
      } catch (err) {
        console.log('Check existing error:', err);
      } finally {
        setCheckingExisting(false);
      }
    }
    checkExisting();
  }, [clientId]);

  useEffect(() => {
    getCourses().then(setCourses).catch(() => {});
  }, []);

  // Test orqali kelgan bo'lsa, tavsiya haqida bildirishnoma
  useEffect(() => {
    if (suggestedDirection) {
      toast.success("Test natijasiga ko'ra yo'nalish tanlab qo'yildi \u2014 xohlasangiz o'zgartirishingiz mumkin.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone) {
      toast.error("Ism va telefon raqam majburiy");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, clientId };
      const result = await submitApplication(payload);
      setExistingApp(result.application);
      toast.success(result.updated ? "Arizangiz yangilandi!" : "Arizangiz qabul qilindi!");
      setSuccess(true);
      setEditMode(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setSuccess(false);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setSuccess(true);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (step === 1 && (!form.fullName || !form.phone)) {
      toast.error("Iltimos, ism va telefon raqamingizni kiriting");
      return;
    }
    setStep((prev) => Math.min(prev + 1, 2));
  };

  const handlePrevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // Yuklanayotgan bo'lsa
  if (checkingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-emerald-900/40">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
          <p className="text-gray-400 text-sm">Tekshirilmoqda...</p>
        </div>
      </div>
    );
  }

  // Success screen (mavjud ariza topilgan va notification bor)
  if (success && !editMode) {
    const hasNotification = existingApp?.notificationMessage || existingApp?.room;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-emerald-900/40 relative overflow-hidden">
        {/* Floating particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-emerald-400/20"
            style={{
              width: p.size * 3,
              height: p.size * 3,
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
          />
        ))}

        <motion.div
          variants={successVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center max-w-lg mx-auto px-6"
        >
          {/* Notification banner */}
          {hasNotification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <Bell className="h-5 w-5 text-emerald-400" />
                <span className="text-emerald-300 text-sm font-semibold">Xabarnoma</span>
              </div>
              {existingApp?.notificationMessage && (
                <p className="text-white font-medium text-lg">{existingApp.notificationMessage}</p>
              )}
              {existingApp?.room && (
                <p className="text-emerald-300 text-sm mt-1">🚪 Xona: {existingApp.room}</p>
              )}
            </motion.div>
          )}

          {/* Success icon */}
          <div className="relative mx-auto mb-8 w-28 h-28">
            <motion.div
              className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-2 rounded-full bg-emerald-400/10"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
            />
            <div className="relative z-10 w-full h-full flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-2xl shadow-emerald-500/30">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Arizangiz qabul qilindi! 🎉
          </motion.h2>

          {!hasNotification && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-gray-300 mb-8"
            >
              Tez orada siz bilan bog'lanamiz
            </motion.p>
          )}

          {/* Telegram bot xabari */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6 p-4 rounded-2xl bg-[#1e3a5f]/30 border border-[#2a6b8a]/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-5 w-5 text-[#2AABEE]" />
              <span className="text-[#2AABEE] text-sm font-semibold">Telegram xabarnoma</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Admin xabarlarini <span className="text-[#2AABEE] font-medium">Telegram</span> orqali olish uchun
              {' '}botimizga ulaning! 👇
            </p>
            <a
              href={botLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2AABEE]/20 border border-[#2AABEE]/30 text-[#2AABEE] text-sm font-medium hover:bg-[#2AABEE]/30 transition-all"
            >
              <MessageCircle className="h-4 w-4" />
              @{botUsername} ga o'tish
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-3"
          >
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-400">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                <User className="h-3.5 w-3.5 text-emerald-400" />
                <span>{form.fullName}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                <Phone className="h-3.5 w-3.5 text-emerald-400" />
                <span>{form.phone}</span>
              </div>
              {form.courseName && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                  <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{form.courseName}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-400">
              {form.direction && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                  <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{form.direction}</span>
                </div>
              )}
              {form.preferredTime && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                  <Clock3 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{form.preferredTime}</span>
                </div>
              )}
            </div>

            {/* Edit button */}
            <button
              onClick={handleEdit}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all"
            >
              <Edit3 className="h-4 w-4" />
              Arizani o'zgartirish
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[50vh] md:min-h-[55vh] flex items-center bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-emerald-900/30 overflow-hidden">
        {/* Animated background blobs */}
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 45, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-blue-500/8 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Floating orbs */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.slice(0, 4).map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-white/[0.03]"
              style={{
                width: p.size * 5,
                height: p.size * 5,
                left: `${p.x}%`,
                top: `${p.y}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <div className="relative z-10 w-full container-custom px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <Breadcrumb items={[{ label: "Ro'yxatdan o'tish" }]} />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-medium mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{editMode ? "Arizani o'zgartirish" : "Bepul darsga yoziling"}</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
              {editMode ? "Arizani" : "Ro'yxatdan"}
              <br />
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                {editMode ? "o'zgartirish" : "o'tish"}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-xl leading-relaxed">
              {editMode ? "Ma'lumotlaringizni yangilang" : "Birinchi darsga bepul qatnashing va o'zingiz uchun eng mos kursni toping"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== FORM SECTION ===== */}
      <section className="relative -mt-16 md:-mt-20 pb-20">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            className="max-w-3xl mx-auto"
          >
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-3 mb-10">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <div
                    className={`relative flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300 ${
                      s < step
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : s === step
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-surface-alt text-text-muted border border-border'
                    }`}
                  >
                    {s < step ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      s
                    )}
                    {s === step && (
                      <motion.span
                        layoutId="step-pulse"
                        className="absolute inset-0 rounded-full ring-2 ring-emerald-400/40"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${s <= step ? 'text-secondary' : 'text-text-muted'}`}>
                    {s === 1 ? "Shaxsiy ma'lumotlar" : "Kurs va vaqt"}
                  </span>
                  {s === 1 && <ArrowRight className="h-4 w-4 text-text-muted hidden sm:block" />}
                </div>
              ))}
            </div>

            {/* Form card */}
            <div className="relative">
              {/* Decorative bg */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-transparent to-emerald-500/20 rounded-3xl blur-2xl" />

              <form
                onSubmit={handleSubmit}
                className="relative bg-surface rounded-3xl shadow-2xl border border-border/50 p-6 sm:p-8 md:p-10 overflow-hidden"
              >
                {/* Top decorative line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" />

                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div
                      key="step1"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: -30 }}
                      className="space-y-6"
                    >
                      <motion.div variants={itemVariants}>
                        <h3 className="text-xl font-bold text-secondary mb-1">
                          Shaxsiy ma'lumotlar
                        </h3>
                        <p className="text-sm text-text-muted">
                          Iltimos, ism va telefon raqamingizni kiriting
                        </p>
                      </motion.div>

                      {/* Full Name */}
                      <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium text-secondary mb-2">
                          To'liq ismingiz <span className="text-error">*</span>
                        </label>
                        <div className={`relative group transition-all duration-300 ${focusedField === 'fullName' ? 'scale-[1.01]' : ''}`}>
                          <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 transition-opacity duration-300 ${focusedField === 'fullName' ? 'opacity-100' : 'opacity-0'}`} />
                          <input
                            type="text"
                            value={form.fullName}
                            onChange={(e) => handleChange('fullName', e.target.value)}
                            onFocus={() => setFocusedField('fullName')}
                            onBlur={() => setFocusedField(null)}
                            className="relative w-full rounded-xl border-2 border-border bg-surface pl-11 pr-4 py-3.5 text-sm text-text placeholder:text-text-muted/50 transition-all duration-300 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
                            placeholder="Ism Familiya"
                            required
                          />
                          <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] transition-all duration-300 ${focusedField === 'fullName' ? 'text-emerald-500' : 'text-text-muted'}`} />
                          <div className={`absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-all duration-300 ${form.fullName ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-border'}`} />
                        </div>
                      </motion.div>

                      {/* Phone */}
                      <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium text-secondary mb-2">
                          Telefon raqam <span className="text-error">*</span>
                        </label>
                        <div className={`relative group transition-all duration-300 ${focusedField === 'phone' ? 'scale-[1.01]' : ''}`}>
                          <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 transition-opacity duration-300 ${focusedField === 'phone' ? 'opacity-100' : 'opacity-0'}`} />
                          <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField(null)}
                            className="relative w-full rounded-xl border-2 border-border bg-surface pl-11 pr-4 py-3.5 text-sm text-text placeholder:text-text-muted/50 transition-all duration-300 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
                            placeholder="+998 XX XXX XX XX"
                            required
                          />
                          <Phone className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] transition-all duration-300 ${focusedField === 'phone' ? 'text-emerald-500' : 'text-text-muted'}`} />
                          <div className={`absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-all duration-300 ${form.phone ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-border'}`} />
                        </div>
                      </motion.div>

                      {/* Telegram username */}
                      <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium text-secondary mb-2">
                          Telegram username <span className="text-text-muted font-normal">(ixtiyoriy)</span>
                        </label>
                        <div className={`relative group transition-all duration-300 ${focusedField === 'telegramUsername' ? 'scale-[1.01]' : ''}`}>
                          <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 transition-opacity duration-300 ${focusedField === 'telegramUsername' ? 'opacity-100' : 'opacity-0'}`} />
                          <input
                            type="text"
                            value={form.telegramUsername}
                            onChange={(e) => handleChange('telegramUsername', e.target.value.replace(/^@/, ''))}
                            onFocus={() => setFocusedField('telegramUsername')}
                            onBlur={() => setFocusedField(null)}
                            className="relative w-full rounded-xl border-2 border-border bg-surface pl-11 pr-4 py-3.5 text-sm text-text placeholder:text-text-muted/50 transition-all duration-300 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
                            placeholder="@username"
                          />
                          <Send className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] transition-all duration-300 ${focusedField === 'telegramUsername' ? 'text-emerald-500' : 'text-text-muted'}`} />
                        </div>
                        <p className="mt-1.5 text-xs text-text-muted">
                          Admin siz bilan tezroq bog'lanishi uchun (botga ulanmagan bo'lsangiz ham)
                        </p>
                      </motion.div>

                      {/* Next button */}
                      <motion.div variants={itemVariants} className="pt-2">
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                        >
                          <span>Davom etish</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step2"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: 30 }}
                      className="space-y-6"
                    >
                      <motion.div variants={itemVariants}>
                        <h3 className="text-xl font-bold text-secondary mb-1">
                          Kurs va vaqt
                        </h3>
                        <p className="text-sm text-text-muted">
                          O'zingizga mos yo'nalish va vaqtni tanlang
                        </p>
                      </motion.div>

                      {/* Direction Selection */}
                      <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium text-secondary mb-3">
                          Yo'nalishni tanlang <span className="text-error">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {directions.map((dir) => (
                            <motion.button
                              key={dir.value}
                              type="button"
                              onClick={() => handleChange('direction', dir.value)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`p-3 rounded-xl border-2 text-left transition-all duration-300 ${
                                form.direction === dir.value
                                  ? 'border-emerald-400 bg-emerald-400/5 shadow-md shadow-emerald-400/10'
                                  : 'border-border bg-surface hover:border-emerald-400/30'
                              }`}
                            >
                              <span className={`text-sm font-medium ${form.direction === dir.value ? 'text-emerald-600 dark:text-emerald-400' : 'text-secondary'}`}>
                                {dir.label}
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>

                      {/* Course Selection */}
                      <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium text-secondary mb-3">
                          Kursni tanlang (ixtiyoriy)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(courses || []).map((course) => (
                            <motion.button
                              key={course.id}
                              type="button"
                              onClick={() => handleChange('courseName', course.title)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`p-3 rounded-xl border-2 text-left transition-all duration-300 ${
                                form.courseName === course.title
                                  ? 'border-emerald-400 bg-emerald-400/5 shadow-md'
                                  : 'border-border bg-surface hover:border-emerald-400/30'
                              }`}
                            >
                              <span className={`text-sm font-medium ${form.courseName === course.title ? 'text-emerald-600 dark:text-emerald-400' : 'text-secondary'}`}>
                                {course.title}
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>

                      {/* Preferred Time */}
                      <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium text-secondary mb-3">
                          Qulay vaqtni tanlang <span className="text-error">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {timeSlots.map((slot) => (
                            <motion.button
                              key={slot.value}
                              type="button"
                              onClick={() => handleChange('preferredTime', slot.label)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`p-3 rounded-xl border-2 text-center transition-all duration-300 ${
                                form.preferredTime === slot.label
                                  ? 'border-emerald-400 bg-emerald-400/5 shadow-md'
                                  : 'border-border bg-surface hover:border-emerald-400/30'
                              }`}
                            >
                              <span className={`text-sm font-medium ${form.preferredTime === slot.label ? 'text-emerald-600 dark:text-emerald-400' : 'text-secondary'}`}>
                                {slot.label}
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>

                      {/* Message */}
                      <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium text-secondary mb-2">
                          Xabar <span className="text-text-muted/60">(ixtiyoriy)</span>
                        </label>
                        <div className={`relative transition-all duration-300 ${focusedField === 'message' ? 'scale-[1.01]' : ''}`}>
                          <textarea
                            value={form.message}
                            onChange={(e) => handleChange('message', e.target.value)}
                            onFocus={() => setFocusedField('message')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full rounded-xl border-2 border-border bg-surface pl-11 pr-4 py-3.5 text-sm text-text placeholder:text-text-muted/50 transition-all duration-300 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 min-h-[80px] resize-none"
                            placeholder="Qo'shimcha ma'lumot..."
                          />
                          <MessageSquare className={`absolute left-3.5 top-4 h-[18px] w-[18px] transition-all duration-300 ${focusedField === 'message' ? 'text-emerald-500' : 'text-text-muted'}`} />
                        </div>
                      </motion.div>

                      {/* Action buttons */}
                      <motion.div variants={itemVariants} className="flex items-center gap-3 pt-2">
                        {editMode ? (
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="flex-1 flex items-center justify-center gap-2 bg-surface-alt text-text font-medium py-3.5 px-6 rounded-xl border-2 border-border hover:border-text-muted/30 transition-all duration-300"
                          >
                            Bekor qilish
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handlePrevStep}
                            className="flex-1 flex items-center justify-center gap-2 bg-surface-alt text-text font-medium py-3.5 px-6 rounded-xl border-2 border-border hover:border-text-muted/30 transition-all duration-300"
                          >
                            Ortga
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0"
                        >
                          {loading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                              />
                              <span>Yuborilmoqda...</span>
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              <span>{editMode ? "Saqlash" : "Arizani yuborish"}</span>
                            </>
                          )}
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer note */}
                <div className="mt-6 pt-4 border-t border-border/50">
                  <p className="text-xs text-text-muted/60 text-center">
                    {editMode ? "Ma'lumotlaringiz saqlanadi" : "Arizangiz qabul qilingandan so'ng, siz bilan tez orada bog'lanamiz"}
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
