import React, { useState } from 'react';
import { useClassroom } from '@/contexts/ClassroomContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, MessageSquare, Send, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StreamTabProps {
  classId: string;
  isTeacher: boolean;
}

const StreamTab: React.FC<StreamTabProps> = ({ classId, isTeacher }) => {
  const { posts, createPost, deletePost, currentClass } = useClassroom();
  const { user, profile } = useAuth();
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [showPostInput, setShowPostInput] = useState(false);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    
    setPosting(true);
    const { error } = await createPost(classId, newPost);
    setPosting(false);
    
    if (error) {
      toast.error('Failed to post announcement');
    } else {
      setNewPost('');
      setShowPostInput(false);
      toast.success('Posted!');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Delete this post?')) return;
    
    const { error } = await deletePost(postId);
    if (error) {
      toast.error('Failed to delete post');
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Class code card - only for teachers */}
      {isTeacher && currentClass && (
        <div className="gc-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">Class code</p>
              <p className="text-2xl font-google-sans text-primary font-medium tracking-wider">
                {currentClass.class_code.toUpperCase()}
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(currentClass.class_code.toUpperCase());
                toast.success('Class code copied!');
              }}
              className="gc-btn-text px-4 py-2"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Post input */}
      {showPostInput ? (
        <div className="gc-card p-4">
          <div className="flex items-start gap-3">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full" />
            ) : (
              <div className="gc-avatar">{getInitials(profile?.full_name)}</div>
            )}
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Announce something to your class"
                className="w-full min-h-[100px] p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <div className="flex items-center justify-between mt-3">
                <button className="gc-btn-icon">
                  <Paperclip className="w-5 h-5 text-on-surface-variant" />
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowPostInput(false);
                      setNewPost('');
                    }}
                    className="gc-btn-text px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePost}
                    disabled={!newPost.trim() || posting}
                    className="gc-btn-primary px-4 py-2"
                  >
                    {posting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowPostInput(true)}
          className="gc-card p-4 w-full text-left hover:shadow-gc-2 transition-shadow"
        >
          <div className="flex items-center gap-3">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full" />
            ) : (
              <div className="gc-avatar">{getInitials(profile?.full_name)}</div>
            )}
            <span className="text-on-surface-variant">
              Announce something to your class
            </span>
          </div>
        </button>
      )}

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-on-surface-variant mx-auto mb-4 opacity-50" />
          <p className="text-on-surface-variant">
            No announcements yet. {isTeacher && 'Post an announcement to your class!'}
          </p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="gc-stream-post">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {post.author?.avatar_url ? (
                  <img src={post.author.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="gc-avatar">{getInitials(post.author?.full_name)}</div>
                )}
                <div>
                  <p className="font-medium text-foreground">{post.author?.full_name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              
              {(user?.id === post.author_id || isTeacher) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="gc-btn-icon">
                      <MoreVertical className="w-5 h-5 text-on-surface-variant" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="gc-dropdown">
                    <DropdownMenuItem 
                      onClick={() => handleDelete(post.id)}
                      className="gc-dropdown-item text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            <div className="mt-4 text-foreground whitespace-pre-wrap">
              {post.content}
            </div>

            {/* Comment section placeholder */}
            <div className="mt-4 pt-4 border-t border-border">
              <button className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary">
                <MessageSquare className="w-4 h-4" />
                Add class comment
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default StreamTab;
