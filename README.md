# Bonify - Employee Bonus Tracker 🎯

A gamified employee bonus tracking application where employees can track contract sales and earn bonuses based on milestones. Built with Next.js, Supabase, and shadcn/ui.

## Features

- 🔐 **Authentication** - Secure email/password authentication with Supabase
- 📊 **Real-time Stats** - Track total contracts, current tier, and bonuses earned
- 🎮 **Gamification** - Progress through tiers (Starter → Bronze → Silver → Gold → Platinum → Diamond)
- 🎉 **Celebrations** - Confetti animations when reaching new tiers
- 📱 **Responsive Design** - Clean UI built with shadcn/ui components
- ⚡ **Optimistic Updates** - Instant feedback when logging sales

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Backend**: Supabase (PostgreSQL + Authentication)
- **UI**: shadcn/ui, Tailwind CSS v4
- **Animations**: canvas-confetti
- **Notifications**: Sonner (toast notifications)

## Getting Started

### 1. Prerequisites

- Node.js 18+ and pnpm installed
- A Supabase account (sign up at supabase.com)

### 2. Supabase Setup

1. Create a new Supabase project at supabase.com
2. Go to your project settings and copy:
   - Project URL (API URL)
   - Anon/Public API Key
3. In the Supabase SQL Editor, run the SQL from supabase-schema.sql

### 3. Environment Variables

Update .env.local file with your Supabase credentials:

NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

### 4. Install and Run

pnpm install
pnpm dev

Open http://localhost:3000

## Usage

1. Sign up with your name, email, and password
2. Click the large green + button to log contract sales
3. Watch your progress through bonus tiers
4. Celebrate with confetti when reaching new milestones!

## Bonus Tier System

- 🌟 Starter: 0 contracts - CHF 0
- 🥉 Bronze: 5 contracts - CHF 100
- 🥈 Silver: 15 contracts - CHF 300
- 🥇 Gold: 30 contracts - CHF 750
- 💎 Platinum: 50 contracts - CHF 1,500
- 💠 Diamond: 100 contracts - CHF 3,500

## Scripts

pnpm dev    # Start development server
pnpm build  # Build for production
pnpm start  # Start production server
pnpm lint   # Run ESLint
