import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { api } from '@/lib/api';
import { DiscussionComment, CommentCard } from './CommentCard';
import { CommentInput } from './CommentInput';
import { MessageSquare, Loader2, ChevronDown } from 'lucide-react';

interface Props {
  contextId: string;
  contextType: string;
  title?: string;
}

const PAGE_SIZE = 50;

export const DiscussionSection: React.FC<Props> = ({ 
  contextId, 
  contextType, 
  title = "Discussion" 
}) => {
  const [comments, setComments] = useState<DiscussionComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<DiscussionComment | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  
  // Use a ref to track comments for the realtime callback to avoid stale closures
  const commentsRef = useRef<DiscussionComment[]>([]);
  commentsRef.current = comments;

  const fetchComments = useCallback(async (isInitial = true) => {
    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      const currentOffset = isInitial ? 0 : offset;
      const res = await api.get(`/discussions/${contextType}/${contextId}`, {
        params: {
          limit: PAGE_SIZE,
          offset: currentOffset
        }
      });
      
      const newComments = res.data;
      if (isInitial) {
        setComments(newComments);
        setOffset(newComments.length);
      } else {
        setComments(prev => [...prev, ...newComments]);
        setOffset(prev => prev + newComments.length);
      }
      
      setHasMore(newComments.length === PAGE_SIZE);
    } catch (err) {
      console.error("Failed to fetch discussions:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [contextId, contextType, offset]);

  useEffect(() => {
    fetchComments(true);

    // Set up real-time subscription
    // Filter by both context_id and context_type to prevent cross-page leakage
    const channel = supabase
      .channel(`discussions:${contextType}:${contextId}`)
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'discussion_threads',
          filter: `context_id=eq.${contextId}`
        }, 
        (payload) => {
          const newComment = payload.new as any;
          
          // Verify context_type in the callback since filter syntax is limited
          if (newComment.context_type !== contextType) return;

          const exists = commentsRef.current.some(c => c.id === newComment.id);
          if (!exists) {
            // Re-fetch to get complete author info and correct ordering
            // In a small app, this is the safest way to ensure author data consistency
            fetchComments(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contextId, contextType]); // Removed fetchComments from deps to avoid loop on initial load

  const handleSubmit = async (content: string, parentId?: string) => {
    try {
      setSubmitting(true);
      const res = await api.post('/discussions', {
        context_type: contextType,
        context_id: contextId,
        content,
        parent_id: parentId
      });
      
      // Optimistically add the new comment to the state
      setComments(prev => [...prev, res.data]);
      setReplyTo(null);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Failed to post comment";
      console.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    
    try {
      await api.delete(`/discussions/${id}`);
      setComments(prev => prev.map(c => 
        c.id === id ? { ...c, is_deleted: true, content: null } : c
      ));
    } catch (err) {
      console.error("Failed to delete comment");
    }
  };

  const handleReport = async (id: string) => {
    const reason = window.prompt("Why are you reporting this comment?");
    if (reason === null) return;
    
    try {
      await api.post('/discussions/report', {
        comment_id: id,
        reason
      });
      console.log("Report submitted");
    } catch (err: any) {
      if (err.response?.status === 409) {
        console.error("Already reported");
      }
    }
  };

  const topLevelComments = comments.filter(c => !c.parent_id);
  const replies = comments.filter(c => c.parent_id);
  
  const sortedThreads = [...topLevelComments].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return (
    <div className="mt-20 pt-12 border-t border-border max-w-[800px]">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-6 h-6 text-accent" />
        <h2 className="inconsolata-ui text-[24px] md:text-[28px] font-bold text-text-heading">
          {title}
        </h2>
        <span className="inconsolata-ui text-[12px] font-bold text-text-muted bg-callout-bg px-2 py-0.5 rounded border border-border">
          {comments.length}
        </span>
      </div>

      <CommentInput onSubmit={handleSubmit} isSubmitting={submitting} />

      <div className="mt-12 space-y-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="manrope-body text-text-muted text-sm">Loading insights...</p>
          </div>
        ) : sortedThreads.length === 0 ? (
          <div className="py-12 text-center bg-callout-bg/30 rounded-3xl border border-dashed border-border">
            <p className="manrope-body text-text-muted italic">No discussions yet. Be the first to share an insight.</p>
          </div>
        ) : (
          <>
            {sortedThreads.map(parent => (
              <div key={parent.id} className="border-b border-border/50 pb-12 last:border-0">
                <CommentCard 
                  comment={parent} 
                  onReply={(c) => setReplyTo(c)}
                  onDelete={handleDelete}
                  onReport={handleReport}
                />
                
                {replies
                  .filter(r => r.parent_id === parent.id)
                  .map(reply => (
                    <CommentCard 
                      key={reply.id} 
                      comment={reply} 
                      isReply={true} 
                      onDelete={handleDelete}
                      onReport={handleReport}
                    />
                  ))
                }

                {replyTo?.id === parent.id && (
                  <CommentInput 
                    parentId={parent.id}
                    parentAuthorName={parent.author_name}
                    onSubmit={handleSubmit}
                    onCancelReply={() => setReplyTo(null)}
                    isSubmitting={submitting}
                  />
                )}
              </div>
            ))}
            
            {hasMore && (
              <div className="flex justify-center pt-8">
                <button 
                  onClick={() => fetchComments(false)}
                  disabled={loadingMore}
                  className="flex items-center gap-2 inconsolata-ui text-[13px] font-bold text-text-muted hover:text-accent transition-colors disabled:opacity-50"
                >
                  {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                  Load More Insights
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
