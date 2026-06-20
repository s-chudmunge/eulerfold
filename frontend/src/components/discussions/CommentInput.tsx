import React, { useState } from 'react';
import { Send, LogIn, X } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

interface CommentInputProps {
  onSubmit: (content: string, parentId?: string) => Promise<void>;
  parentId?: string;
  parentAuthorName?: string;
  onCancelReply?: () => void;
  isSubmitting?: boolean;
}

export const CommentInput: React.FC<CommentInputProps> = ({ 
  onSubmit, 
  parentId, 
  parentAuthorName,
  onCancelReply,
  isSubmitting = false 
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState('');

  const handleSignIn = () => {
    router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;
    
    await onSubmit(content, parentId);
    setContent('');
  };

  if (!user) {
    return (
      <div className="bg-callout-bg border border-border rounded-lg p-8 text-center mt-8">
        <h4 className="inconsolata-ui font-bold text-text-heading mb-2">Join the discussion</h4>
        <p className="manrope-body text-[14px] text-text-muted mb-6">Sign in to share your thoughts and technical insights.</p>
        <button 
          onClick={handleSignIn}
          className="inline-flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-lg font-bold inconsolata-ui hover:opacity-90 transition-all  shadow-teal-500/20"
        >
          <LogIn className="w-4 h-4" /> Sign In Free
        </button>
      </div>
    );
  }

  return (
    <div className={`mt-8 ${parentId ? 'ml-12 border-l-2 border-accent-muted pl-6' : ''}`}>
      {parentId && (
        <div className="flex items-center justify-between mb-2">
          <span className="inconsolata-ui text-[12px] font-bold text-accent uppercase tracking-tighter">
            Replying to {parentAuthorName}
          </span>
          <button 
            onClick={onCancelReply}
            className="text-text-muted hover:text-text-heading p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentId ? "Write a reply (Markdown supported)..." : "Share a technical insight or discuss the topic (Markdown supported)..."}
          className="w-full bg-background border border-border rounded-lg p-4 min-h-[120px] focus:border-accent outline-none transition-all manrope-body text-[15px] resize-y"
          disabled={isSubmitting}
        />
        
        <div className="flex items-center justify-end mt-3">
          <button 
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="inline-flex items-center gap-2 bg-text-heading text-background px-5 py-2 rounded-lg font-bold inconsolata-ui text-[14px] hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
            ) : (
              <>Post <Send className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
