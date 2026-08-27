'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Coins, 
  Timer, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Lock, 
  RefreshCw, 
  Play, 
  HelpCircle, 
  Award, 
  Sparkles, 
  Home,
  User as UserIcon,
  ShieldAlert
} from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  increment, 
  setDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface QuizData {
  id: string;
  topic: string;
  date: string;
  questions: QuizQuestion[];
}

interface LeaderboardRecord {
  displayName: string;
  score: number;
  timeTaken: number;
  coinsEarned: number;
  createdAt: string;
}

const playSound = (type: 'start' | 'correct' | 'incorrect' | 'complete') => {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    const playTone = (freq: number, type: OscillatorType, duration: number, delay: number = 0) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration - 0.05);
      
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    };

    if (type === 'start') {
      playTone(261.63, 'sine', 0.2, 0); // C4
      playTone(329.63, 'sine', 0.2, 0.1); // E4
      playTone(392.00, 'sine', 0.2, 0.2); // G4
      playTone(523.25, 'sine', 0.4, 0.3); // C5
    } else if (type === 'correct') {
      playTone(523.25, 'sine', 0.1, 0); // C5
      playTone(659.25, 'sine', 0.25, 0.08); // E5
    } else if (type === 'incorrect') {
      playTone(220.00, 'triangle', 0.2, 0); // A3
      playTone(196.00, 'triangle', 0.25, 0.08); // G3
    } else if (type === 'complete') {
      playTone(261.63, 'sine', 0.15, 0); // C4
      playTone(329.63, 'sine', 0.15, 0.1); // E4
      playTone(392.00, 'sine', 0.15, 0.2); // G4
      playTone(523.25, 'sine', 0.2, 0.3); // C5
      playTone(659.25, 'sine', 0.2, 0.4); // E5
      playTone(783.99, 'sine', 0.4, 0.5); // G5
    }
  } catch (err) {
    console.warn('Audio Context failed:', err);
  }
};

export function DailyQuizBoard({ quizId }: { quizId: string }) {
  const { user } = useAuth();
  const router = useRouter();

  // Loading States
  const [loading, setLoading] = useState(true);
  const [quizNotFound, setQuizNotFound] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Core Data States
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRecord[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // User Status States
  const [userCoins, setUserCoins] = useState(0);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [previousAttempt, setPreviousAttempt] = useState<{
    score: number;
    timeTaken: number;
    coinsEarned: number;
    rank?: number;
    totalPlayers?: number;
  } | null>(null);

  // Rank Shift States
  const [totalPlayersBefore, setTotalPlayersBefore] = useState(0);
  const [computedRank, setComputedRank] = useState(0);

  // Quiz Play States
  const [quizActive, setQuizActive] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizTimeTaken, setQuizTimeTaken] = useState(0);
  const [explanationVisible, setExplanationVisible] = useState(false);

  // Submission States
  const [nickname, setNickname] = useState('');
  const [submittingScore, setSubmittingScore] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  // Stopwatch references
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const quizStartTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const totalPausedTimeRef = useRef<number>(0);

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch Quiz Data and User Attempt Details
  useEffect(() => {
    if (isMounted) {
      loadQuizAndUserStatus();
    }
  }, [quizId, user, isMounted]);

  const loadQuizAndUserStatus = async () => {
    setLoading(true);
    setQuizNotFound(false);
    try {
      // 1. Fetch quiz doc
      const quizRef = doc(db, 'daily_quizzes', quizId);
      const quizSnap = await getDoc(quizRef);

      if (!quizSnap.exists()) {
        setQuizNotFound(true);
        setLoading(false);
        return;
      }

      const qData = quizSnap.data() as QuizData;
      setQuiz(qData);

      // 2. Fetch User Coin Balance
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserCoins(userSnap.data().coins || 0);
        }
      }

      // 3. Check for previous attempts (Once per day lock)
      let hasAttempted = false;

      // Check localStorage first
      if (localStorage.getItem(`mlsc_quiz_done_${quizId}`)) {
        hasAttempted = true;
      }

      // Check Firestore if logged in
      if (user) {
        const checkQ = query(
          collection(db, 'quiz_leaderboard'),
          where('uid', '==', user.uid),
          where('quizId', '==', quizId)
        );
        const checkSnap = await getDocs(checkQ);
        if (!checkSnap.empty) {
          hasAttempted = true;
          const attemptData = checkSnap.docs[0].data();
          
          // Compute their rank
          const allQ = query(
            collection(db, 'quiz_leaderboard'),
            where('quizId', '==', quizId)
          );
          const allSnap = await getDocs(allQ);
          const allAttempts = allSnap.docs.map(docSnap => docSnap.data() as LeaderboardRecord);
          
          let prevRank = 1;
          for (const attempt of allAttempts) {
            if (attempt.score > attemptData.score) {
              prevRank++;
            } else if (attempt.score === attemptData.score) {
              if (attempt.timeTaken < attemptData.timeTaken) {
                prevRank++;
              }
            }
          }
          
          setPreviousAttempt({
            score: attemptData.score || 0,
            timeTaken: attemptData.timeTaken || 0,
            coinsEarned: attemptData.coinsEarned || 0,
            rank: prevRank,
            totalPlayers: allAttempts.length
          });
        }
      }

      setAlreadyCompleted(hasAttempted);
      fetchLeaderboard();
    } catch (err) {
      console.error('Error loading quiz/status:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const q = query(
        collection(db, 'quiz_leaderboard'),
        where('quizId', '==', quizId),
        orderBy('score', 'desc'),
        orderBy('timeTaken', 'asc'),
        limit(10)
      );
      const snap = await getDocs(q);
      const records = snap.docs.map(docSnap => docSnap.data() as LeaderboardRecord);
      setLeaderboard(records);
    } catch (e) {
      console.error('Error loading quiz leaderboard:', e);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleStartQuiz = () => {
    if (!quiz) return;
    
    playSound('start');
    
    // Reset play states
    setCurrentQuestionIdx(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setExplanationVisible(false);
    setQuizTimeTaken(0);
    totalPausedTimeRef.current = 0;
    setScoreSubmitted(false);
    
    // Start Timer
    quizStartTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - quizStartTimeRef.current - totalPausedTimeRef.current) / 1000;
      setQuizTimeTaken(elapsed);
    }, 100);

    setQuizActive(true);
  };

  const handleSelectOption = (option: string) => {
    if (selectedAnswer) return; // already answered
    setSelectedAnswer(option);
    setExplanationVisible(true);
    
    // Pause stopwatch to read explanation
    pauseTimeRef.current = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);

    if (option === quiz!.questions[currentQuestionIdx].answer) {
      setQuizScore(prev => prev + 1);
      playSound('correct');
    } else {
      playSound('incorrect');
    }
  };

  const handleNextQuestion = () => {
    // Add pause duration to total paused time
    const pauseDuration = Date.now() - pauseTimeRef.current;
    totalPausedTimeRef.current += pauseDuration;
    
    if (currentQuestionIdx < quiz!.questions.length - 1) {
      setSelectedAnswer(null);
      setExplanationVisible(false);
      setCurrentQuestionIdx(prev => prev + 1);
      
      // Resume stopwatch
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - quizStartTimeRef.current - totalPausedTimeRef.current) / 1000;
        setQuizTimeTaken(elapsed);
      }, 100);
    } else {
      // Quiz complete
      setQuizActive(false);
      setQuizCompleted(true);
      
      playSound('complete');
      
      if (timerRef.current) clearInterval(timerRef.current);

      const finalTime = Number(quizTimeTaken.toFixed(1));
      const baseCoins = quizScore * 10;
      const speedBonus = quizScore === 5 ? Math.max(0, Math.round((40 - finalTime) * 2)) : 0;
      const totalEarned = baseCoins + speedBonus;

      // Lock quiz locally
      localStorage.setItem(`mlsc_quiz_done_${quizId}`, 'true');

      // Auto-submit score to database if logged in
      if (user) {
        handleSubmitScore(totalEarned);
      }
    }
  };

  const handleSubmitScore = async (coinsToAward?: number) => {
    if (!user) return;
    setSubmittingScore(true);
    try {
      const finalTime = Number(quizTimeTaken.toFixed(1));
      const baseCoins = quizScore * 10;
      const speedBonus = quizScore === 5 ? Math.max(0, Math.round((40 - finalTime) * 2)) : 0;
      const finalCoins = coinsToAward !== undefined ? coinsToAward : baseCoins + speedBonus;

      // 1. Fetch current leaderboard before adding the new record to compute rank shift
      const q = query(
        collection(db, 'quiz_leaderboard'),
        where('quizId', '==', quizId)
      );
      const snap = await getDocs(q);
      const allAttempts = snap.docs.map(docSnap => docSnap.data() as LeaderboardRecord);
      const totalBefore = allAttempts.length;

      // Compute rank before adding current record
      let finalRank = 1;
      for (const attempt of allAttempts) {
        if (attempt.score > quizScore) {
          finalRank++;
        } else if (attempt.score === quizScore) {
          if (attempt.timeTaken < finalTime) {
            finalRank++;
          }
        }
      }

      setTotalPlayersBefore(totalBefore);
      setComputedRank(finalRank);

      const record = {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        username: user.email?.split('@')[0] || 'anonymous',
        quizId: quizId,
        score: quizScore,
        timeTaken: finalTime,
        coinsEarned: finalCoins,
        topic: quiz!.topic,
        createdAt: new Date().toLocaleDateString(),
      };

      // 2. Submit to Firestore quiz_leaderboard
      await addDoc(collection(db, 'quiz_leaderboard'), record);

      // 3. Award coins
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        coins: increment(finalCoins),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setUserCoins(prev => prev + finalCoins);

      setScoreSubmitted(true);
      fetchLeaderboard();
    } catch (e) {
      console.error('Error submitting score:', e);
    } finally {
      setSubmittingScore(false);
    }
  };

  const getCoinsEarnedAmount = () => {
    const baseCoins = quizScore * 10;
    const speedBonus = quizScore === 5 ? Math.max(0, Math.round((40 - quizTimeTaken) * 2)) : 0;
    return baseCoins + speedBonus;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="w-full bg-black min-h-screen py-24 md:py-32 text-white relative overflow-hidden flex items-center justify-center">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-yellow-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[250px] h-[250px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl w-full mx-auto px-6 relative z-10 space-y-8">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <Link href="/services/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider">
            <ArrowLeft className="h-4 w-4" /> Exit Challenge
          </Link>
          
          {isMounted && (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-black text-xs uppercase tracking-widest">
              <Coins className="h-4 w-4 text-yellow-400 shrink-0" /> {userCoins} Coins
            </div>
          )}
        </div>

        {/* 1. Loading State */}
        {loading && (
          <div className="p-8 rounded-3xl border border-white/5 bg-[#050505]/60 backdrop-blur-xl shadow-2xl py-24 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-yellow-400 mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">Securing Daily Arena Access...</p>
          </div>
        )}

        {/* 1.5 Login Required Gate */}
        {!loading && !user && (
          <div className="p-8 rounded-3xl border border-white/5 bg-[#050505]/60 backdrop-blur-xl shadow-2xl py-16 text-center space-y-6 max-w-md mx-auto">
            <div className="inline-flex p-4 bg-yellow-500/10 rounded-full border border-yellow-500/20 text-yellow-400 mb-2">
              <Lock className="h-10 w-10 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase tracking-wide">Login Required</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                You must be logged in to attempt this daily challenge, rank on the leaderboard, and earn MLSC coins.
              </p>
            </div>
            <Button 
              onClick={() => router.push('/auth/login')}
              className="w-full bg-[#4285F4] hover:bg-[#4285F4]/90 text-white font-black text-xs uppercase tracking-wider rounded-xl h-11"
            >
              Sign In / Register
            </Button>
          </div>
        )}

        {/* 2. 404 Quiz Not Found State */}
        {!loading && quizNotFound && (
          <div className="p-8 rounded-3xl border border-white/5 bg-[#050505]/60 backdrop-blur-xl shadow-2xl py-16 text-center space-y-6">
            <div className="inline-flex p-4 bg-red-500/10 rounded-full border border-red-500/20 text-red-500 mb-2">
              <ShieldAlert className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black uppercase tracking-wide">Challenge Not Found</h3>
              <p className="text-xs text-white/40 max-w-sm mx-auto leading-normal">
                This daily quiz link is invalid or may have been deleted by an administrator. Please check the current active challenge.
              </p>
            </div>
            <Button asChild className="bg-white hover:bg-white/90 text-black font-black text-xs uppercase tracking-wider rounded-xl h-11 px-8">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" /> Return to Dashboard
              </Link>
            </Button>
          </div>
        )}

        {/* 3. Already Attempted / Completed State */}
        {!loading && quiz && user && alreadyCompleted && !quizActive && !quizCompleted && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left box: completion banner */}
            <div className="md:col-span-6 p-8 rounded-3xl border border-white/5 bg-[#050505]/60 backdrop-blur-xl space-y-6">
              <div className="inline-flex p-3 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black uppercase tracking-wider text-white">Daily Quiz Completed</h3>
                <p className="text-xs text-white/35 font-bold uppercase">Topic: {quiz.topic} ({quiz.date})</p>
              </div>

              <p className="text-xs text-white/60 leading-relaxed font-medium">
                To keep leaderboards competitive, users are restricted to **one submission per daily test**. Here are your registered score details:
              </p>

              {previousAttempt && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 bg-white/[0.02] border border-white/5 p-4 rounded-xl text-center">
                    <div>
                      <p className="text-[9px] font-bold text-white/40 uppercase">Score</p>
                      <p className="text-sm font-black text-white mt-1">{previousAttempt.score} / 5</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-white/40 uppercase">Time</p>
                      <p className="text-sm font-black text-white mt-1 font-mono">{previousAttempt.timeTaken}s</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-yellow-400 uppercase">Coins</p>
                      <p className="text-sm font-black text-yellow-400 mt-1">+{previousAttempt.coinsEarned}</p>
                    </div>
                  </div>
                  
                  {previousAttempt.rank && (
                    <div className="p-3.5 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-center flex items-center justify-between px-5">
                      <span className="text-[10px] font-black uppercase text-yellow-400 tracking-wider">Your Leaderboard Placement</span>
                      <span className="text-sm font-black text-yellow-400">#{previousAttempt.rank} of {previousAttempt.totalPlayers}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right box: Leaderboard */}
            <div className="md:col-span-6">
              <QuizLeaderboardSection leaderboard={leaderboard} loading={leaderboardLoading} />
            </div>
          </div>
        )}

        {/* 4. Active Quiz Play State */}
        {!loading && quiz && user && quizActive && (
          <div className="p-8 rounded-3xl border border-white/5 bg-[#050505]/60 backdrop-blur-xl space-y-6 max-w-2xl mx-auto">
            {/* Header progress */}
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-4">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-yellow-400">Daily Challenge</span>
                <p className="text-sm font-black uppercase text-white">Question {currentQuestionIdx + 1} of {quiz.questions.length}</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/10 text-white font-mono text-sm font-bold">
                <Timer className="h-4 w-4 text-yellow-400 animate-pulse" />
                {quizTimeTaken.toFixed(1)}s
              </div>
            </div>

            {/* Question Text */}
            <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5">
              <h3 className="text-base font-bold text-white leading-relaxed">
                {quiz.questions[currentQuestionIdx].question}
              </h3>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              {quiz.questions[currentQuestionIdx].options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === quiz.questions[currentQuestionIdx].answer;
                const showFeedback = selectedAnswer !== null;

                let btnStyle = "bg-white/[0.01] border-white/5 text-white/80 hover:bg-white/[0.03] hover:border-white/10";
                if (showFeedback) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold";
                  } else if (isSelected) {
                    btnStyle = "bg-red-500/10 border-red-500 text-red-400 font-bold";
                  } else {
                    btnStyle = "bg-white/[0.01] border-white/[0.02] text-white/20 cursor-default";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={showFeedback}
                    onClick={() => handleSelectOption(option)}
                    className={`w-full p-4 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {showFeedback && isCorrect && <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />}
                    {showFeedback && isSelected && !isCorrect && <AlertCircle className="h-4.5 w-4.5 text-red-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {explanationVisible && (
              <div className="p-4 rounded-2xl border border-blue-500/10 bg-blue-500/[0.02] space-y-2 animate-in slide-in-from-bottom-2 duration-200">
                <h4 className="text-[10px] font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4" /> Explanation Details
                </h4>
                <p className="text-[10px] text-white/60 leading-normal font-medium whitespace-pre-line">
                  {quiz.questions[currentQuestionIdx].explanation}
                </p>
              </div>
            )}

            {/* Action buttons */}
            {selectedAnswer && (
              <Button
                onClick={handleNextQuestion}
                className="w-full h-11 rounded-xl bg-white hover:bg-white/90 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                {currentQuestionIdx < quiz.questions.length - 1 ? (
                  <>
                    Next Question <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Finish Challenge <Trophy className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* 5. Start Launcher Panel (Before Start) */}
        {!loading && quiz && user && !alreadyCompleted && !quizActive && !quizCompleted && (
          <div className="max-w-2xl mx-auto p-8 rounded-3xl border border-white/5 bg-[#050505]/60 backdrop-blur-xl relative overflow-hidden shadow-2xl space-y-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-2xl">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400 px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20">Daily Challenge Active</span>
                <h3 className="text-lg font-bold uppercase tracking-wider mt-2">Daily Quiz Arena</h3>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 space-y-2">
              <p className="text-xs font-bold text-white/40 uppercase">Challenge Topic</p>
              <h4 className="text-xl font-black text-white uppercase tracking-wide">{quiz.topic}</h4>
              <p className="text-[10px] text-white/35 font-semibold">Scheduled Date: {quiz.date}</p>
            </div>

            {/* Rules Info */}
            <div className="space-y-3 pt-2">
              <h5 className="text-xs font-black uppercase text-white/60 tracking-wider">Challenge Rules & Rewards</h5>
              <ul className="space-y-2 text-[10px] text-white/50 leading-relaxed font-semibold">
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-yellow-400" /> Participate only once per daily link.</li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-yellow-400" /> Answer 5 challenging multiple-choice questions.</li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-yellow-400" /> Correct answers earn +10 MLSC coins each.</li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-yellow-400" /> Earn speed bonuses for perfect runs finished under 40 seconds.</li>
              </ul>
            </div>

            <Button
              onClick={handleStartQuiz}
              className="w-full h-12 rounded-xl bg-yellow-500 hover:bg-yellow-500/90 text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
            >
              Enter Quiz Arena <Play className="h-3.5 w-3.5 fill-black" />
            </Button>
          </div>
        )}

        {/* 6. Quiz Completed / Results State */}
        {!loading && quiz && user && quizCompleted && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Scorecard panel */}
            <div className="md:col-span-6 p-8 rounded-3xl border border-white/5 bg-[#050505]/70 backdrop-blur-xl text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="inline-flex p-4 bg-yellow-500/10 rounded-full border border-yellow-500/20 text-yellow-400 mb-2">
                <Trophy className="h-10 w-10 animate-bounce" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-wide">Challenge Finished!</h3>
                <p className="text-xs text-white/40 font-semibold uppercase">Topic: {quiz.topic}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
                <div>
                  <p className="text-[9px] font-bold text-white/40 uppercase">Score</p>
                  <p className="text-lg font-black text-white mt-1">{quizScore} / 5</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-white/40 uppercase">Time</p>
                  <p className="text-lg font-black text-white mt-1 font-mono">{quizTimeTaken.toFixed(1)}s</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-yellow-400 uppercase">Coins</p>
                  <p className="text-lg font-black text-yellow-400 mt-1">
                    +{getCoinsEarnedAmount()}
                  </p>
                </div>
              </div>

              {/* Score submission feedback & Rank Shift */}
              <div className="border-t border-white/[0.08] pt-6 space-y-4">
                {scoreSubmitted && computedRank > 0 ? (
                  <div className="space-y-4 text-left">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-4.5 w-4.5" /> Score registered on leaderboard!
                    </div>
                    
                    {/* Rank Shift Indicator */}
                    <div className="p-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 space-y-3 text-center relative overflow-hidden">
                      <div className="flex items-center justify-center gap-2">
                        <Sparkles className="h-4 w-4 text-yellow-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">Position Update</span>
                        <Sparkles className="h-4 w-4 text-yellow-400" />
                      </div>
                      
                      <div className="flex items-center justify-center gap-6 py-2">
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] text-white/40 font-bold uppercase">Start</span>
                          <span className="text-base font-black text-white/50 line-through mt-0.5">
                            #{totalPlayersBefore + 1}
                          </span>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-emerald-400 font-extrabold text-[8px] uppercase tracking-widest animate-pulse">ASCENDED</span>
                          <div className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mt-0.5">
                            <ArrowRight className="h-3.5 w-3.5 rotate-[-45deg]" />
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] text-yellow-400 font-black uppercase">Current</span>
                          <span className="text-2xl font-black text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.2)] mt-0.5">
                            #{computedRank}
                          </span>
                        </div>
                      </div>

                      <p className="text-[10px] text-white/75 font-medium leading-relaxed">
                        {totalPlayersBefore === 0 ? (
                          "🎉 First player to finish today! You are leading the pack at #1!"
                        ) : (
                          `🚀 You climbed ${(totalPlayersBefore + 1) - computedRank} places and finished #${computedRank} of ${totalPlayersBefore + 1} players!`
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 text-[10px] text-white/40 uppercase tracking-wider animate-pulse">
                    Registering score details...
                  </div>
                )}
              </div>
            </div>

            {/* Leaderboard Panel */}
            <div className="md:col-span-6">
              <QuizLeaderboardSection leaderboard={leaderboard} loading={leaderboardLoading} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Subcomponent: Leaderboard list
function QuizLeaderboardSection({ 
  leaderboard, 
  loading 
}: { 
  leaderboard: LeaderboardRecord[];
  loading: boolean;
}) {
  return (
    <div className="p-6 rounded-3xl border border-white/5 bg-[#050505]/60 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
          <Trophy className="h-4.5 w-4.5 text-yellow-400 shrink-0" /> Challenge Leaderboard
        </h4>
        <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] font-bold text-white/40 uppercase">Top Speed runs</span>
      </div>

      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        {loading ? (
          <div className="py-12 text-center text-white/20">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-yellow-400" />
            <p className="text-[10px] font-bold uppercase tracking-wider">Syncing Arena Rankings...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-12 text-center text-white/20">
            <Trophy className="h-6 w-6 mx-auto mb-2 text-white/30" />
            <p className="text-[10px] font-bold uppercase tracking-wider">No submissions yet</p>
          </div>
        ) : (
          leaderboard.map((record, index) => (
            <div
              key={index}
              className="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-5 h-5 rounded-md text-[9px] font-black flex items-center justify-center shrink-0 ${
                  index === 0
                    ? "bg-yellow-500 text-black"
                    : index === 1
                      ? "bg-zinc-400 text-black"
                      : index === 2
                        ? "bg-amber-700 text-white"
                        : "bg-white/5 text-white/40"
                }`}>
                  {index + 1}
                </span>
                <p className="font-bold text-white truncate max-w-[130px] uppercase tracking-wide text-[10px]">{record.displayName}</p>
              </div>

              <div className="flex items-center gap-4 shrink-0 font-mono text-[10px]">
                <div className="text-right">
                  <p className="font-black text-white">{record.score} / 5</p>
                  <p className="text-[9px] text-white/40 mt-0.5">{record.timeTaken}s</p>
                </div>
                <span className="text-yellow-400 font-bold flex items-center gap-0.5 shrink-0 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 text-[9px] uppercase tracking-widest font-sans">
                  +{record.coinsEarned}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
