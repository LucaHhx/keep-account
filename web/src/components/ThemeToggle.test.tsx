import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';
import { useThemeStore } from '../stores/theme';

describe('ThemeToggle', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'system', effectiveTheme: 'light' });
    localStorage.removeItem('theme');
    document.documentElement.classList.remove('dark');
  });

  // TC-019: Renders three options (light, dark, system)
  it('renders three theme options', () => {
    render(<ThemeToggle />);

    expect(screen.getByText('浅色')).toBeInTheDocument();
    expect(screen.getByText('深色')).toBeInTheDocument();
    expect(screen.getByText('系统')).toBeInTheDocument();
  });

  // TC-020: Clicking dark mode activates it
  it('clicking dark activates dark mode', () => {
    render(<ThemeToggle />);

    fireEvent.click(screen.getByText('深色'));

    expect(useThemeStore.getState().theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  // TC-021: Clicking light mode activates it
  it('clicking light activates light mode', () => {
    useThemeStore.getState().setTheme('dark');

    render(<ThemeToggle />);
    fireEvent.click(screen.getByText('浅色'));

    expect(useThemeStore.getState().theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  // TC-022: Clicking system mode activates it
  it('clicking system activates system mode', () => {
    useThemeStore.getState().setTheme('dark');

    render(<ThemeToggle />);
    fireEvent.click(screen.getByText('系统'));

    expect(useThemeStore.getState().theme).toBe('system');
  });
});
