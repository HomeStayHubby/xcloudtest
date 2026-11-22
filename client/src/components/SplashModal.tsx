import { useEffect, useCallback } from 'react';
import Logo from './Logo.js';
import { APP_VERSION } from '../version.js';

interface SplashModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SplashModal({ isOpen, onClose }: SplashModalProps): JSX.Element | null {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="splash-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <button
        type="button"
        className="splash-close"
        onClick={onClose}
        aria-label="Close splash screen"
      >
        ×
      </button>
      <div className="splash-content" onClick={(event) => event.stopPropagation()}>
        <Logo size="splash" />
        <p className="splash-version">Version {APP_VERSION}</p>
      </div>
    </div>
  );
}
