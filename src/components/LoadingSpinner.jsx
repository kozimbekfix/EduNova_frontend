import { Loader2 } from 'lucide-react';
import useLocaleStore from '../store/localeStore';

export default function LoadingSpinner({ size = 'md', text }) {
  const { t } = useLocaleStore();
  const loadingText = text || t('loading.text', 'Loading...');
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className={`${sizes[size]} text-primary animate-spin`} />
      {loadingText && <p className="mt-3 text-sm text-text-muted">{loadingText}</p>}
    </div>
  );
}
