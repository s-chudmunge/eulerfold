import { Metadata } from 'next';
import TermsContent from './TermsContent';

export const metadata: Metadata = {
  title: 'Terms of Service | EulerFold Learning Platform',
  description: 'Terms and conditions for using the EulerFold platform. Read our guidelines for learning, content creation, and community participation.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsOfServicePage() {
  return <TermsContent />;
}
