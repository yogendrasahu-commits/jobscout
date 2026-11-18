/**
 * JobScout 2026 Luxury Theme Engine
 * 4 Aesthetic Palettes:
 * 1. obsidian: Obsidian Aurora (Default Dark - Electric Indigo + Neon Cyan)
 * 2. emerald:  Midnight Emerald (Executive - Cyber Mint + Champagne Gold)
 * 3. ceramic:  Ceramic Minimal (Clean Light - Deep Cobalt + Slate Charcoal)
 * 4. sunset:   Sunset Tokyo (Vibrant - Neon Coral Rose + Solar Amber)
 */

export const THEMES = [
  {
    id: 'obsidian',
    name: 'Obsidian Aurora',
    label: 'Obsidian',
    isDark: true,
    color: '#6366f1',
    accentColor: '#06b6d4',
    icon: '🌌',
    badge: 'Default Dark',
    desc: 'Deep Space & Indigo'
  },
  {
    id: 'emerald',
    name: 'Midnight Emerald',
    label: 'Emerald',
    isDark: true,
    color: '#10b981',
    accentColor: '#059669',
    icon: '🌲',
    badge: 'Executive',
    desc: 'Cyber Mint & Black'
  },
  {
    id: 'ceramic',
    name: 'Ceramic Minimal',
    label: 'Ceramic',
    isDark: false,
    color: '#2563eb',
    accentColor: '#0f172a',
    icon: '☀️',
    badge: 'Clean Light',
    desc: 'Swiss Clean & Slate'
  },
  {
    id: 'sunset',
    name: 'Sunset Tokyo',
    label: 'Sunset',
    isDark: true,
    color: '#f43f5e',
    accentColor: '#fbbf24',
    icon: '🌅',
    badge: 'Vibrant',
    desc: 'Coral Rose & Neon Purple'
  }
];

export const getThemeById = (id) => {
  if (id === 'dark') return THEMES[0]; // obsidian
  if (id === 'light') return THEMES[2]; // ceramic
  return THEMES.find(t => t.id === id) || THEMES[0];
};

export const getNextTheme = (currentTheme) => {
  const ids = THEMES.map(t => t.id);
  const normalized = currentTheme === 'dark' ? 'obsidian' : (currentTheme === 'light' ? 'ceramic' : currentTheme);
  const idx = ids.indexOf(normalized);
  const nextIdx = (idx === -1 ? 0 : (idx + 1) % ids.length);
  return ids[nextIdx];
};

export const applyThemeToDocument = (themeId) => {
  if (typeof document === 'undefined') return;
  const theme = getThemeById(themeId);
  
  // Set data-theme attribute on <html>
  document.documentElement.setAttribute('data-theme', theme.id);
  
  // Tailwind dark mode class
  if (theme.isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Update meta theme-color for mobile status bar & PWA
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    const barColor = theme.id === 'emerald' 
      ? '#040d0c' 
      : theme.id === 'sunset' 
        ? '#0c0a17' 
        : theme.id === 'ceramic' 
          ? '#f8fafc' 
          : '#07080d';
    metaThemeColor.setAttribute('content', barColor);
  }
};
