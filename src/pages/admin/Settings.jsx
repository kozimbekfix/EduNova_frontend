import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getSettings, updateSettings } from '../../api/settings';

export default function AdminSettings() {
  const [form, setForm] = useState({
    siteName: '',
    phone: '',
    email: '',
    telegram: '',
    address: '',
    googleMapsUrl: '',
    workHours: '',
    description: '',
    instagram: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getSettings();
        if (data) setForm((prev) => ({ ...prev, ...data }));
      } catch {
        toast.error('Error loading settings');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(form);
      toast.success('Settings saved');
    } catch {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  const sections = [
    { title: 'Basic information', keys: ['siteName', 'description'] },
    { title: 'Aloqa ma\'lumotlari', keys: ['phone', 'email', 'telegram', 'instagram', 'address', 'googleMapsUrl', 'workHours'] },
  ];

  const fieldLabels = {
    siteName: 'Site name',
    description: 'Site description',
    phone: 'Phone',
    email: 'Email',
    telegram: 'Telegram link',
    instagram: 'Instagram link',
    address: 'Address',
    googleMapsUrl: "Google Maps 'Embed a map' link (Map > Share > Embed a map > copy the link)",
    workHours: 'Working hours',
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-secondary">Settings</h2>
        <p className="text-sm text-text-muted mt-0.5">Edit site information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {sections.map((section) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h3 className="text-base font-semibold text-secondary mb-4 pb-3 border-b border-border">
              {section.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.keys.map((key) => (
                <div key={key} className={key.includes('Text') || key === 'description' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    {fieldLabels[key] || key}
                  </label>
                  {key.includes('description') || key.includes('Text') || key === 'address' || key === 'heroDescription' ? (
                    <textarea
                      value={form[key] || ''}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="input-field min-h-[80px]"
                    />
                  ) : (
                    <input
                      type="text"
                      value={form[key] || ''}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="input-field"
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : <><Save className="h-4 w-4" /> Save</>}
          </button>
        </div>
      </form>
    </div>
  );
}
