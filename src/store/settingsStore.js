import { create } from 'zustand';
import { getSettings } from '../api/settings';

const useSettingsStore = create((set) => ({
  settings: null,
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getSettings();
      set({ settings: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  setSettings: (settings) => set({ settings }),
}));

export default useSettingsStore;
