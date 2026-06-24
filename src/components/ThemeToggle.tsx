'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render a placeholder before mount to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button
        size="sm"
        variant="ghost"
        className="rounded-lg w-9 px-0"
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = (theme === 'system' ? resolvedTheme : theme) === 'dark';

  function handleClick() {
    setTheme(isDark ? 'light' : 'dark');
  }

  return (
    <Button
      onClick={handleClick}
      size="sm"
      variant="ghost"
      className="text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-100 dark:hover:bg-stone-800 rounded-lg w-9 px-0"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}