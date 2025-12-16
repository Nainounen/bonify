export type CategoryColors = {
  background: string
  card: string
  cardBorder: string
  primary: string
  secondary: string
  accent: string
  text: {
    primary: string
    secondary: string
    muted: string
  }
  buttonGradient: string
  glowColor: string // RGB values like "99, 102, 241"
  navBar: string
  navBarBorder: string
  glass: string
  glassBorder: string
  cardInactive: string
  cardInactiveBorder: string
  divider: string
  iconMuted: string
}

export type GlobalTheme = {
  id: string
  name: string
  variants: {
    Internet: CategoryColors
    Mobile: CategoryColors
  }
}

export const themes: Record<string, GlobalTheme> = {
  default: {
    id: 'default',
    name: 'Cosmic',
    variants: {
      Internet: {
        background: 'bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900',
        card: 'bg-indigo-500/10',
        cardBorder: 'border-indigo-500/20',
        primary: 'text-indigo-400',
        secondary: 'text-blue-300',
        accent: 'bg-indigo-500',
        text: {
          primary: 'text-white',
          secondary: 'text-indigo-100',
          muted: 'text-indigo-200/60'
        },
        buttonGradient: 'bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-indigo-500/40',
        glowColor: '99, 102, 241',
        navBar: 'bg-black/20 backdrop-blur-xl',
        navBarBorder: 'border-white/10',
        glass: 'bg-white/10',
        glassBorder: 'border-white/10',
        cardInactive: 'bg-white/5',
        cardInactiveBorder: 'border-white/10',
        divider: 'bg-white/20',
        iconMuted: 'text-white/30'
      },
      Mobile: {
        background: 'bg-gradient-to-br from-fuchsia-950 via-purple-900 to-slate-900',
        card: 'bg-purple-500/10',
        cardBorder: 'border-purple-500/20',
        primary: 'text-purple-400',
        secondary: 'text-fuchsia-300',
        accent: 'bg-purple-500',
        text: {
          primary: 'text-white',
          secondary: 'text-purple-100',
          muted: 'text-purple-200/60'
        },
        buttonGradient: 'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 shadow-purple-500/40',
        glowColor: '168, 85, 247',
        navBar: 'bg-black/20 backdrop-blur-xl',
        navBarBorder: 'border-white/10',
        glass: 'bg-white/10',
        glassBorder: 'border-white/10',
        cardInactive: 'bg-white/5',
        cardInactiveBorder: 'border-white/10',
        divider: 'bg-white/20',
        iconMuted: 'text-white/30'
      }
    }
  },
  light: {
    id: 'light',
    name: 'Daylight',
    variants: {
      Internet: {
        background: 'bg-gradient-to-br from-blue-50 via-white to-slate-100',
        card: 'bg-white shadow-md',
        cardBorder: 'border-blue-200',
        primary: 'text-blue-700',
        secondary: 'text-slate-700',
        accent: 'bg-blue-600',
        text: {
          primary: 'text-slate-950',
          secondary: 'text-slate-700',
          muted: 'text-slate-500'
        },
        buttonGradient: 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 shadow-blue-600/30',
        glowColor: '37, 99, 235',
        navBar: 'bg-white/90 backdrop-blur-xl',
        navBarBorder: 'border-slate-300',
        glass: 'bg-white/80',
        glassBorder: 'border-slate-300',
        cardInactive: 'bg-slate-100',
        cardInactiveBorder: 'border-slate-300',
        divider: 'bg-slate-300',
        iconMuted: 'text-slate-400'
      },
      Mobile: {
        background: 'bg-gradient-to-br from-fuchsia-50 via-white to-slate-100',
        card: 'bg-white shadow-md',
        cardBorder: 'border-fuchsia-200',
        primary: 'text-fuchsia-700',
        secondary: 'text-slate-700',
        accent: 'bg-fuchsia-600',
        text: {
          primary: 'text-slate-950',
          secondary: 'text-slate-700',
          muted: 'text-slate-500'
        },
        buttonGradient: 'bg-gradient-to-br from-fuchsia-600 via-fuchsia-700 to-fuchsia-800 shadow-fuchsia-600/30',
        glowColor: '192, 38, 211',
        navBar: 'bg-white/90 backdrop-blur-xl',
        navBarBorder: 'border-slate-300',
        glass: 'bg-white/80',
        glassBorder: 'border-slate-300',
        cardInactive: 'bg-slate-100',
        cardInactiveBorder: 'border-slate-300',
        divider: 'bg-slate-300',
        iconMuted: 'text-slate-400'
      }
    }
  },
  forest: {
    id: 'forest',
    name: 'Alpine',
    variants: {
      Internet: {
        background: 'bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900',
        card: 'bg-emerald-500/10',
        cardBorder: 'border-emerald-500/20',
        primary: 'text-emerald-400',
        secondary: 'text-teal-300',
        accent: 'bg-emerald-500',
        text: {
          primary: 'text-white',
          secondary: 'text-emerald-100',
          muted: 'text-emerald-200/60'
        },
        buttonGradient: 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 shadow-emerald-500/40',
        glowColor: '16, 185, 129',
        navBar: 'bg-black/20 backdrop-blur-xl',
        navBarBorder: 'border-white/10',
        glass: 'bg-white/10',
        glassBorder: 'border-white/10',
        cardInactive: 'bg-white/5',
        cardInactiveBorder: 'border-white/10',
        divider: 'bg-white/20',
        iconMuted: 'text-white/30'
      },
      Mobile: {
        background: 'bg-gradient-to-br from-amber-950 via-orange-900 to-slate-900',
        card: 'bg-orange-500/10',
        cardBorder: 'border-orange-500/20',
        primary: 'text-orange-400',
        secondary: 'text-amber-300',
        accent: 'bg-orange-500',
        text: {
          primary: 'text-white',
          secondary: 'text-orange-100',
          muted: 'text-orange-200/60'
        },
        buttonGradient: 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shadow-orange-500/40',
        glowColor: '249, 115, 22',
        navBar: 'bg-black/20 backdrop-blur-xl',
        navBarBorder: 'border-white/10',
        glass: 'bg-white/10',
        glassBorder: 'border-white/10',
        cardInactive: 'bg-white/5',
        cardInactiveBorder: 'border-white/10',
        divider: 'bg-white/20',
        iconMuted: 'text-white/30'
      }
    }
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    variants: {
      Internet: {
        background: 'bg-gradient-to-br from-slate-950 via-slate-900 to-black',
        card: 'bg-white/5',
        cardBorder: 'border-white/10',
        primary: 'text-sky-400',
        secondary: 'text-slate-400',
        accent: 'bg-sky-500',
        text: {
          primary: 'text-white',
          secondary: 'text-slate-300',
          muted: 'text-slate-500'
        },
        buttonGradient: 'bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 shadow-sky-500/40',
        glowColor: '14, 165, 233',
        navBar: 'bg-black/20 backdrop-blur-xl',
        navBarBorder: 'border-white/10',
        glass: 'bg-white/10',
        glassBorder: 'border-white/10',
        cardInactive: 'bg-white/5',
        cardInactiveBorder: 'border-white/10',
        divider: 'bg-white/20',
        iconMuted: 'text-white/30'
      },
      Mobile: {
        background: 'bg-gradient-to-br from-zinc-950 via-neutral-900 to-black',
        card: 'bg-white/5',
        cardBorder: 'border-white/10',
        primary: 'text-rose-400',
        secondary: 'text-zinc-400',
        accent: 'bg-rose-500',
        text: {
          primary: 'text-white',
          secondary: 'text-zinc-300',
          muted: 'text-zinc-500'
        },
        buttonGradient: 'bg-gradient-to-br from-rose-400 via-rose-500 to-rose-600 shadow-rose-500/40',
        glowColor: '244, 63, 94',
        navBar: 'bg-black/20 backdrop-blur-xl',
        navBarBorder: 'border-white/10',
        glass: 'bg-white/10',
        glassBorder: 'border-white/10',
        cardInactive: 'bg-white/5',
        cardInactiveBorder: 'border-white/10',
        divider: 'bg-white/20',
        iconMuted: 'text-white/30'
      }
    }
  }
}

/**
 * Get theme by ID with fallback to default theme
 */
export function getTheme(themeId: string): GlobalTheme {
  return themes[themeId] || themes['default']!
}
