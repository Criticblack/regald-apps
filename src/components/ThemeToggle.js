'use client';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button onClick={toggle} className="theme-toggle" title={theme === 'dark' ? 'Temă luminoasă' : 'Temă întunecată'}>
      {theme === 'dark' ? '☀' : '◐'}
    </button>
  );
}
