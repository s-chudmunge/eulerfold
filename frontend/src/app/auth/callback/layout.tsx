import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authenticating...',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
