import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumb from '../components/Breadcrumb';
import useSettingsStore from '../store/settingsStore';
import { submitApplication } from '../api/applications';

export default function Contact() {
  const { settings } = useSettingsStore();
  const [form, setForm] = useState({ fullName: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone) {
      toast.error("Ism va telefon raqam majburiy");
      return;
    }
    setLoading(true);
    try {
      await submitApplication(form);
      toast.success("Xabaringiz yuborildi!");
      setForm({ fullName: '', phone: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-primary/20 py-20 md:py-28">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Aloqa' }]} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Aloqa</h1>
            <p className="text-lg text-gray-300">Biz bilan bog'laning</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact info */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl font-bold text-secondary mb-6">Bog'lanish ma'lumotlari</h2>
              <div className="space-y-6">
                {settings?.phone && (
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary">Telefon</p>
                      <a href={`tel:${settings.phone}`} className="text-sm text-text-muted hover:text-primary transition-colors">{settings.phone}</a>
                    </div>
                  </div>
                )}
                {settings?.email && (
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary">Email</p>
                      <a href={`mailto:${settings.email}`} className="text-sm text-text-muted hover:text-primary transition-colors">{settings.email}</a>
                    </div>
                  </div>
                )}
                {settings?.address && (
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary">Manzil</p>
                      <p className="text-sm text-text-muted">{settings.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Contact form */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl font-bold text-secondary mb-6">Xabar yuborish</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Ismingiz *</label>
                  <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field" placeholder="Ismingiz" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Telefon *</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="+998 XX XXX XX XX" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Xabar</label>
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field min-h-[120px]" placeholder="Xabaringiz..." />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                  {loading ? 'Yuborilmoqda...' : <><Send className="h-4 w-4" /> Xabar yuborish</>}
                </button>
              </form>
            </motion.div>
          </div>

          {settings?.googleMapsUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 rounded-2xl overflow-hidden border-2 border-border"
            >
              <iframe
                src={settings.googleMapsUrl}
                width="100%"
                height="380"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps - manzil"
              />
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
