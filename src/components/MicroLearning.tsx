/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Course, Lesson } from '../types';
import { BookOpen, Play, CheckCircle, Clock, Award, Star, ChevronRight, ArrowLeft, Loader2, Zap } from 'lucide-react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cn } from '../lib/utils';

import { honeyService } from '../services/honeyService';

export default function MicroLearning() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await api.getCourses();
        setCourses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-12 h-12 animate-spin text-rose-400" />
      </div>
    );
  }

  if (selectedLesson && selectedCourse) {
    const handleLessonComplete = async () => {
      try {
        await honeyService.reward('VIDEO_WATCHED', `Completed ${selectedLesson.title}`);
        setSelectedLesson(null);
      } catch (err) {
        console.error(err);
        setSelectedLesson(null);
      }
    };

    const handleCourseComplete = async () => {
      try {
        await honeyService.reward('COURSE_COMPLETED', `Graduated from ${selectedCourse.title}`);
        setSelectedCourse(null);
      } catch (err) {
        console.error(err);
        setSelectedCourse(null);
      }
    };
    
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <button 
          onClick={() => setSelectedLesson(null)}
          className="flex items-center gap-3 text-sm font-bold text-theme-muted hover:text-theme-text transition-all group px-4"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-all" /> Back to Curriculum
        </button>

        <div className="bg-theme-card rounded-[3.5rem] border-2 border-theme-border shadow-2xl shadow-black/5 dark:shadow-none overflow-hidden">
          <div className="aspect-video bg-theme-secondary relative group overflow-hidden flex flex-col items-center justify-center border-b-2 border-theme-border">
            <img 
              src="https://images.unsplash.com/photo-1558537348-c0f8e733989d?w=1200&auto=format&fit=crop&q=80" 
              alt="Corporate Insight Placeholder" 
              className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-10 grayscale group-hover:scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="relative z-10 flex flex-col items-center gap-6 text-center p-8">
              <div className="w-24 h-24 bg-brand-honey rounded-[2rem] flex items-center justify-center shadow-2xl transform rotate-3 group-hover:rotate-6 transition-transform">
                <Play className="w-10 h-10 text-brand-ink fill-current ml-1" />
              </div>
              <div className="space-y-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <h3 className="text-3xl font-display font-black text-theme-text uppercase tracking-tight">CEO Insights</h3>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-brand-honey rounded-full animate-ping" />
                  <p className="text-theme-muted font-bold uppercase tracking-[0.2em] text-[10px]">Strategic Wisdom Coming Soon</p>
                </div>
              </div>
              
              {/* Bee icon placeholder background */}
              <div className="absolute -bottom-10 -right-10 opacity-5 -rotate-12 pointer-events-none">
                 <span className="text-[12rem]">🐝</span>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-theme-card/80 to-transparent">
               <p className="text-[10px] font-black text-theme-muted uppercase tracking-[0.4em]">Corporate Leadership Series • Exclusive Access</p>
            </div>
          </div>
          <div className="p-10 md:p-16 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-brand-rose rounded-full animate-pulse" />
                   <span className="text-[10px] font-bold text-theme-muted uppercase tracking-[0.3em]">{selectedCourse.title} • Module {selectedLesson.order}</span>
                </div>
                <h2 className="text-5xl font-display font-bold text-theme-text tracking-tight leading-tight">{selectedLesson.title}</h2>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-brand-honey/10 text-brand-honey text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5">
                    +10 Reward Points
                  </span>
                  <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 text-[9px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-1.5">
                    <Play className="w-3 h-3 fill-current" /> CEO Insight
                  </span>
                </div>
              </div>
              <button 
                onClick={handleLessonComplete}
                className="flex items-center gap-3 px-8 py-5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-3xl font-bold hover:bg-emerald-100 transition-all shadow-sm flex-shrink-0"
              >
                <CheckCircle className="w-6 h-6" /> Mark as Complete
              </button>
            </div>
            <div className="prose prose-lg max-w-none text-theme-muted leading-relaxed font-inter first-letter:text-5xl first-letter:font-display first-letter:font-bold first-letter:text-brand-rose first-letter:mr-3 first-letter:float-left whitespace-pre-line">
              <Markdown>{selectedLesson.content}</Markdown>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedCourse) {
    const isCertificationReady = selectedCourse.lessons.length > 0;
    
    return (
      <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <button 
          onClick={() => setSelectedCourse(null)}
          className="flex items-center gap-3 text-sm font-bold text-theme-muted hover:text-theme-text transition-all group px-4"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-all" /> View Catalog
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-theme-card p-10 md:p-14 rounded-[4rem] border-2 border-theme-border shadow-2xl shadow-black/5 dark:shadow-none space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12 transform">
                <BookOpen className="w-40 h-40 text-theme-text" />
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <span className="px-5 py-2 bg-brand-ink dark:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-2xl">{selectedCourse.category}</span>
                <div className="flex items-center gap-1.5 px-4 py-2 bg-brand-honey/20 text-amber-600 rounded-full border border-amber-100 dark:border-amber-900/40">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="text-xs font-bold">Top Pick</span>
                </div>
              </div>
              <h2 className="text-6xl font-display font-bold text-theme-text tracking-tight relative z-10 leading-tight">{selectedCourse.title}</h2>
              <p className="text-theme-muted text-xl leading-relaxed font-inter relative z-10">{selectedCourse.description}</p>
              
              <div className="flex flex-wrap items-center gap-8 pt-10 border-t border-theme-border relative z-10">
                <div className="flex items-center gap-3 bg-theme-bg px-5 py-3 rounded-2xl">
                  <Clock className="w-5 h-5 text-theme-muted" />
                  <span className="text-sm font-bold text-theme-text">{selectedCourse.duration}</span>
                </div>
                <div className="flex items-center gap-3 bg-theme-bg px-5 py-3 rounded-2xl">
                  <BookOpen className="w-5 h-5 text-theme-muted" />
                  <span className="text-sm font-bold text-theme-text">{selectedCourse.lessons.length} Modules</span>
                </div>
                <div className="flex items-center gap-3 bg-theme-bg px-5 py-3 rounded-2xl">
                  <Award className="w-5 h-5 text-theme-muted" />
                  <span className="text-sm font-bold text-theme-text">Certification Ready</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-brand-honey/10 text-brand-honey rounded-xl border border-brand-honey/20">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold">+50 Completion Reward</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-3xl font-display font-bold text-theme-text px-6">Curriculum</h3>
              <div className="space-y-4">
                {selectedCourse.lessons.map((lesson) => (
                  <button 
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className="w-full flex items-center justify-between p-8 bg-theme-card border-2 border-theme-border rounded-[2.5rem] hover:shadow-2xl hover:border-brand-rose transition-all group text-left"
                  >
                    <div className="flex items-center gap-8">
                      <div className="w-16 h-16 bg-theme-bg rounded-3xl flex items-center justify-center text-xl font-display font-bold text-theme-muted group-hover:bg-brand-rose group-hover:text-rose-500 transition-all shadow-inner">
                        {lesson.order}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xl font-bold text-theme-text group-hover:text-rose-600 transition-colors">{lesson.title}</h4>
                        <p className="text-[10px] font-bold text-theme-muted uppercase tracking-[0.2em] mt-1">
                          Strategic Video • 5 mins
                        </p>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-theme-border flex items-center justify-center text-theme-muted group-hover:border-rose-500 group-hover:text-rose-500 transition-all">
                       <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-brand-ink dark:bg-brand-honey p-12 rounded-[4rem] text-white dark:text-brand-ink shadow-2xl space-y-8 sticky top-8 overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 dark:bg-brand-ink/10 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-1000"></div>
              <div className="w-20 h-20 bg-white/10 dark:bg-brand-ink/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center border-2 border-white/10 dark:border-brand-ink/20 shadow-inner">
                <Zap className="w-10 h-10 text-brand-honey dark:text-brand-ink" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-display font-bold">Upskill Today</h3>
                <p className="text-theme-muted dark:text-brand-ink/70 text-lg leading-snug">Join 5,000+ other business owners mastering these skills.</p>
              </div>
              <div className="pt-4 space-y-3">
                <button 
                  onClick={() => setSelectedLesson(selectedCourse.lessons[0])}
                  className="w-full py-6 bg-brand-honey text-brand-ink rounded-3xl font-bold text-lg hover:shadow-[0_20px_40px_rgba(251,191,36,0.2)] hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                >
                  Enroll Now 🚀
                </button>
                <button 
                  onClick={async () => {
                    const confirmComplete = confirm("Have you finished all lessons in this course? You will earn 50 reward points!");
                    if (confirmComplete) {
                       await honeyService.reward('COURSE_COMPLETED', `Completed ${selectedCourse.title}`);
                       setSelectedCourse(null);
                    }
                  }}
                  className="w-full py-4 bg-emerald-500 text-white rounded-3xl font-bold text-sm hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" /> Claim Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-16">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h2 className="text-5xl font-display font-bold text-theme-text tracking-tight uppercase">Knowledge Center</h2>
          <p className="text-theme-muted text-xl font-medium">Bite-sized business lessons for focused growth.</p>
        </div>
        <div className="flex items-center gap-4 px-8 py-4 bg-brand-honey/10 text-brand-honey rounded-[2rem] border-2 border-brand-honey/20 shadow-sm">
          <Award className="w-6 h-6 animate-bounce" />
          <span className="text-sm font-bold uppercase tracking-[0.2em]">Learning Pathway</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {courses.map(course => (
          <div 
            key={course.id} 
            onClick={() => setSelectedCourse(course)}
            className="bg-theme-card rounded-[4rem] border-2 border-theme-border shadow-2xl shadow-black/5 dark:shadow-none overflow-hidden hover:shadow-brand-honey/10 hover:-translate-y-3 transition-all cursor-pointer group"
          >
            <div className="aspect-[16/11] bg-theme-bg relative overflow-hidden">
              <img 
                src={course.thumbnail_url || `https://picsum.photos/seed/${course.id}/800/550`} 
                alt={course.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute top-6 left-6">
                <span className="px-5 py-2.5 bg-theme-card/90 backdrop-blur-md text-theme-text text-[10px] font-bold uppercase tracking-[0.2em] rounded-2xl shadow-xl border border-theme-border/50">
                  {course.category}
                </span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0 transform">
                 <div className="w-16 h-16 bg-brand-honey rounded-full flex items-center justify-center shadow-2xl">
                    <Play className="w-6 h-6 text-brand-ink fill-current ml-1" />
                 </div>
              </div>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-3">
                <h3 className="text-3xl font-display font-bold text-theme-text leading-[1.1] group-hover:text-brand-honey transition-colors duration-500">{course.title}</h3>
                <p className="text-theme-muted text-base leading-relaxed line-clamp-2 font-medium">{course.description}</p>
              </div>
              <div className="flex items-center justify-between pt-8 border-t border-theme-border">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-theme-muted" />
                    <span className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-theme-muted" />
                    <span className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">{course.lessons.length} Modules</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-theme-bg rounded-full flex items-center justify-center text-theme-muted group-hover:bg-brand-honey group-hover:text-brand-ink transition-all shadow-inner">
                   <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="col-span-full text-center py-32 bg-theme-card rounded-[4rem] border-4 border-dashed border-theme-border">
            <div className="w-24 h-24 bg-theme-bg rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
               <BookOpen className="w-10 h-10 text-theme-muted" />
            </div>
            <h4 className="text-2xl font-display font-bold text-theme-muted uppercase">Curriculum Coming Soon</h4>
            <p className="text-theme-muted font-medium mt-2">Our team is preparing new business lessons for you.</p>
          </div>
        )}
      </div>
    </div>
  );
}
