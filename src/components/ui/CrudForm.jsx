import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function CrudForm({
  fields = [],
  initialData = null,
  onSubmit,
  onClose,
}) {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      const initial = {};
      fields.forEach((f) => {
        initial[f.key] = initialData[f.key] || '';
      });
      setForm(initial);
    } else {
      const initial = {};
      fields.forEach((f) => {
        initial[f.key] = f.defaultValue || '';
      });
      setForm(initial);
    }
  }, [initialData, fields]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(initialData?.id, form);
      toast.success(initialData ? 'Yangilandi' : "Qo'shildi");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-secondary mb-1">
            {field.label} {field.required && <span className="text-error">*</span>}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              value={form[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="input-field min-h-[80px]"
              placeholder={field.placeholder || field.label}
              required={field.required}
            />
          ) : field.type === 'select' ? (
            <select
              value={form[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="input-field"
              required={field.required}
            >
              <option value="">{field.placeholder || 'Tanlang'}</option>
              {(field.options || []).map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type || 'text'}
              value={form[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="input-field"
              placeholder={field.placeholder || field.label}
              required={field.required}
            />
          )}
        </div>
      ))}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-ghost">Bekor qilish</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saqlanmoqda...' : initialData ? 'Yangilash' : 'Qo\'shish'}
        </button>
      </div>
    </form>
  );
}
