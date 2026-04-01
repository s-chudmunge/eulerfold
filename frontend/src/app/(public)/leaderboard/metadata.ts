import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'See the top learners on EulerFold. Track streaks, EulerCoins, and community contributions. Celebrate steady progress and real results.',
  openGraph: {
    title: 'EulerFold Rankings',
    description: 'Join the top 1% of learners. Track your ranking and earn EulerCoins for your progress.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'EulerFold Rankings',
    description: 'See the top learners on EulerFold. Track streaks, EulerCoins, and community contributions.',
  },
  alternates: {
    canonical: '/leaderboard',
  }
}