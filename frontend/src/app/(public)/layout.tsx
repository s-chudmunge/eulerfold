import PublicHeader from '@/components/PublicHeader';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="relative flex flex-col min-h-screen text-text-primary"
      style={{ paddingTop: 'var(--announcement-height, 0px)' }}
    >
      <div className="relative z-10 flex-1 flex flex-col">
        <PublicHeader />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
