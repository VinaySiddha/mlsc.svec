'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Calendar, 
  Brain, 
  Play, 
  Save, 
  Trash2, 
  Copy, 
  Check, 
  AlertTriangle, 
  RefreshCw, 
  Plus, 
  ArrowRight,
  Eye,
  CheckCircle,
  HelpCircle,
  FileText
} from 'lucide-react';
import { Button } from '../ui/button';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface AdminQuiz {
  id: string;
  topic: string;
  date: string; // YYYY-MM-DD
  questions: QuizQuestion[];
  createdAt: string;
}

export function QuizManager() {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  
  // Create state
  const [topic, setTopic] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // List state
  const [quizzesList, setQuizzesList] = useState<AdminQuiz[]>([]);
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});
  const [loadingList, setLoadingList] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'list') {
      fetchQuizzes();
    }
  }, [activeTab]);

  // Generate Questions from API
  const handleGenerateQuestions = async () => {
    if (!topic.trim()) {
      setErrorMsg('Please enter a quiz topic.');
      return;
    }
    setGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/quiz?topic=${encodeURIComponent(topic)}`);
      if (!res.ok) {
        throw new Error('Failed to generate quiz. Make sure the backend is active.');
      }
      const data = await res.json();
      setQuestions(data.questions);
      setSuccessMsg('Quiz questions generated successfully! Review and edit them below.');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error generating questions.');
    } finally {
      setGenerating(false);
    }
  };

  // Edit question values inline
  const handleQuestionTextChange = (qIdx: number, text: string) => {
    const updated = [...questions];
    updated[qIdx].question = text;
    setQuestions(updated);
  };

  const handleOptionTextChange = (qIdx: number, oIdx: number, text: string) => {
    const updated = [...questions];
    const oldOption = updated[qIdx].options[oIdx];
    updated[qIdx].options[oIdx] = text;
    
    // If this option was the correct answer, update the answer field as well
    if (updated[qIdx].answer === oldOption) {
      updated[qIdx].answer = text;
    }
    setQuestions(updated);
  };

  const handleCorrectAnswerChange = (qIdx: number, text: string) => {
    const updated = [...questions];
    updated[qIdx].answer = text;
    setQuestions(updated);
  };

  const handleExplanationChange = (qIdx: number, text: string) => {
    const updated = [...questions];
    updated[qIdx].explanation = text;
    setQuestions(updated);
  };

  // Save Quiz to Firestore
  const handleSaveQuiz = async () => {
    if (questions.length !== 5) {
      setErrorMsg('Quiz must have exactly 5 questions.');
      return;
    }
    
    // Validation
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setErrorMsg(`Question ${i + 1} text cannot be empty.`);
        return;
      }
      if (q.options.some(o => !o.trim())) {
        setErrorMsg(`Options for Question ${i + 1} cannot be empty.`);
        return;
      }
      if (!q.answer.trim() || !q.options.includes(q.answer)) {
        setErrorMsg(`Question ${i + 1} must select a correct answer matching one of the options.`);
        return;
      }
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Enforce "only once per day" by checking if a quiz exists with this date
      const quizQuery = query(
        collection(db, 'daily_quizzes'),
        where('date', '==', selectedDate)
      );
      const querySnap = await getDocs(quizQuery);
      
      // Delete existing quizzes for this date
      if (!querySnap.empty) {
        for (const docItem of querySnap.docs) {
          await deleteDoc(doc(db, 'daily_quizzes', docItem.id));
        }
        logger('Deleted existing quiz for date: ' + selectedDate);
      }

      // 2. Generate UUID for the unique page link
      const newQuizId = 'quiz-' + Math.random().toString(36).substring(2, 11);
      
      // 3. Save new quiz
      const newQuizData: AdminQuiz = {
        id: newQuizId,
        topic: topic,
        date: selectedDate,
        questions: questions,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'daily_quizzes', newQuizId), newQuizData);
      
      setSuccessMsg(`Daily Quiz successfully published! Unique Link: /quiz/${newQuizId}`);
      // Clear form
      setQuestions([]);
      setTopic('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to save quiz.');
    } finally {
      setSaving(false);
    }
  };

  // Fetch all scheduled quizzes
  const fetchQuizzes = async () => {
    setLoadingList(true);
    try {
      const q = query(
        collection(db, 'daily_quizzes'),
        orderBy('date', 'desc')
      );
      const snap = await getDocs(q);
      const quizzes: AdminQuiz[] = snap.docs.map(doc => doc.data() as AdminQuiz);
      setQuizzesList(quizzes);

      // Fetch submission counts for each quiz
      const counts: Record<string, number> = {};
      for (const quiz of quizzes) {
        const subQ = query(
          collection(db, 'quiz_leaderboard'),
          where('topic', '==', quiz.topic) // matching topic name as fallback or we can query by quizId
        );
        const subSnap = await getDocs(subQ);
        counts[quiz.id] = subSnap.size;
      }
      setParticipantCounts(counts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz? Users will no longer be able to access the page.')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'daily_quizzes', quizId));
      setQuizzesList(prev => prev.filter(q => q.id !== quizId));
    } catch (e) {
      console.error('Error deleting quiz:', e);
    }
  };

  const copyQuizLink = (quizId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl = `${origin}/quiz/${quizId}/`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(quizId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const logger = (msg: string) => {
    console.log('[AdminQuizManager]', msg);
  };

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-4">
        <button
          onClick={() => setActiveTab('create')}
          className={cn(
            "pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-colors relative",
            activeTab === 'create' ? "text-[#4285F4] border-b-2 border-[#4285F4]" : "text-slate-400 dark:text-zinc-500 hover:text-white"
          )}
        >
          Create Daily Quiz
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={cn(
            "pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-colors relative",
            activeTab === 'list' ? "text-[#4285F4] border-b-2 border-[#4285F4]" : "text-slate-400 dark:text-zinc-500 hover:text-white"
          )}
        >
          Scheduled Quizzes ({quizzesList.length})
        </button>
      </div>

      {/* Tab 1: Create Daily Quiz */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Topic Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-400 uppercase tracking-widest block">Quiz Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. React Context, Data Structures Arrays, CSS Selectors"
                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm focus:outline-none focus:border-[#4285F4] transition-colors"
              />
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-400 uppercase tracking-widest block font-sans">Schedule Date</label>
              <div className="relative flex items-center">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm focus:outline-none focus:border-[#4285F4] transition-colors pr-10"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleGenerateQuestions}
              disabled={generating || !topic.trim()}
              className="bg-[#4285F4] hover:bg-[#4285F4]/90 text-white font-bold uppercase tracking-wider text-xs h-11 px-6 rounded-xl flex items-center gap-2"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Generating Questions...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" /> AI Generate MCQs
                </>
              )}
            </Button>
            
            {questions.length > 0 && (
              <Button
                onClick={handleSaveQuiz}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider text-xs h-11 px-6 rounded-xl flex items-center gap-2 ml-auto"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Publishing...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Publish Challenge
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Feedback banners */}
          {errorMsg && (
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-xs flex items-start gap-2 max-w-3xl">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs flex items-start gap-2 max-w-3xl">
              <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Preview Question Cards */}
          {questions.length > 0 && (
            <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-zinc-800">
              <h3 className="text-base font-black uppercase tracking-wide text-slate-800 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#4285F4]" /> Quiz Questions Preview & Editor
              </h3>
              
              <div className="space-y-6 max-w-4xl">
                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800/80 pb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-[#4285F4]">Question {qIdx + 1}</span>
                      <span className="text-[10px] text-white/35 font-bold uppercase">Must choose correct answer matching options</span>
                    </div>

                    {/* Question text field */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Question Text</label>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-white"
                      />
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Option {String.fromCharCode(65 + optIdx)}</label>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                            className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-white"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Select Correct Answer & Explanation */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Correct answer dropdown */}
                      <div className="space-y-1 md:col-span-1">
                        <label className="text-[9px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Correct Answer</label>
                        <select
                          value={q.answer}
                          onChange={(e) => handleCorrectAnswerChange(qIdx, e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-white uppercase font-bold"
                        >
                          {q.options.map((o, idx) => (
                            <option key={idx} value={o}>
                              Option {String.fromCharCode(65 + idx)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Explanation */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[9px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider block">Explanation Details</label>
                        <textarea
                          rows={2}
                          value={q.explanation}
                          onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-white resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Scheduled Quizzes List */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          {loadingList ? (
            <div className="py-12 text-center text-slate-400 dark:text-zinc-500">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-[#4285F4]" />
              <p className="text-xs font-bold uppercase tracking-wider">Loading scheduled quizzes...</p>
            </div>
          ) : quizzesList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-zinc-500 space-y-2">
              <Calendar className="h-10 w-10 mx-auto" />
              <p className="text-sm font-bold uppercase tracking-wider">No quizzes scheduled yet</p>
              <p className="text-xs max-w-[300px] mx-auto leading-normal">
                Click "Create Daily Quiz" to select a date and let the AI compile a challenge.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Date Scheduled</th>
                    <th className="text-left py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Quiz Topic</th>
                    <th className="text-center py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Participants</th>
                    <th className="text-left py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Unique Link</th>
                    <th className="text-center py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzesList.map((quiz) => {
                    const participantCount = participantCounts[quiz.id] || 0;
                    return (
                      <tr key={quiz.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        {/* Date */}
                        <td className="py-4 px-4 font-bold text-xs uppercase tracking-wide text-slate-800 dark:text-white">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[#4285F4]">
                            <Calendar className="h-3.5 w-3.5" /> {quiz.date}
                          </span>
                        </td>
                        {/* Topic */}
                        <td className="py-4 px-4 font-black uppercase text-xs tracking-wider text-slate-800 dark:text-white">
                          {quiz.topic}
                        </td>
                        {/* Participants */}
                        <td className="py-4 px-4 text-center font-bold text-xs text-slate-800 dark:text-white">
                          {participantCount}
                        </td>
                        {/* Unique Link */}
                        <td className="py-4 px-4 min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-500 select-all truncate max-w-[150px]">
                              /quiz/{quiz.id}
                            </span>
                            <button
                              onClick={() => copyQuizLink(quiz.id)}
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-white transition-all flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider"
                            >
                              {copiedId === quiz.id ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-400" /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" /> Copy URL
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                        {/* Actions */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 hover:text-white"
                            >
                              <a href={`/quiz/${quiz.id}`} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              className="h-8 w-8 hover:bg-red-500/10 text-red-500 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
