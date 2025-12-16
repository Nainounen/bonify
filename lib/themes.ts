export type Theme = {
  id: string
  name: string
  colors: {
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
}

export const themes: Record<string, Theme> = {
  Internet: {
    id: 'internet',
    name: 'Internet',
    colors: {
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
    }
  },
  Mobile: {
    id: 'mobile',
    name: 'Mobile',
    colors: {
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
}
