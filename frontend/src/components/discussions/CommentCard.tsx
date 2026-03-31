import React, { useState } from 'react';
import { MoreVertical, Reply, Trash2, Flag, Pin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/components/AuthProvider';

export interface DiscussionComment {
  id: string;
  context_type: string;
  context_id: string;
  author_id: number;
  author_name: string;
  author_avatar?: string;
  parent_id?: string;
  content: string | null;
  is_pinned: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

interface CommentCardProps {
  comment: DiscussionComment;
  onReply?: (comment: DiscussionComment) => void;
  onDelete?: (id: string) => void;
  onReport?: (id: string) => void;
  isReply?: boolean;
}

export const CommentCard: React.FC<CommentCardProps> = ({ 
  comment, 
  onReply, 
  onDelete, 
  onReport,
  isReply = false
}) => {
  const { user, profile } = useAuth();
  const [showActions, setShowActions] = useState(false);

  // Check if current user is the author
  // profile.id is the integer ID from the profiles table
  const isAuthor = profile && Number(profile.id) === Number(comment.author_id);
  const isAdmin = profile?.is_admin || false;

  return (
    <div className={`group relative flex gap-4 ${isReply ? 'ml-12 mt-4' : 'mt-8'} transition-all`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {comment.author_avatar ? (
          <img 
            src={comment.author_avatar} 
            alt={comment.author_name} 
            className="w-10 h-10 rounded-full border border-border object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center border border-border">
            <span className="text-accent font-bold text-sm">
              {comment.author_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="inconsolata-ui font-bold text-text-heading text-[14px]">
            {comment.author_name}
          </span>
          
          {/* Rank Placeholder */}
          <div className="h-4 w-12 bg-accent-muted/30 rounded animate-pulse hidden md:block" title="EulerFold Rank coming soon" />

          {comment.is_pinned && (
            <span className="flex items-center gap-1 text-accent text-[11px] font-bold uppercase tracking-tighter ml-2">
              <Pin className="w-3 h-3 fill-current" /> Pinned
            </span>
          )}

          <span className="manrope-body text-[11px] text-text-muted ml-auto">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>

          <div className="relative">
            <button 
              onClick={() => setShowActions(!showActions)}
              className="p-1 hover:bg-callout-bg rounded transition-colors text-text-muted opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 mt-1 w-32 bg-background border border-border rounded-xl shadow-xl z-20 overflow-hidden inconsolata-ui text-[12px] font-bold">
                {!comment.is_deleted && (isAuthor || isAdmin) && (
                  <button 
                    onClick={() => { onDelete?.(comment.id); setShowActions(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-red-500/10 text-red-500 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )}
                {!isAuthor && (
                  <button 
                    onClick={() => { onReport?.(comment.id); setShowActions(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-callout-bg text-text-primary flex items-center gap-2"
                  >
                    <Flag className="w-3.5 h-3.5" /> Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="manrope-body text-[15px] leading-relaxed text-text-primary prose-sm prose-eulerfold max-w-none">
          {comment.is_deleted ? (
            <p className="italic text-text-muted opacity-60">This comment was deleted</p>
          ) : (
            <ReactMarkdown>{comment.content || ''}</ReactMarkdown>
          )}
        </div>

        {/* Footer Actions */}
        {!isReply && !comment.is_deleted && (
          <div className="mt-3 flex items-center gap-4">
            <button 
              onClick={() => onReply?.(comment)}
              className="flex items-center gap-1.5 text-[12px] font-bold text-accent hover:underline inconsolata-ui uppercase tracking-tighter"
            >
              <Reply className="w-3.5 h-3.5" /> Reply
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
