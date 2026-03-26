import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The rules and guidelines for using EulerFold.',
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
