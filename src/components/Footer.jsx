import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin, ChevronRight } from 'lucide-react';
import useSettingsStore from '../store/settingsStore';
import useLocaleStore from '../store/localeStore';

const footerLinkKeys = {
  services: [
    { key: 'nav.courses', path: '/courses' },
    { key: 'nav.teachers', path: '/teachers' },
    { key: 'footer.faq', path: '/faq' },
  ],
  company: [
    { key: 'footer.about', path: '/about' },
    { key: 'nav.blog', path: '/blog' },
    { key: 'footer.gallery', path: '/gallery' },
    { key: 'nav.contact', path: '/contact' },
  ],
  support: [
    { key: 'nav.register', path: '/registration' },
    { key: 'footer.privacy', path: '#' },
    { key: 'footer.terms', path: '#' },
  ],
};

export default function Footer() {
  const { settings } = useSettingsStore();
  const { locale, t } = useLocaleStore();

  return (
    <footer className="bg-[#0f172a] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-16">
          {/* About */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold">{settings?.siteName || 'EduNova'}</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6" key={`desc-${locale}`}>
              {settings?.description || t('footer.desc', 'Learn with us, change your future.')}
            </p>
            <div className="space-y-3">
              {settings?.phone && (
                <a href={`tel:${settings.phone}`} className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{settings.phone}</span>
                </a>
              )}
              {settings?.email && (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>{settings.email}</span>
                </a>
              )}
              {settings?.address && (
                <div className="flex items-start gap-3 text-sm text-gray-400">
                  <MapPin className="h-4 w-4 text-primary mt-0.5" />
                  <span>{settings.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
              {t('footer.services', 'Services')}
            </h3>
            <ul className="space-y-3">
              {footerLinkKeys.services.map((link) => (
                <li key={link.key}>
                  <Link
                    to={link.path}
                    className="group flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <ChevronRight className="h-3 w-3 text-primary opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {t(link.key, link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
              {t('footer.company', 'Company')}
            </h3>
            <ul className="space-y-3">
              {footerLinkKeys.company.map((link) => (
                <li key={link.key}>
                  <Link
                    to={link.path}
                    className="group flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <ChevronRight className="h-3 w-3 text-primary opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {t(link.key, link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
              {t('footer.support', 'Support')}
            </h3>
            <ul className="space-y-3">
              {footerLinkKeys.support.map((link) => (
                <li key={link.key}>
                  <Link
                    to={link.path}
                    className="group flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <ChevronRight className="h-3 w-3 text-primary opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {t(link.key, link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {settings?.siteName || 'EduNova'}. {t('footer.rights', 'All rights reserved.')}
          </p>
          <div className="flex items-center gap-4">
            {settings?.telegram && (
              <a href={settings.telegram} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-white transition-colors">
                Telegram
              </a>
            )}
            {settings?.instagram && (
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-white transition-colors">
                Instagram
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
