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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
      }
    }
  },
  swisscom: {
    id: 'swisscom',
    name: 'Swisscom',
    variants: {
      Internet: {
        background: 'bg-gradient-to-br from-[#001155] via-[#0445C8] to-[#040D33]',
        card: 'bg-[#001155]/50',
        cardBorder: 'border-[#11AAFF]/30',
        primary: 'text-[#11AAFF]',
        secondary: 'text-[#00A3BF]',
        accent: 'bg-[#0445C8]',
        text: {
          primary: 'text-white',
          secondary: 'text-[#EEF3F6]',
          muted: 'text-[#DDE3E7]/60'
        }
      },
      Mobile: {
        background: 'bg-gradient-to-br from-[#040D33] via-[#333333] to-black',
        card: 'bg-[#F20505]/10',
        cardBorder: 'border-[#F20505]/20',
        primary: 'text-[#F20505]',
        secondary: 'text-[#E32065]',
        accent: 'bg-[#F20505]',
        text: {
          primary: 'text-white',
          secondary: 'text-[#EEF3F6]',
          muted: 'text-[#DDE3E7]/60'
        }
      }
    }
  }
}
