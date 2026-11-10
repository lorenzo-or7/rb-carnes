import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../app/theme';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const next = theme === 'dark' ? 'claro' : 'escuro';
  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={toggle}
      aria-label={`Ativar tema ${next}`}
      title={`Tema ${next}`}
      data-testid="theme-toggle"
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <Sun className="theme-toggle__icon theme-toggle__icon--sun" />
        <Moon className="theme-toggle__icon theme-toggle__icon--moon" />
        <span className="theme-toggle__thumb" />
      </span>
    </button>
  );
}
