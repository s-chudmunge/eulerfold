import { Metadata } from 'next';
import PrivacyContent from './PrivacyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How we handle your learning data, security, and privacy at EulerFold. We believe in transparency and data protection for all our learners.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyContent />;
}
