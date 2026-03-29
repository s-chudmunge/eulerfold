import PublicHeader from '@/components/PublicHeader';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="flex flex-col min-h-screen bg-background text-text-primary"
      style={{ paddingTop: 'var(--announcement-height, 0px)' }}
    >
      <PublicHeader />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
