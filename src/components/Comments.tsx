import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Comment } from '../types';

interface CommentsProps {
  date: string;
  isActive: boolean;
  onUnreadCountChange: (count: number) => void;
  onNewCommentArrived: () => void;
}

function getLastSeenKey(date: string) {
  return `lastSeenComments_${date}`;
}

function getLastSeenTimestamp(date: string): string {
  return localStorage.getItem(getLastSeenKey(date)) ?? '2000-01-01T00:00:00.000Z';
}

function markAsSeen(date: string) {
  localStorage.setItem(getLastSeenKey(date), new Date().toISOString());
}

export function Comments({ date, isActive, onUnreadCountChange, onNewCommentArrived }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  const isActiveRef = useRef(isActive);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    const savedName = localStorage.getItem('comment_author_name') ?? '';
    setAuthorName(savedName);
  }, []);

  useEffect(() => {
    loadComments();

    const channel = supabase
      .channel(`comments-${date}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `reading_date=eq.${date}` },
        (payload) => {
          const newComment = payload.new as Comment;
          setComments((prev) => {
            // Avoid duplicates if the insert was ours
            if (prev.some((c) => c.id === newComment.id)) return prev;
            const updated = [...prev, newComment];
            if (!isActiveRef.current) {
              const lastSeen = getLastSeenTimestamp(date);
              const unread = updated.filter((c) => c.created_at > lastSeen).length;
              onUnreadCountChange(unread);
              onNewCommentArrived();
            }
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [date]);

  // When tab becomes active, mark everything as seen
  useEffect(() => {
    if (isActive && comments.length > 0) {
      markAsSeen(date);
      onUnreadCountChange(0);
    }
  }, [isActive]);

  // Scroll to bottom when new comments load or arrive
  useEffect(() => {
    if (!loading) {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments, loading]);

  async function loadComments() {
    setLoading(true);
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('reading_date', date)
      .order('created_at', { ascending: true });

    if (data) {
      setComments(data);
      const lastSeen = getLastSeenTimestamp(date);
      const unread = data.filter((c) => c.created_at > lastSeen).length;
      onUnreadCountChange(unread);
    }
    setLoading(false);
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    const name = authorName.trim() || 'Anonymous';
    localStorage.setItem('comment_author_name', name);

    setSubmitting(true);
    await supabase.from('comments').insert({
      reading_date: date,
      author_name: name,
      content: content.trim(),
    });

    setContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setSubmitting(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Cmd/Ctrl+Enter submits
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  function formatTime(ts: string) {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return (
    <div className="flex flex-col">
      {/* Comment list */}
      {loading ? (
        <div className="animate-pulse space-y-3 mb-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No comments yet — share a thought!</p>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span className="font-semibold text-slate-900 text-sm truncate">{comment.author_name}</span>
                <span className="text-xs text-slate-400 flex-shrink-0">{formatTime(comment.created_at)}</span>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            </div>
          ))}
          <div ref={listEndRef} />
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="border-t border-slate-200 pt-4 space-y-2">
        <input
          type="text"
          placeholder="Your name (optional)"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            placeholder="Share a thought or reflection…"
            value={content}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            rows={2}
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none overflow-hidden min-h-[3rem]"
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            aria-label="Post comment"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-400">⌘↵ to send</p>
      </form>
    </div>
  );
}
