import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard for managing curated roadmaps',
  robots: 'noindex, nofollow', // Prevent search engines from indexing admin pages
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-layout">
      {children}
    </div>
  )
}