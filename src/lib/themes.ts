export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  accent: string;       // Accent color (e.g. #f59e0b)
  hover: string;        // Accent hover color (e.g. #fbbf24)
  bg: string;           // Page body background
  card: string;         // Card background
  nav: string;          // Navbar/footer background
  badgeText: string;    // Badge text color
  btnText: string;      // Button text color when accent bg
  gradientTo?: string;  // End color of gradient (optional)
}

export const APP_THEMES: ThemeConfig[] = [
  {
    id: 'cosmic-slate',
    name: 'Cosmic Slate (Original)',
    description: 'Sophisticated deep charcoal with premium amber gold accents.',
    accent: '#fbbf24',
    hover: '#f59e0b',
    bg: '#050505',
    card: '#0d0d12',
    nav: '#060608',
    badgeText: '#fbbf24',
    btnText: '#000000',
    gradientTo: '#d97706'
  },
  {
    id: 'emerald-mint',
    name: 'Emerald Mint',
    description: 'Lush dark botanical green with vibrant mint and emerald highlights.',
    accent: '#10b981',
    hover: '#059669',
    bg: '#020f0c',
    card: '#052219',
    nav: '#031410',
    badgeText: '#34d399',
    btnText: '#ffffff',
    gradientTo: '#047857'
  },
  {
    id: 'nordic-frost',
    name: 'Nordic Frost',
    description: 'Sleek Arctic dark slate blue paired with electric cyan highlights.',
    accent: '#06b6d4',
    hover: '#0891b2',
    bg: '#040b14',
    card: '#0c1a2b',
    nav: '#06111e',
    badgeText: '#22d3ee',
    btnText: '#000000',
    gradientTo: '#0e7490'
  },
  {
    id: 'sunset-rose',
    name: 'Sunset Rose',
    description: 'Warm obsidian plum background decorated with luxury rose highlights.',
    accent: '#ec4899',
    hover: '#db2777',
    bg: '#0d0309',
    card: '#220b18',
    nav: '#14050e',
    badgeText: '#f472b6',
    btnText: '#ffffff',
    gradientTo: '#be185d'
  },
  {
    id: 'royal-amethyst',
    name: 'Royal Amethyst',
    description: 'Majestic deep velvet violet with radiant purple accents.',
    accent: '#8b5cf6',
    hover: '#7c3aed',
    bg: '#07040f',
    card: '#140c26',
    nav: '#0b0617',
    badgeText: '#a78bfa',
    btnText: '#ffffff',
    gradientTo: '#6d28d9'
  },
  {
    id: 'crimson-obsidian',
    name: 'Crimson Obsidian',
    description: 'Bold volcanic charcoal background with high-impact crimson fire elements.',
    accent: '#ef4444',
    hover: '#dc2626',
    bg: '#0c0202',
    card: '#220808',
    nav: '#140404',
    badgeText: '#f87171',
    btnText: '#ffffff',
    gradientTo: '#b91c1c'
  },
  {
    id: 'tokyo-neon',
    name: 'Tokyo Neon',
    description: 'Cybernetic dark midnight blue featuring neon blue and pink elements.',
    accent: '#6366f1',
    hover: '#4f46e5',
    bg: '#03030c',
    card: '#0a0b1e',
    nav: '#050613',
    badgeText: '#818cf8',
    btnText: '#ffffff',
    gradientTo: '#db2777'
  },
  {
    id: 'vintage-bronze',
    name: 'Vintage Bronze',
    description: 'Warm espresso/sepia tones accented by brushed copper and deep bronze.',
    accent: '#d97706',
    hover: '#b45309',
    bg: '#0a0704',
    card: '#1a110a',
    nav: '#100a06',
    badgeText: '#f59e0b',
    btnText: '#ffffff',
    gradientTo: '#92400e'
  },
  {
    id: 'monochrome-clean',
    name: 'Monochrome Clean',
    description: 'Ultra-modern carbon black with high-contrast pure silver accents.',
    accent: '#f3f4f6',
    hover: '#e5e7eb',
    bg: '#080808',
    card: '#171717',
    nav: '#111111',
    badgeText: '#ffffff',
    btnText: '#000000',
    gradientTo: '#9ca3af'
  },
  {
    id: 'golden-oasis',
    name: 'Golden Oasis',
    description: 'Prestige desert night gold, with radiant sand highlights.',
    accent: '#eab308',
    hover: '#ca8a04',
    bg: '#080702',
    card: '#1b1706',
    nav: '#100e04',
    badgeText: '#fde047',
    btnText: '#000000',
    gradientTo: '#a16207'
  }
];

export function getThemeCSS(themeId: string): string {
  const theme = APP_THEMES.find(t => t.id === themeId) || APP_THEMES[0];
  const { accent, hover, bg, card, nav, badgeText, btnText, gradientTo } = theme;
  const gradTo = gradientTo || hover;

  return `
    /* Body & Main backgrounds */
    body, .bg-\\[\\#050505\\], .bg-black {
      background-color: ${bg} !important;
    }

    /* Cards & Modals */
    .bg-\\[\\#0d0d12\\], .bg-\\[\\#0c0c0c\\], .bg-zinc-900, .bg-\\[\\#12121a\\], .bg-neutral-900 {
      background-color: ${card} !important;
    }

    /* Navigation & Headers */
    .bg-\\[\\#060608\\]\\/85, .bg-\\[\\#060608\\], .bg-neutral-950\\/80, .bg-zinc-950\\/90 {
      background-color: ${nav} !important;
    }

    /* Primary Accent Texts */
    .text-amber-500, .text-amber-400, .text-amber-300 {
      color: ${accent} !important;
    }
    .hover\\:text-amber-400:hover, .hover\\:text-amber-500:hover {
      color: ${hover} !important;
    }
    .text-amber-500\\/80 {
      color: ${accent}cc !important;
    }

    /* Primary Accent Backgrounds & Buttons */
    .bg-amber-500, .bg-amber-600 {
      background-color: ${accent} !important;
      color: ${btnText} !important;
    }
    .hover\\:bg-amber-400:hover, .hover\\:bg-amber-500:hover, .hover\\:bg-amber-600:hover {
      background-color: ${hover} !important;
      color: ${btnText} !important;
    }

    /* Badge Backgrounds */
    .bg-amber-500\\/10 {
      background-color: ${accent}1c !important;
      color: ${badgeText} !important;
    }
    .bg-amber-500\\/15 {
      background-color: ${accent}26 !important;
      color: ${badgeText} !important;
    }
    .bg-amber-500\\/20 {
      background-color: ${accent}33 !important;
      color: ${badgeText} !important;
    }
    .bg-amber-500\\/5 {
      background-color: ${accent}0d !important;
    }

    /* Borders & Outlines */
    .border-amber-500, .border-amber-500\\/30, .border-amber-500\\/20 {
      border-color: ${accent}4d !important;
    }
    .focus\\:border-amber-500:focus {
      border-color: ${accent} !important;
    }
    input:focus, select:focus, textarea:focus {
      border-color: ${accent}cc !important;
      box-shadow: 0 0 0 4px ${accent}20 !important;
    }

    /* Gradients */
    .from-amber-400, .from-amber-500 {
      --tw-gradient-from: ${accent} !important;
      --tw-gradient-to: ${gradTo} !important;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
    }
    .to-amber-600, .to-amber-700 {
      --tw-gradient-to: ${gradTo} !important;
    }

    /* Glows & Shadows */
    .shadow-amber-500\\/10 {
      box-shadow: 0 4px 20px ${accent}1a !important;
    }
    .shadow-amber-500\\/20 {
      box-shadow: 0 10px 30px ${accent}33 !important;
    }
  `;
}
