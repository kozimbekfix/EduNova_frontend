import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

export default function DataTable({
  title,
  data = [],
  loading,
  error,
  columns,
  onAdd: _onAdd,
  onEdit: _onEdit,
  onDelete,
  renderForm,
  searchFields = [],
}) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const filtered = data.filter((item) =>
    searchFields.some((field) =>
      String(item[field] || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleEdit = (item) => {
    setEditing(item);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async (item) => {
    if (deleting === item.id) {
      try {
        await onDelete(item.id);
      } catch (err) {
        console.error('Delete error:', err);
      }
      setDeleting(null);
    } else {
      setDeleting(item.id);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-secondary">{title}</h2>
          <p className="text-sm text-text-muted mt-0.5">
            Total: {data.length}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 w-full sm:w-56"
            />
          </div>
          <button onClick={handleAdd} className="btn-primary whitespace-nowrap">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          {loading ? (
            <LoadingSpinner size="md" />
          ) : error ? (
            <div className="p-6 text-center">
              <AlertCircle className="h-8 w-8 text-error mx-auto mb-2" />
              <p className="text-sm text-error">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-text-muted">
              No data found
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-alt">
                  {columns.map((col) => (
                    <th key={col.key} className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      {col.label}
                    </th>
                  ))}
                  <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-alt/50 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-sm">
                        {col.render ? col.render(item) : item[col.key]}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-all"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className={`p-2 rounded-lg transition-all ${
                            deleting === item.id
                              ? 'text-white bg-error hover:bg-red-600'
                              : 'text-text-muted hover:text-error hover:bg-error/5'
                          }`}
                          title={deleting === item.id ? "Confirm" : "Delete"}
                        >
                          {deleting === item.id ? (
                            <X className="h-4 w-4" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="text-lg font-semibold text-secondary">
                  {editing ? 'Edit' : 'Add new'}
                </h3>
                <button onClick={handleClose} className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-5">
                {renderForm(editing, handleClose)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
