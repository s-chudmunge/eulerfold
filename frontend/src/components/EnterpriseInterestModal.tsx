import React, { useState } from 'react';
import { X, Send, Building2, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function EnterpriseInterestModal({ isOpen, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [requirements, setRequirements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/enterprise-interest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, institution, requirements }),
      });

      if (!response.ok) {
        throw new Error('Failed to send request. Please try again later.');
      }

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        // Reset form after closing
        setTimeout(() => {
          setIsSuccess(false);
          setEmail('');
          setInstitution('');
          setRequirements('');
        }, 500);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-surface border border-border shadow-2xl rounded-lg overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between bg-header">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-text-heading tracking-tight">Enterprise Access</h2>
                <p className="text-[11px] text-text-muted mt-0.5">Custom solutions for your team</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-sidebar rounded-lg transition-colors text-text-muted hover:text-text-heading"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6">
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center text-center py-8"
              >
                <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-text-heading mb-2">Request Received</h3>
                <p className="text-sm text-text-muted max-w-sm">
                  Thank you for your interest. Our team will reach out to you shortly to discuss custom solutions.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-[12px] font-medium">
                    {error}
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-text-heading">Work Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-sidebar border border-border/50 rounded-lg px-3 py-2 text-[13px] text-text-primary focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-text-muted/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-text-heading">Institution / Company</label>
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Acme Corp, Stanford University"
                    className="w-full bg-sidebar border border-border/50 rounded-lg px-3 py-2 text-[13px] text-text-primary focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-text-muted/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-text-heading">What are you looking for?</label>
                  <textarea
                    required
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Tell us about your team's needs, expected usage, or any custom integrations you might require..."
                    className="w-full bg-sidebar border border-border/50 rounded-lg px-3 py-2 text-[13px] text-text-primary focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-text-muted/50 min-h-[100px] resize-y"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-accent hover:bg-accent/90 text-white rounded-lg text-[13px] font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
