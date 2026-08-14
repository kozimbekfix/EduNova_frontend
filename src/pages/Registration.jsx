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

// Time slot options
const timeSlots = [
  { value: 'ertalab', label: '☀️ Morning (9:00 - 12:00)' },
  { value: 'kunduzi', label: '🌤️ Afternoon (14:00 - 17:00)' },
  { value: 'kechqurun', label: '🌆 Evening (18:00 - 21:00)' },
];

// Direction options
const directions = [
  { value: 'ingliz', label: '🇬🇧 English' },
  { value: 'koreys', label: '🇰🇷 Korean' },
  { value: 'nemis', label: '🇩🇪 German' },
  { value: 'rus', label: '🇷🇺 Russian' },
  { value: 'python', label: '🐍 Python Programming' },
  { value: 'frontend', label: '💻 Frontend Development' },
];

// Get/create client ID
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

  // Check for an existing application
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

  // If they came from the quiz, notify them about the recommendation
  useEffect(() => {
    if (suggestedDirection) {
      toast.success("A direction was pre-selected based on your quiz result \u2014 feel free to change it.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone) {
      toast.error("Name and phone number are required");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, clientId };
      const result = await submitApplication(payload);
      setExistingApp(result.application);
      toast.success(result.updated ? "Your application has been updated!" : "Your application has been submitted!");
      setSuccess(true);
      setEditMode(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred");
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
      toast.error("Please enter your name and phone number");
      return;
    }
    setStep((prev) => Math.min(prev + 1, 2));
  };

  const handlePrevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // While checking
  if (checkingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-emerald-900/40">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
          <p className="text-gray-400 text-sm">Checking...</p>
        </div>
      </div>
    );
  }

  // Success screen (an existing application was found and has a notification)
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
                <span className="text-emerald-300 text-sm font-semibold">Notification</span>
              </div>
              {existingApp?.notificationMessage && (
                <p className="text-white font-medium text-lg">{existingApp.notificationMessage}</p>
              )}
              {existingApp?.room && (
                <p className="text-emerald-300 text-sm mt-1">🚪 Room: {existingApp.room}</p>
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
            Your application has been submitted! 🎉
          </motion.h2>

          {!hasNotification && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-gray-300 mb-8"
            >
              We'll get in touch with you soon
            </motion.p>
          )}

          {/* Telegram bot message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6 p-4 rounded-2xl bg-[#1e3a5f]/30 border border-[#2a6b8a]/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-5 w-5 text-[#2AABEE]" />
              <span className="text-[#2AABEE] text-sm font-semibold">Telegram notifications</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              To receive admin messages via <span className="text-[#2AABEE] font-medium">Telegram</span>,
              {' '}connect to our bot! 👇
            </p>
            <a
              href={botLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2AABEE]/20 border border-[#2AABEE]/30 text-[#2AABEE] text-sm font-medium hover:bg-[#2AABEE]/30 transition-all"
            >
              <MessageCircle className="h-4 w-4" />
              Go to @{botUsername}
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
              Edit application
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
          <Breadcrumb items={[{ label: "Sign Up" }]} />
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
              <span>{editMode ? "Edit application" : "Sign up for a free lesson"}</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
              {editMode ? "Edit" : "Sign"}
              <br />
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                {editMode ? "application" : "Up"}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-xl leading-relaxed">
              {editMode ? "Update your information" : "Attend the first lesson for free and find the course that suits you best"}
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
                    {s === 1 ? "Personal information" : "Course & time"}
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
                          Personal information
                        </h3>
                        <p className="text-sm text-text-muted">
                          Please enter your name and phone number
                        </p>
                      </motion.div>

                      {/* Full Name */}
                      <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium text-secondary mb-2">
                          Full name <span className="text-error">*</span>
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
                            placeholder="First Last"
                            required
                          />
                          <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] transition-all duration-300 ${focusedField === 'fullName' ? 'text-emerald-500' : 'text-text-muted'}`} />
                          <div className={`absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-all duration-300 ${form.fullName ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-border'}`} />
                        </div>
                      </motion.div>

                      {/* Phone */}
                      <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium text-secondary mb-2">
                          Phone number <span className="text-error">*</span>
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
                          Telegram username <span className="text-text-muted font-normal">(optional)</span>
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
                          So our admin can reach you faster (even if you haven't connected to the bot)
                        </p>
                      </motion.div>

                      {/* Next button */}
                      <motion.div variants={itemVariants} className="pt-2">
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                        >
                          <span>Continue</span>
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
                          Course & time
                        </h3>
                        <p className="text-sm text-text-muted">
                          Choose the direction and time that suit you
                        </p>
                      </motion.div>

                      {/* Direction Selection */}
                      <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium text-secondary mb-3">
                          Choose a direction <span className="text-error">*</span>
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
                          Choose a course (optional)
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
                          Choose a convenient time <span className="text-error">*</span>
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
                          Message <span className="text-text-muted/60">(optional)</span>
                        </label>
                        <div className={`relative transition-all duration-300 ${focusedField === 'message' ? 'scale-[1.01]' : ''}`}>
                          <textarea
                            value={form.message}
                            onChange={(e) => handleChange('message', e.target.value)}
                            onFocus={() => setFocusedField('message')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full rounded-xl border-2 border-border bg-surface pl-11 pr-4 py-3.5 text-sm text-text placeholder:text-text-muted/50 transition-all duration-300 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 min-h-[80px] resize-none"
                            placeholder="Additional information..."
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
                            Cancel
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handlePrevStep}
                            className="flex-1 flex items-center justify-center gap-2 bg-surface-alt text-text font-medium py-3.5 px-6 rounded-xl border-2 border-border hover:border-text-muted/30 transition-all duration-300"
                          >
                            Back
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
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              <span>{editMode ? "Save" : "Submit application"}</span>
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
                    {editMode ? "Your information will be saved" : "Once your application is received, we will contact you shortly"}
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
