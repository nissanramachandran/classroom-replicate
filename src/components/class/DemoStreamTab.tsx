import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Send, Paperclip, MoreVertical, Link, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MOCK_USER } from '@/data/mockData';

interface DemoStreamTabProps {
  classData: any;
  posts: any[];
  isTeacher: boolean;
}

const DemoStreamTab: React.FC<DemoStreamTabProps> = ({ classData, posts: initialPosts, isTeacher }) => {
  const [posts, setPosts] = useState(initialPosts);
  const [newPost, setNewPost] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classData.class_code);
    setCopied(true);
    toast.success('Class code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePost = () => {
    if (!newPost.trim()) return;
    
    const post = {
      id: `post-${Date.now()}`,
      class_id: classData.id,
      author_id: MOCK_USER.id,
      content: newPost,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: MOCK_USER,
    };
    
    setPosts(prev => [post, ...prev]);
    setNewPost('');
    setShowInput(false);
    toast.success('Posted!');
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Class info card */}
      <div className="gc-card overflow-hidden">
        <div 
          className="h-32 relative"
          style={{ backgroundColor: classData.banner_color || '#1967d2' }}
        >
          <div className="absolute bottom-4 left-6">
            <h2 className="text-2xl font-google-sans text-white">{classData.title}</h2>
            {classData.section && (
              <p className="text-white/90">{classData.section}</p>
            )}
          </div>
        </div>
        
        {/* Class code and quick links */}
        <div className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-on-surface-variant mb-1">Class code</p>
            <div className="flex items-center gap-2">
              <span className="font-google-sans text-2xl text-primary">{classData.class_code}</span>
              <button
                onClick={handleCopyCode}
                className="gc-btn-icon"
                title="Copy class code"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-on-surface-variant" />
                )}
              </button>
            </div>
          </div>
          
          {classData.room && (
            <div>
              <p className="text-sm text-on-surface-variant">Room</p>
              <p className="font-medium">{classData.room}</p>
            </div>
          )}
          
          {classData.subject && (
            <div>
              <p className="text-sm text-on-surface-variant">Subject</p>
              <p className="font-medium">{classData.subject}</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming section */}
      <div className="gc-card p-4">
        <h3 className="font-google-sans text-lg text-foreground mb-3">Upcoming</h3>
        <p className="text-sm text-on-surface-variant">No work due soon</p>
        <button className="text-sm text-primary hover:underline mt-2">
          View all
        </button>
      </div>

      {/* Announcement input */}
      {isTeacher && (
        <div className="gc-card">
          {showInput ? (
            <div className="p-4">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Announce something to your class..."
                className="w-full min-h-[120px] p-3 bg-transparent border border-border rounded-lg focus:outline-none focus:border-primary resize-none"
                autoFocus
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-2">
                  <button className="gc-btn-icon">
                    <Paperclip className="w-5 h-5 text-on-surface-variant" />
                  </button>
                  <button className="gc-btn-icon">
                    <Link className="w-5 h-5 text-on-surface-variant" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowInput(false);
                      setNewPost('');
                    }}
                    className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-variant rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePost}
                    disabled={!newPost.trim()}
                    className="gc-btn-primary px-4 py-2 disabled:opacity-50"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowInput(true)}
              className="w-full p-4 text-left hover:bg-surface-variant/50 transition-colors flex items-center gap-3"
            >
              <div className="gc-avatar gc-avatar-sm bg-primary text-white">
                {getInitials(MOCK_USER.full_name)}
              </div>
              <span className="text-on-surface-variant">Announce something to your class...</span>
            </button>
          )}
        </div>
      )}

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-on-surface-variant">
            Nothing has been posted yet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="gc-stream-post">
              <div className="flex items-start gap-3">
                <div className="gc-avatar gc-avatar-sm bg-primary text-white shrink-0">
                  {getInitials(post.author?.full_name)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        {post.author?.full_name || 'Unknown'}
                      </p>
                      <p className="text-sm text-on-surface-variant">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="gc-btn-icon">
                          <MoreVertical className="w-5 h-5 text-on-surface-variant" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="gc-dropdown">
                        <DropdownMenuItem className="gc-dropdown-item">
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gc-dropdown-item text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <p className="mt-3 text-foreground whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>
              </div>

              {/* Comment input */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="gc-avatar gc-avatar-sm bg-primary text-white shrink-0">
                    {getInitials(MOCK_USER.full_name)}
                  </div>
                  <input
                    type="text"
                    placeholder="Add class comment..."
                    className="flex-1 py-2 px-3 bg-surface-variant rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button className="gc-btn-icon text-primary">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DemoStreamTab;
