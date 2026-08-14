import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, XCircle, Eye, Trash2, X, Send, Bell, DoorOpen,
  Clock, BookOpen, MessageSquare, User, Phone, CheckCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useFetch } from '../../hooks/useFetch';
import { getApplications, updateApplicationStatus, deleteApplication, notifyApplication } from '../../api/applications';

const statusColors = {
  'new': 'badge-primary',
  'read': 'badge-warning',
  'accepted': 'badge-success',
  'rejected': 'badge-error',
};

const statusLabels = {
  'new': '🆕 New',
  'read': '👁️ Read',
  'accepted': '✅ Accepted',
  'rejected': '❌ Rejected',
};

export default function AdminApplications() {
  const { data, loading, error, refetch } = useFetch(getApplications);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [notifying, setNotifying] = useState(null);
  const [notifyForm, setNotifyForm] = useState({ notificationMessage: '', room: '' });
  const [sendingNotify, setSendingNotify] = useState(false);

  const filtered = (data || []).filter((a) =>
    a.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    a.phone?.includes(search) ||
    a.courseName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatus = async (id, status) => {
    try {
      await updateApplicationStatus(id, status);
      toast.success(`Status: ${statusLabels[status] || status}`);
      refetch();
    } catch {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (deleting === id) {
      try {
        await deleteApplication(id);
        toast.success('Deleted');
        refetch();
      } catch {
        toast.error('An error occurred');
      }
      setDeleting(null);
    } else {
      setDeleting(id);
    }
  };

  const handleNotify = async (id) => {
    setSendingNotify(true);
    try {
      const result = await notifyApplication(id, notifyForm);
      if (result.telegramSent) {
        toast.success('✅ Message sent via Telegram!');
      } else {
        toast.success('Message sent! The user will see it on the site');
      }
      setNotifying(null);
      setNotifyForm({ notificationMessage: '', room: '' });
      refetch();
    } catch {
      toast.error('An error occurred');
    } finally {
      setSendingNotify(false);
    }
  };

  const openNotify = (app) => {
    setNotifyForm({
      notificationMessage: app.notificationMessage || '',
      room: app.room || '',
    });
    setNotifying(app);
  };

  // Automatically switch to "read" status when the view button is clicked
  const handleView = (app) => {
    setViewing(viewing?.id === app.id ? null : app);
    if (app.status === 'new') {
      handleStatus(app.id, 'read');
    }
  };

  const getDirectionLabel = (val) => {
    const map = {
      'ingliz': '🇬🇧 English',
      'koreys': '🇰🇷 Korean',
      'nemis': '🇩🇪 German',
      'rus': '🇷🇺 Russian',
      'python': '🐍 Python',
      'frontend': '💻 Frontend',
    };
    return map[val] || val || '-';
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-secondary">Applications</h2>
          <p className="text-sm text-text-muted mt-0.5">
            Total: {(data || []).length}
            {' | '}
            <span className="text-primary font-medium">
              {(data || []).filter((a) => a.status === 'new').length} new
            </span>
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 w-full"
          />
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <LoadingSpinner size="md" />
        ) : error ? (
          <div className="p-6 text-center text-sm text-error">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-sm text-text-muted">No applications found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-alt">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">Name / Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">Direction</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">Time</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((app) => (
                  <tr
                    key={app.id}
                    className={`hover:bg-surface-alt/50 transition-colors ${
                      app.status === 'new' ? 'bg-primary/5' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{app.fullName}</p>
                        {app.status === 'new' && (
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-text-muted">{app.phone}</p>
                      {app.courseName && app.courseName !== "Not specified" && (
                        <p className="text-xs text-primary mt-0.5">{app.courseName}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{getDirectionLabel(app.direction)}</td>
                    <td className="px-4 py-3 text-sm text-text-muted">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{app.preferredTime || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={statusColors[app.status] || 'badge-primary'}>
                          {statusLabels[app.status] || app.status}
                        </span>
                        {app.notificationMessage && (
                          <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                            <Bell className="h-3 w-3" />
                            Message sent
                          </span>
                        )}
                        {app.room && (
                          <span className="text-[10px] text-primary flex items-center gap-1">
                            <DoorOpen className="h-3 w-3" />
                            Room: {app.room}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-muted">
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-US') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* View button - marks as read on first click */}
                        <button
                          onClick={() => handleView(app)}
                          className={`p-2 rounded-lg transition-all ${
                            app.status === 'new'
                              ? 'text-primary bg-primary/10 hover:bg-primary/20'
                              : 'text-text-muted hover:text-primary hover:bg-primary/5'
                          }`}
                          title={app.status === 'new' ? "Mark as read" : "View"}
                        >
                          {app.status === 'new' ? (
                            <CheckCheck className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>

                        {/* Send message (only if read or accepted) */}
                        {['new', 'read', 'reviewed'].includes(app.status) && (
                          <button
                            onClick={() => openNotify(app)}
                            className="p-2 rounded-lg text-text-muted hover:text-emerald-500 hover:bg-emerald-500/5 transition-all"
                            title="Send message"
                          >
                            <Bell className="h-4 w-4" />
                          </button>
                        )}

                        {/* Mark as read - directly via notify */}
                        {['new'].includes(app.status) && (
                          <button
                            onClick={() => handleStatus(app.id, 'read')}
                            className="p-2 rounded-lg text-text-muted hover:text-warning hover:bg-warning/5 transition-all"
                            title="Mark as read"
                          >
                            <CheckCheck className="h-4 w-4" />
                          </button>
                        )}

                        {/* Reject */}
                        {['new', 'read'].includes(app.status) && (
                          <button
                            onClick={() => handleStatus(app.id, 'rejected')}
                            className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-error/5 transition-all"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(app.id)}
                          className={`p-2 rounded-lg transition-all ${
                            deleting === app.id
                              ? 'text-white bg-error'
                              : 'text-text-muted hover:text-error hover:bg-error/5'
                          }`}
                          title={deleting === app.id ? "Confirm" : "Delete"}
                        >
                          {deleting === app.id ? <X className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View modal */}
      <AnimatePresence>
        {viewing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setViewing(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary">Application details</h3>
                <button
                  onClick={() => setViewing(null)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-alt"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-text-muted" />
                  <span className="text-text-muted">Name:</span>
                  <span className="font-medium">{viewing.fullName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-text-muted" />
                  <span className="text-text-muted">Phone:</span>
                  <span className="font-medium">{viewing.phone}</span>
                </div>
                {viewing.telegramUsername && (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-text-muted" />
                    <span className="text-text-muted">Telegram:</span>
                    <a
                      href={`https://t.me/${viewing.telegramUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-emerald-500 hover:underline"
                    >
                      @{viewing.telegramUsername}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-text-muted" />
                  <span className="text-text-muted">Course:</span>
                  <span>{viewing.courseName || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-text-muted" />
                  <span className="text-text-muted">Direction:</span>
                  <span>{getDirectionLabel(viewing.direction)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-text-muted" />
                  <span className="text-text-muted">Time:</span>
                  <span>{viewing.preferredTime || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCheck className="h-4 w-4 text-text-muted" />
                  <span className="text-text-muted">Status:</span>
                  <span className={statusColors[viewing.status]}>
                    {statusLabels[viewing.status] || viewing.status}
                  </span>
                </div>
                {viewing.room && (
                  <div className="flex items-center gap-2">
                    <DoorOpen className="h-4 w-4 text-text-muted" />
                    <span className="text-text-muted">Room:</span>
                    <span>{viewing.room}</span>
                  </div>
                )}
                {viewing.notificationMessage && (
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-text-muted" />
                    <span className="text-text-muted">Message:</span>
                    <span className="text-emerald-500">{viewing.notificationMessage}</span>
                  </div>
                )}
                {viewing.createdAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-text-muted" />
                    <span className="text-text-muted">Created:</span>
                    <span>{new Date(viewing.createdAt).toLocaleString('en-US')}</span>
                  </div>
                )}
                <div>
                  <span className="text-text-muted">Message:</span>
                  <p className="mt-1 text-text bg-surface-alt rounded-lg p-2">{viewing.message || "None"}</p>
                </div>
              </div>

              {/* Quick actions in modal */}
              <div className="mt-5 flex items-center gap-2 pt-4 border-t border-border">
                {viewing.status === 'new' && (
                  <button
                    onClick={() => { handleStatus(viewing.id, 'read'); setViewing(null); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-warning/10 text-warning text-sm font-medium hover:bg-warning/20 transition-all"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Mark as read
                  </button>
                )}
                {['new', 'read'].includes(viewing.status) && (
                  <button
                    onClick={() => { setViewing(null); openNotify(viewing); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-all"
                  >
                    <Bell className="h-4 w-4" />
                    Send message
                  </button>
                )}
                {['new', 'read'].includes(viewing.status) && (
                  <button
                    onClick={() => { handleStatus(viewing.id, 'rejected'); setViewing(null); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-error/10 text-error text-sm font-medium hover:bg-error/20 transition-all"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notify modal */}
      <AnimatePresence>
        {notifying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setNotifying(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary">Send message</h3>
                <button
                  onClick={() => setNotifying(null)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-alt"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User info */}
              <div className="mb-4 p-3 rounded-xl bg-surface-alt border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{notifying.fullName}</p>
                    <p className="text-xs text-text-muted">{notifying.phone}</p>
                    <span className={statusColors[notifying.status]}>
                      {statusLabels[notifying.status] || notifying.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Message text */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    <Bell className="h-4 w-4 inline mr-1" />
                    Message text
                  </label>
                  <textarea
                    value={notifyForm.notificationMessage}
                    onChange={(e) => setNotifyForm({ ...notifyForm, notificationMessage: e.target.value })}
                    className="input-field min-h-[80px]"
                    placeholder="E.g.: Please come tomorrow at 9:00 AM"
                  />
                </div>

                {/* Room number */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    <DoorOpen className="h-4 w-4 inline mr-1" />
                    Room number
                  </label>
                  <input
                    type="text"
                    value={notifyForm.room}
                    onChange={(e) => setNotifyForm({ ...notifyForm, room: e.target.value })}
                    className="input-field"
                    placeholder="E.g.: Room 201"
                  />
                </div>

                {/* Send button */}
                <button
                  onClick={() => handleNotify(notifying.id)}
                  disabled={sendingNotify}
                  className="w-full flex items-center justify-center gap-2 btn-primary"
                >
                  {sendingNotify ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send message
                    </>
                  )}
                </button>

                <p className="text-xs text-text-muted/60 text-center">
                  <Bell className="h-3 w-3 inline mr-1" />
                  The user will see the message on the site and via the Telegram bot
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
