import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'arcano_theme_mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly doc = inject(DOCUMENT);

  readonly mode = signal<ThemeMode>('light');
  readonly isDark = computed(() => this.mode() === 'dark');

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const initial = stored === 'dark' || stored === 'light' ? stored : this.getSystemPreferred();
    this.setMode(initial);
  }

  toggle(): void {
    this.setMode(this.isDark() ? 'light' : 'dark');
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    }
    this.applyToDocument(mode);
  }

  private applyToDocument(mode: ThemeMode): void {
    const el = this.doc?.documentElement;
    if (!el) return;
    el.setAttribute('data-theme', mode);
  }

  private getSystemPreferred(): ThemeMode {
    try {
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }
}

