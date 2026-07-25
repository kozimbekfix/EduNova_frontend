import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, Bell, DoorOpen } from 'lucide-react';
import useLocaleStore from '../store/localeStore';

// Registration.jsx bilan bir xil clientId — shu orqali chat va ariza bog'lanadi
function getClientId() {
  let id = localStorage.getItem('edunova_client_id');
  if (!id) {
    id = 'client_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('edunova_client_id', id);
  }
  return id;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [notification, setNotification] = useState(null);
  const { t, locale } = useLocaleStore();

  // Check notification from user's application
  useEffect(() => {
    const clientId = localStorage.getItem('edunova_client_id');
    if (!clientId) return;

    const fetchNotification = () => {
      fetch(`/api/applications/my/${clientId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.exists && data?.application) {
            const app = data.application;
            if (app.notificationMessage || app.room) {
              setNotification({
                message: app.notificationMessage,
                room: app.room,
              });
            }
          }
        })
        .catch(() => {});
    };

    // Initial fetch
    fetchNotification();

    // Poll every 30 seconds
    const interval = setInterval(fetchNotification, 30000);
    return () => clearInterval(interval);
  }, [locale]);

  // Reset welcome message when locale changes
  useEffect(() => {
    setMessages([{ role: 'bot', text: t('chatbot.welcome', "Salom! 👋 Men EduNova AI yordamchisiman.") }]);
  }, [locale, t]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setHasInteracted(true);

    const updatedMessages = [...messages, { role: 'user', text }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const clientId = getClientId();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: updatedMessages.slice(0, -1), // oldingi xabarlar (yangisisiz)
          clientId,
        }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { role: 'bot', text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'bot', text: t('chatbot.error', "Kechirasiz, hozir javob bera olmayman. Keyinroq urinib ko'ring.") },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: t('chatbot.error2', "Uzr, xatolik yuz berdi. Iltimos keyinroq urinib ko'ring.") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 scale-100'
        }`}
        style={{
          background: 'linear-gradient(135deg, #059669, #047857)',
        }}
        aria-label="AI yordamchi"
      >
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.5 }}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </motion.div>

      </button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-32px)] sm:w-[380px] h-[70vh] sm:h-[560px] max-h-[600px] flex flex-col rounded-2xl shadow-2xl border border-emerald-500/20 overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
            }}
          >
            {/* Header */}
            <div className="flex-shrink-0">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-emerald-600/20 to-emerald-500/10">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-white">EduNova AI</p>
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-[11px] text-gray-400">{t('chatbot.online', 'Online')}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Notification banner */}
              {notification && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="px-4 py-3 bg-emerald-500/10 border-b border-emerald-500/20"
                >
                  <div className="flex items-start gap-2">
                    <Bell className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      {notification.message && (
                        <p className="text-sm text-emerald-300 font-medium">
                          {notification.message}
                        </p>
                      )}
                      {notification.room && (
                        <p className="text-xs text-emerald-400/80 mt-0.5 flex items-center gap-1">
                          <DoorOpen className="h-3 w-3" />
                          Xona: {notification.room}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i === messages.length - 1 && !hasInteracted ? 0.3 : 0 }}
                  className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-500/15 text-white border border-emerald-500/20'
                        : 'bg-white/5 text-gray-200 border border-white/10'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-black/20">
              <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 px-4 py-2 focus-within:border-emerald-500/40 focus-within:bg-white/10 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('chatbot.placeholder', "Xabaringizni yozing...")}
                  className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[10px] text-gray-600 text-center mt-2">
                {t('chatbot.powered', 'Powered by')} <span className="text-emerald-400/60">Groq AI</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
