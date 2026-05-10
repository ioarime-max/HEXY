/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api';
import { CommunityPost } from '../types';
import { MessageCircle, Heart, Share2, Search, Filter, Plus, User, Loader2, Trash2, Send, ShoppingBag, Image as ImageIcon, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import Markdown from 'react-markdown';
import { useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { socket } from '../lib/socket';
import { cn } from '../lib/utils';
import { useSocket } from './SocketProvider';
import Logo from './ui/Logo';
import { Avatar } from './ui/Avatar';
import { honeyService } from '../services/honeyService';
import { toast } from 'sonner';

interface CommunityFeedProps {
  mode?: 'community' | 'forum';
}

export default function CommunityFeed({ mode = 'community' }: CommunityFeedProps) {
  const { user } = useSocket();
  const location = useLocation();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const communityCategories = ['All', 'General', 'Success Stories'];
  const forumCategories = ['All', 'Advice Needed', 'Collaboration', 'Marketplace'];
  const categories = mode === 'forum' ? forumCategories : communityCategories;

  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    setActiveCategory('All');
  }, [mode]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category && categories.includes(category)) {
      setActiveCategory(category);
    }
  }, [location.search, categories]);
  const [showAddModal, setShowAddModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPost, setNewPost] = useState({ 
    title: '', 
    content: '', 
    category: mode === 'forum' ? 'Advice Needed' : 'General', 
    price: '', 
    image_keyword: '',
    image_url: '' 
  });
  const [commentingOn, setCommentingOn] = useState<string | number | null>(null);
  const [commentInput, setCommentInput] = useState('');

  const [sortOption, setSortOption] = useState<'newest' | 'likes' | 'comments'>('newest');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image is too large! Max 10MB please.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPost(prev => ({ ...prev, image_url: reader.result as string }));
      toast.success("Image uploaded successfully! 📸");
    };
    reader.readAsDataURL(file);
  };

  const loadPosts = async () => {
    try {
      console.log(`Fetching ${mode} posts...`);
      const data = await api.getCommunityPosts();
      // If we had a real backend, we'd filter or fetch from different endpoints
      // For now we filter locally based on categories allowed in each mode
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch community posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();

    // Socket listeners
    socket.on("post:created", (post: CommunityPost) => {
      setPosts(prev => {
        if (prev.some(p => p.id === post.id)) return prev;
        return [post, ...prev];
      });
    });

    socket.on("post:liked", ({ postId, likes, likedBy }: { postId: string | number; likes: number; likedBy: (string|number)[] }) => {
      setPosts(prev => prev.map(p => 
        p.id.toString() === postId.toString() ? { ...p, likes, likedBy } : p
      ));
    });

    socket.on("post:updated", (post: CommunityPost) => {
      setPosts(prev => prev.map(p => p.id === post.id ? post : p));
    });

    socket.on("post:deleted", (postId: string | number) => {
      setPosts(prev => prev.filter(p => p.id.toString() !== postId.toString()));
    });

    return () => {
      socket.off("post:created");
      socket.off("post:liked");
      socket.off("post:updated");
      socket.off("post:deleted");
    };
  }, []);

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content) return;
    try {
      const content = newPost.category === 'Marketplace' && newPost.price 
        ? `${newPost.content}\n\n🏷️ **Price: RM ${newPost.price}**` 
        : newPost.content;
      
      const payload = { 
        ...newPost, 
        content,
        // If marketplace, we could also list it in the real marketplace here if we wanted to sync
      };
      
      await api.createCommunityPost(payload);
      setShowAddModal(false);
      setNewPost({ title: '', content: '', category: mode === 'forum' ? 'Advice Needed' : 'General', price: '', image_keyword: '', image_url: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (postId: string | number) => {
    try {
      const response = await api.likePost(postId);
      if (response.liked) {
        // Heart animation trigger or local feedback
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptAnswer = async (postId: string | number, commentId: string) => {
    try {
      await api.acceptAnswer(postId, commentId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (postId: string | number) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.deletePost(postId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (postId: string | number) => {
    if (!commentInput.trim()) return;
    try {
      await api.addComment(postId, commentInput);
      await honeyService.reward('COMMENT_ADDED', `Shared thoughts on: ${posts.find(p => p.id === postId)?.title || 'Discussion'}`);
      setCommentInput('');
      setCommentingOn(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPosts = posts
    .filter(post => {
      if (!post) return false;
      const title = post.title || "";
      const content = post.content || "";
      const matchesSearch = (title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            content.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory === 'All' 
        ? categories.includes(post.category) 
        : post.category === activeCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOption === 'newest') {
        const dateB = new Date(b.createdAt || (b as any).created_at || new Date()).getTime();
        const dateA = new Date(a.createdAt || (a as any).created_at || new Date()).getTime();
        return dateB - dateA;
      }
      if (sortOption === 'likes') {
        return (b.likes || 0) - (a.likes || 0);
      }
      if (sortOption === 'comments') {
        const commentsB = Array.isArray(b.comments) ? b.comments.length : 0;
        const commentsA = Array.isArray(a.comments) ? a.comments.length : 0;
        return commentsB - commentsA;
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-12 h-12 animate-spin text-rose-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-display font-bold text-[var(--text-main)] tracking-tight flex items-center gap-3 uppercase">
            {mode === 'forum' ? 'B2B Forum' : 'Community Hub'} <Logo variant="icon" showText={false} className="bg-transparent shadow-none" />
          </h2>
          <p className="text-[var(--text-muted)] text-lg font-medium">
            {mode === 'forum' 
              ? 'Professional insights, collaborations, and business growth.' 
              : 'Connect, share stories, and celebrate local SME success.'}
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-honey text-brand-ink rounded-2xl font-bold hover:shadow-xl transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-5 h-5 text-brand-ink" /> <span className="text-brand-ink">Create {mode === 'forum' ? 'Thread' : 'Post'}</span>
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
          <input 
            type="text" 
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl focus:border-brand-honey focus:ring-0 transition-all shadow-sm font-medium text-base outline-none text-[var(--text-main)] placeholder:text-theme-muted"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-shrink-0 group min-w-[160px]">
             <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-honey transition-colors" />
             <select 
               value={sortOption}
               onChange={(e) => setSortOption(e.target.value as any)}
               className="w-full pl-11 pr-10 py-3.5 bg-theme-card border border-theme-border rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-brand-honey transition-all appearance-none cursor-pointer text-theme-text"
             >
               <option value="newest">Newest</option>
               <option value="likes">Most Likes</option>
               <option value="comments">Most Comments</option>
             </select>
             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-theme-muted">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
             </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-hide">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
                  activeCategory === cat 
                    ? "bg-brand-honey text-brand-ink border-brand-honey shadow-md" 
                    : "bg-brand-honey/5 text-brand-honey border-brand-honey/20 hover:border-brand-honey shadow-sm"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.div layout className="space-y-8">
        <AnimatePresence>
          {filteredPosts.map((post, idx) => (
            <motion.article 
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: (idx % 10) * 0.05 }}
              key={post.id} 
              className="bg-[var(--bg-card)] p-10 md:p-12 rounded-[4rem] border border-[var(--border-main)] shadow-2xl shadow-gray-200/10 hover:shadow-brand-honey/20 hover:-translate-y-2 transition-all group relative overflow-hidden"
            >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100/50 dark:bg-slate-900/50 rounded-bl-[4rem] -z-10 transition-colors group-hover:bg-brand-honey/10"></div>
            
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-5">
                <Avatar 
                  src={post.authorAvatar || (post as any).author_avatar} 
                  alt={post.authorName || (post as any).author_name} 
                  size="lg" 
                  className="bg-brand-honey/10 border-2 border-brand-honey/20 shadow-inner group-hover:rotate-6 transition-transform"
                />
                <div>
                  <h4 className="text-xl font-display font-bold text-[var(--text-main)]">{post.authorName || (post as any).author_name || 'Member'}</h4>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{format(new Date(post.createdAt || (post as any).created_at || new Date()), 'MMM d, yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-5 py-2.5 bg-brand-honey text-brand-ink text-[10px] font-bold uppercase tracking-[0.2em] rounded-2xl shadow-sm border border-brand-honey">
                  {post.category}
                </span>
                {user && (user.id === post.userId || user.id === (post as any).user_id) && (
                  <button 
                    onClick={() => handleDelete(post.id)}
                    className="p-2.5 bg-theme-secondary text-theme-dim hover:bg-rose-50 dark:hover:bg-rose-900/50 hover:text-rose-500 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <h3 className="text-3xl font-display font-bold text-brand-honey mb-5 leading-tight">{post.title}</h3>
            <div className="text-[var(--text-muted)] text-lg leading-relaxed mb-6 line-clamp-3 font-medium whitespace-pre-line">
              <Markdown>{post.content}</Markdown>
            </div>

            {post.image_url && (
              <div className="mb-8 rounded-[2rem] overflow-hidden border border-theme-border shadow-inner">
                <img 
                  src={post.image_url} 
                  alt={post.title}
                  className="w-full h-auto max-h-[500px] object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            
            <div className="flex items-center gap-10 pt-8 border-t border-[var(--border-main)]">
              <button 
                onClick={() => handleLike(post.id)}
                className={cn(
                  "flex items-center gap-3 transition-all border-none bg-transparent cursor-pointer group/btn",
                  user && post.likedBy?.includes(user.id) ? "text-rose-500" : "text-[var(--text-muted)] hover:text-rose-500"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                  user && post.likedBy?.includes(user.id) ? "bg-rose-50 dark:bg-rose-900/30" : "bg-theme-secondary group-hover/btn:bg-rose-50 dark:group-hover/btn:bg-rose-900/30"
                )}>
                  <Heart className={cn(
                    "w-6 h-6 transition-all",
                    user && post.likedBy?.includes(user.id) ? "fill-rose-500" : "group-hover/btn:fill-rose-500 group-hover/btn:scale-110"
                  )} />
                </div>
                <span className="text-lg font-bold">{post.likes}</span>
              </button>
              <button 
                onClick={() => setCommentingOn(commentingOn === post.id ? null : post.id)}
                className={cn(
                  "flex items-center gap-3 text-[var(--text-muted)] hover:text-brand-honey transition-all group/btn",
                  commentingOn === post.id && "text-brand-honey"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                  commentingOn === post.id ? "bg-amber-50 dark:bg-amber-900/20 text-amber-500" : "bg-theme-secondary group-hover/btn:bg-amber-50 dark:group-hover/btn:bg-amber-900/10"
                )}>
                  <MessageCircle className={cn("w-6 h-6 group-hover/btn:text-amber-500 transition-colors", commentingOn === post.id && "text-amber-500")} />
                </div>
                <span className="text-lg font-bold">{Array.isArray(post.comments) ? post.comments.length : 0}</span>
              </button>
              <button className="flex items-center gap-3 text-[var(--text-muted)] hover:text-brand-honey transition-all ml-auto group/btn">
                <div className="w-12 h-12 rounded-full bg-theme-secondary flex items-center justify-center group-hover/btn:bg-sky-50 dark:group-hover/btn:bg-sky-900/10 transition-colors">
                  <Share2 className="w-6 h-6 group-hover/btn:text-sky-500" />
                </div>
              </button>
            </div>

            {/* Comments Section */}
            {commentingOn === post.id && (
              <div className="mt-8 pt-8 border-t border-[var(--border-main)] animate-in slide-in-from-top-4 duration-300">
                <div className="space-y-6 mb-8">
                  {post.comments?.map((comment: any) => (
                    <div key={comment.id} className="flex gap-4 group/comment relative">
                      <Avatar 
                        src={comment.author_avatar} 
                        alt={comment.author_name} 
                        size="md" 
                        className="bg-gray-100 dark:bg-slate-800"
                      />
                      <div className={cn(
                        "flex-1 p-4 rounded-3xl rounded-tl-none border transition-all",
                        post.acceptedCommentId === comment.id 
                          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" 
                          : "bg-gray-50 dark:bg-slate-900 border-transparent dark:border-slate-800"
                      )}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[var(--text-main)]">{comment.author_name}</span>
                            {post.acceptedCommentId === comment.id && (
                              <span className="flex items-center gap-1 text-[8px] font-black text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                <Plus className="w-2 h-2 rotate-45" /> Helpful
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{format(new Date(comment.created_at || new Date()), 'h:mm a')}</span>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] font-medium">{comment.content}</p>
                      </div>
                      
                      {user && user.id === (post.user_id || post.userId) && !post.acceptedCommentId && post.category === 'Advice Needed' && comment.user_id !== user.id && (
                        <button 
                          onClick={() => handleAcceptAnswer(post.id, comment.id)}
                          className="absolute right-4 top-4 opacity-0 group-hover/comment:opacity-100 transition-opacity px-3 py-1.5 bg-white dark:bg-slate-800 text-emerald-600 text-[9px] font-bold uppercase tracking-widest rounded-lg border border-emerald-100 dark:border-emerald-900 shadow-sm hover:bg-emerald-50"
                        >
                          Mark Helpful
                        </button>
                      )}
                    </div>
                  ))}
                  {(!post.comments || post.comments.length === 0) && (
                    <p className="text-center text-xs font-bold text-theme-muted uppercase tracking-widest py-4">No comments yet. Be the first!</p>
                  )}
                </div>
                
                <div className="relative">
                  <input 
                    type="text" 
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                    placeholder="Add to the discussion..."
                    className="w-full pl-6 pr-14 py-4 bg-gray-50 dark:bg-slate-900 border-2 border-transparent rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:border-brand-rose transition-all outline-none font-medium text-theme-text"
                  />
                  <button 
                    onClick={() => handleAddComment(post.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-ink dark:bg-amber-500 text-white dark:text-brand-ink rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.article>
        ))}
        </AnimatePresence>
        {filteredPosts.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 bg-slate-50/50 dark:bg-slate-900/50 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-slate-800"
          >
            <div className="w-24 h-24 bg-theme-secondary rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
               <MessageCircle className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            </div>
            <h4 className="text-2xl font-display font-bold text-theme-dim uppercase">Start the conversation</h4>
            <p className="text-theme-muted font-medium mt-2">No discussions found. Be the first to post!</p>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
      {showAddModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-brand-ink/40 dark:bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-[100] p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-[var(--bg-card)] w-full max-w-2xl rounded-[4rem] shadow-[0_40px_80px_rgba(0,0,0,0.3)] overflow-hidden border border-[var(--border-main)]"
          >
            <div className="p-12 border-b border-[var(--border-main)] flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-4xl font-display font-bold text-[var(--text-main)] uppercase">Create Post</h3>
                <p className="text-[var(--text-muted)] text-lg font-medium">Share your thoughts with the community.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-12 h-12 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                 <Plus className="w-8 h-8 rotate-45 text-slate-400 dark:text-slate-700" />
              </button>
            </div>
            <div className="p-12 space-y-8 overflow-y-auto max-h-[60vh] scrollbar-hide">
              <div>
                <label className="text-[10px] font-bold text-theme-muted uppercase tracking-[0.2em] mb-4 block">Pick a Category</label>
                <div className="flex flex-wrap gap-3">
                  {categories.filter(c => c !== 'All').map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setNewPost({ ...newPost, category: cat })}
                      className={cn(
                        "px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-[0.1em] transition-all border-2",
                        newPost.category === cat 
                          ? "bg-brand-honey text-brand-ink border-brand-honey scale-105" 
                          : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-main)] hover:border-brand-honey hover:text-brand-honey"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-theme-muted uppercase tracking-[0.2em] block">Title</label>
                <input 
                  type="text" 
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 border-2 border-transparent rounded-3xl focus:border-brand-honey focus:bg-white dark:focus:bg-slate-800 transition-all font-display font-bold text-2xl placeholder:text-theme-dim outline-none text-slate-900 dark:text-white"
                  placeholder={newPost.category === 'Marketplace' ? "Product Name..." : "Title of your post..."}
                />
              </div>

              {newPost.category === 'Marketplace' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-2 gap-6"
                >
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-theme-dim uppercase tracking-[0.2em] block">Price (RM)</label>
                    <input 
                      type="number" 
                      value={newPost.price}
                      onChange={(e) => setNewPost({ ...newPost, price: e.target.value })}
                      className="w-full px-8 py-5 bg-theme-bg dark:bg-slate-900 border-2 border-transparent rounded-3xl focus:border-brand-honey focus:bg-[var(--bg-card)] transition-all font-bold text-xl outline-none text-[var(--text-main)] placeholder:text-theme-dim"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-theme-dim uppercase tracking-[0.2em] block">Visual (Image Seed)</label>
                    <input 
                      type="text" 
                      value={newPost.image_keyword}
                      onChange={(e) => setNewPost({ ...newPost, image_keyword: e.target.value })}
                      className="w-full px-8 py-5 bg-theme-bg dark:bg-slate-900 border-2 border-transparent rounded-3xl focus:border-brand-honey focus:bg-[var(--bg-card)] transition-all font-bold text-xl outline-none text-[var(--text-main)] placeholder:text-theme-dim"
                      placeholder="e.g. batik"
                    />
                  </div>
                </motion.div>
              )}

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-theme-dim uppercase tracking-[0.2em] block">Community Visuals</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-48 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-theme-border flex flex-col items-center justify-center cursor-pointer hover:border-brand-honey transition-all overflow-hidden group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  {newPost.image_url ? (
                    <>
                      <img src={newPost.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-brand-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-md rounded-full p-3 border border-white/30 text-white">
                          <Upload className="w-6 h-6" />
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewPost(prev => ({ ...prev, image_url: '' }));
                        }}
                        className="absolute top-4 right-4 w-10 h-10 bg-brand-ink/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-brand-honey" />
                      </div>
                      <p className="text-sm font-bold text-theme-muted">Upload Photos <span className="text-brand-honey">(Max 10MB)</span></p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-theme-dim uppercase tracking-[0.2em] block">Content</label>
                <textarea 
                  rows={4}
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 border-2 border-transparent rounded-[2.5rem] focus:border-brand-honey focus:bg-white dark:focus:bg-slate-800 transition-all resize-none font-medium text-lg placeholder:text-theme-dim outline-none text-slate-900 dark:text-slate-100"
                  placeholder={newPost.category === 'Marketplace' ? "Describe your product..." : "Write your content here..."}
                />
              </div>
            </div>
            <div className="p-12 bg-gray-50/50 dark:bg-slate-900/50 flex gap-6">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-6 bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-muted)] rounded-3xl font-bold text-lg hover:text-[var(--text-main)] hover:bg-gray-100 dark:hover:bg-slate-800 transition-all shadow-sm"
              >
                Cancel
              </button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreatePost}
                className="flex-[2] py-6 bg-brand-honey text-brand-ink rounded-3xl font-bold text-lg hover:shadow-2xl dark:hover:shadow-none hover:scale-[1.02] transition-all shadow-xl dark:shadow-none"
              >
                <span className="text-brand-ink flex items-center gap-2">Publish Post <Logo variant="icon" showText={false} className="bg-transparent shadow-none w-5 h-5" /></span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
