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
import { cn } from '@/lib/utils';

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
  const [submittingScore, setSubmittingScore] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  // Stopwatch references
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const quizStartTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const totalPausedTimeRef = useRef<number>(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      loadQuizAndUserStatus();
    }
  }, [quizId, user, isMounted]);

  const loadQuizAndUserStatus = async () => {
    setLoading(true);
    setQuizNotFound(false);
    try {
      const quizRef = doc(db, 'daily_quizzes', quizId);
      const quizSnap = await getDoc(quizRef);

      if (!quizSnap.exists()) {
        setQuizNotFound(true);
        setLoading(false);
        return;
      }

      const qData = quizSnap.data() as QuizData;
      setQuiz(qData);

      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserCoins(userSnap.data().coins || 0);
        }
      }

      let hasAttempted = false;
      if (localStorage.getItem(`mlsc_quiz_done_${quizId}`)) {
        hasAttempted = true;
      }

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
    
    setCurrentQuestionIdx(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setExplanationVisible(false);
    setQuizTimeTaken(0);
    totalPausedTimeRef.current = 0;
    setScoreSubmitted(false);
    
    quizStartTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - quizStartTimeRef.current - totalPausedTimeRef.current) / 1000;
      setQuizTimeTaken(elapsed);
    }, 100);

    setQuizActive(true);
  };

  const handleSelectOption = (option: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(option);
    setExplanationVisible(true);
    
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
    const pauseDuration = Date.now() - pauseTimeRef.current;
    totalPausedTimeRef.current += pauseDuration;
    
    if (currentQuestionIdx < quiz!.questions.length - 1) {
      setSelectedAnswer(null);
      setExplanationVisible(false);
      setCurrentQuestionIdx(prev => prev + 1);
      
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - quizStartTimeRef.current - totalPausedTimeRef.current) / 1000;
        setQuizTimeTaken(elapsed);
      }, 100);
    } else {
      setQuizActive(false);
      setQuizCompleted(true);
      playSound('complete');
      
      if (timerRef.current) clearInterval(timerRef.current);

      const finalTime = Number(quizTimeTaken.toFixed(1));
      const baseCoins = quizScore * 10;
      const speedBonus = quizScore === 5 ? Math.max(0, Math.round((40 - finalTime) * 2)) : 0;
      const totalEarned = baseCoins + speedBonus;

      localStorage.setItem(`mlsc_quiz_done_${quizId}`, 'true');

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

      const q = query(
        collection(db, 'quiz_leaderboard'),
        where('quizId', '==', quizId)
      );
      const snap = await getDocs(q);
      const allAttempts = snap.docs.map(docSnap => docSnap.data() as LeaderboardRecord);
      const totalBefore = allAttempts.length;

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

      await addDoc(collection(db, 'quiz_leaderboard'), record);

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
    <div className="w-full bg-white min-h-screen py-16 md:py-24 text-black font-sans selection:bg-[#FFE600] selection:text-black">
      
      {/* Top Banner */}
      <div className="border-b-2 border-black bg-[#FFE600] text-black px-4 py-2 font-black text-xs uppercase tracking-widest text-center mb-8">
        ⚡ Chapter 4 Daily Quiz Arena & Speed Trials
      </div>

      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <Link href="/services" className="inline-flex items-center gap-2 text-black hover:text-[#4285F4] transition-colors text-xs font-black uppercase tracking-wider border-2 border-black bg-zinc-100 hover:bg-white px-3 py-1.5 shadow-[2px_2px_0px_0px_#000000]">
            <ArrowLeft className="h-4 w-4" /> Exit Challenge
          </Link>
          
          {isMounted && (
            <div className="flex items-center gap-2 px-3 py-1.5 border-2 border-black bg-[#FFE600] text-black font-black text-xs uppercase tracking-widest shadow-[2px_2px_0px_0px_#000000]">
              <Coins className="h-4 w-4 text-black shrink-0" /> {userCoins} Coins
            </div>
          )}
        </div>

        {/* 1. Loading State */}
        {loading && (
          <div className="border-2 border-black bg-white p-12 shadow-[6px_6px_0px_0px_#000000] text-center space-y-4">
            <div className="w-8 h-8 border-4 border-black border-t-[#FFE600] rounded-full animate-spin mx-auto" />
            <p className="text-xs font-black uppercase tracking-widest text-black">Securing Daily Arena Access...</p>
          </div>
        )}

        {/* 1.5 Login Required Gate */}
        {!loading && !user && (
          <div className="border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_#000000] text-center space-y-6 max-w-md mx-auto">
            <div className="inline-flex p-4 bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-black mb-2">
              <Lock className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase italic tracking-tight text-black">Authentication Required</h3>
              <p className="text-xs text-zinc-600 font-bold leading-relaxed">
                You must be logged in to attempt this daily challenge, rank on the leaderboard, and earn MLSC coins.
              </p>
            </div>
            <Button 
              onClick={() => router.push('/auth/login')}
              className="w-full bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black text-xs uppercase tracking-wider h-11 shadow-[3px_3px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px]"
            >
              Sign In / Register
            </Button>
          </div>
        )}

        {/* 2. 404 Quiz Not Found State */}
        {!loading && quizNotFound && (
          <div className="border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_#000000] text-center space-y-6">
            <div className="inline-flex p-4 bg-[#EA4335] text-white border-2 border-black shadow-[3px_3px_0px_0px_#000000] mb-2">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase italic tracking-tight text-black">Challenge Not Found</h3>
              <p className="text-xs text-zinc-600 font-bold max-w-sm mx-auto">
                This daily quiz link is invalid or may have expired. Please return to dashboard.
              </p>
            </div>
            <Button asChild className="bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black text-xs uppercase tracking-wider h-11 px-8 shadow-[3px_3px_0px_0px_#000000]">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" /> Return to Dashboard
              </Link>
            </Button>
          </div>
        )}

        {/* 3. Already Attempted State */}
        {!loading && quiz && user && alreadyCompleted && !quizActive && !quizCompleted && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-6 border-2 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000000] space-y-6">
              <div className="inline-flex p-3 bg-[#00FF66] border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-black">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black uppercase italic tracking-tight text-black">Daily Challenge Completed</h3>
                <p className="text-xs text-zinc-600 font-bold uppercase font-mono">Topic: {quiz.topic} ({quiz.date})</p>
              </div>

              <p className="text-xs text-zinc-700 leading-relaxed font-bold">
                To maintain fair rankings, each student is allowed **one submission per daily challenge**. Here is your verified scorecard:
              </p>

              {previousAttempt && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 border-2 border-black p-4 bg-zinc-50 text-center">
                    <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase">Score</p>
                      <p className="text-base font-black text-black mt-1">{previousAttempt.score} / 5</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase">Time</p>
                      <p className="text-base font-black text-black mt-1 font-mono">{previousAttempt.timeTaken}s</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-black uppercase">Coins</p>
                      <p className="text-base font-black text-black mt-1">+{previousAttempt.coinsEarned}</p>
                    </div>
                  </div>
                  
                  {previousAttempt.rank && (
                    <div className="p-3.5 border-2 border-black bg-[#FFE600] text-black flex items-center justify-between px-5 font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000000]">
                      <span>Leaderboard Rank</span>
                      <span>#{previousAttempt.rank} of {previousAttempt.totalPlayers}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="md:col-span-6">
              <QuizLeaderboardSection leaderboard={leaderboard} loading={leaderboardLoading} />
            </div>
          </div>
        )}

        {/* 4. Active Quiz Play State */}
        {!loading && quiz && user && quizActive && (
          <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000] space-y-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center border-b-2 border-black pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#FFE600] border border-black px-2 py-0.5">
                  Daily Challenge
                </span>
                <p className="text-sm font-black uppercase text-black">Question {currentQuestionIdx + 1} of {quiz.questions.length}</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-zinc-100 text-black font-mono text-xs font-black shadow-[2px_2px_0px_0px_#000000]">
                <Timer className="h-4 w-4 text-black" />
                {quizTimeTaken.toFixed(1)}s
              </div>
            </div>

            <div className="p-6 border-2 border-black bg-zinc-50 shadow-[3px_3px_0px_0px_#000000]">
              <h3 className="text-base font-black text-black leading-relaxed">
                {quiz.questions[currentQuestionIdx].question}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {quiz.questions[currentQuestionIdx].options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === quiz.questions[currentQuestionIdx].answer;
                const showFeedback = selectedAnswer !== null;

                let btnStyle = "bg-white border-2 border-black text-black hover:bg-zinc-100 shadow-[3px_3px_0px_0px_#000000]";
                if (showFeedback) {
                  if (isCorrect) {
                    btnStyle = "bg-[#00FF66] border-2 border-black text-black font-black shadow-[3px_3px_0px_0px_#000000]";
                  } else if (isSelected) {
                    btnStyle = "bg-[#EA4335] border-2 border-black text-white font-black shadow-[3px_3px_0px_0px_#000000]";
                  } else {
                    btnStyle = "bg-zinc-100 border-2 border-zinc-300 text-zinc-400 cursor-default";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={showFeedback}
                    onClick={() => handleSelectOption(option)}
                    className={cn(
                      'w-full p-4 text-left text-xs font-bold transition-all flex items-center justify-between active:translate-x-[2px] active:translate-y-[2px]',
                      btnStyle
                    )}
                  >
                    <span>{option}</span>
                    {showFeedback && isCorrect && <CheckCircle2 className="h-5 w-5 text-black shrink-0" />}
                    {showFeedback && isSelected && !isCorrect && <AlertCircle className="h-5 w-5 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>

            {explanationVisible && (
              <div className="p-4 border-2 border-black bg-[#4285F4]/10 space-y-2 shadow-[3px_3px_0px_0px_#000000]">
                <h4 className="text-xs font-black uppercase text-black tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4" /> Explanation Details
                </h4>
                <p className="text-xs text-zinc-800 leading-normal font-bold whitespace-pre-line">
                  {quiz.questions[currentQuestionIdx].explanation}
                </p>
              </div>
            )}

            {selectedAnswer && (
              <Button
                onClick={handleNextQuestion}
                className="w-full h-12 bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px]"
              >
                {currentQuestionIdx < quiz.questions.length - 1 ? (
                  <>Next Question <ArrowRight className="h-4 w-4" /></>
                ) : (
                  <>Finish Challenge <Trophy className="h-4 w-4" /></>
                )}
              </Button>
            )}
          </div>
        )}

        {/* 5. Start Launcher Panel */}
        {!loading && quiz && user && !alreadyCompleted && !quizActive && !quizCompleted && (
          <div className="max-w-2xl mx-auto border-2 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000] space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#FFE600] border-2 border-black text-black shadow-[2px_2px_0px_0px_#000000]">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-black px-2 py-0.5 bg-[#00FF66] border border-black">
                  Daily Challenge Active
                </span>
                <h3 className="text-xl font-black uppercase italic tracking-tight text-black mt-1">Daily Quiz Arena</h3>
              </div>
            </div>

            <div className="p-5 border-2 border-black bg-zinc-50 space-y-2 shadow-[3px_3px_0px_0px_#000000]">
              <p className="text-[10px] font-black text-zinc-500 uppercase">Challenge Topic</p>
              <h4 className="text-2xl font-black text-black uppercase italic tracking-tight">{quiz.topic}</h4>
              <p className="text-xs text-zinc-600 font-bold font-mono">Date: {quiz.date}</p>
            </div>

            <div className="space-y-3 pt-2">
              <h5 className="text-xs font-black uppercase tracking-wider text-black">Arena Rules & Payouts</h5>
              <ul className="space-y-2 text-xs text-zinc-700 font-bold">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-black" /> Attempt only once per daily challenge link.</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-black" /> Solve 5 multiple-choice questions.</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-black" /> Correct answers award +10 MLSC coins each.</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-black" /> Speed multiplier rewarded for perfect completions under 40s.</li>
              </ul>
            </div>

            <Button
              onClick={handleStartQuiz}
              className="w-full h-12 bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px]"
            >
              Enter Quiz Arena <Play className="h-4 w-4 fill-black" />
            </Button>
          </div>
        )}

        {/* 6. Results State */}
        {!loading && quiz && user && quizCompleted && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-6 border-2 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000] text-center space-y-6">
              <div className="inline-flex p-4 bg-[#FFE600] border-2 border-black text-black shadow-[3px_3px_0px_0px_#000000] mb-2">
                <Trophy className="h-10 w-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black uppercase italic tracking-tight text-black">Challenge Finished!</h3>
                <p className="text-xs text-zinc-600 font-bold uppercase font-mono">Topic: {quiz.topic}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 border-2 border-black p-4 bg-zinc-50">
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase">Score</p>
                  <p className="text-lg font-black text-black mt-1">{quizScore} / 5</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase">Time</p>
                  <p className="text-lg font-black text-black mt-1 font-mono">{quizTimeTaken.toFixed(1)}s</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-black uppercase">Coins</p>
                  <p className="text-lg font-black text-black mt-1">+{getCoinsEarnedAmount()}</p>
                </div>
              </div>

              <div className="border-t-2 border-black pt-6 space-y-4">
                {scoreSubmitted && computedRank > 0 ? (
                  <div className="space-y-4 text-left">
                    <div className="p-3 bg-[#00FF66] border-2 border-black text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#000000]">
                      <CheckCircle2 className="h-4 w-4" /> Score Saved on Leaderboard
                    </div>
                    
                    <div className="p-5 border-2 border-black bg-[#FFE600] space-y-3 text-center shadow-[4px_4px_0px_0px_#000000]">
                      <div className="flex items-center justify-center gap-2">
                        <Sparkles className="h-4 w-4 text-black" />
                        <span className="text-xs font-black uppercase tracking-widest text-black">Position Update</span>
                        <Sparkles className="h-4 w-4 text-black" />
                      </div>
                      
                      <div className="flex items-center justify-center gap-6 py-2">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-zinc-700 font-bold uppercase">Initial</span>
                          <span className="text-base font-black text-zinc-500 line-through mt-0.5">
                            #{totalPlayersBefore + 1}
                          </span>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-black font-black text-[9px] uppercase tracking-widest">ASCENDED</span>
                          <div className="flex items-center justify-center h-8 w-8 bg-white text-black border-2 border-black shadow-[1px_1px_0px_0px_#000000] mt-0.5">
                            <ArrowRight className="h-4 w-4 rotate-[-45deg]" />
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-black font-black uppercase">Rank</span>
                          <span className="text-3xl font-black text-black mt-0.5 font-mono">
                            #{computedRank}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-black font-bold leading-relaxed">
                        {totalPlayersBefore === 0 ? (
                          "🎉 First player to finish today! You are leading the pack at #1!"
                        ) : (
                          `🚀 You climbed ${(totalPlayersBefore + 1) - computedRank} places and finished #${computedRank} of ${totalPlayersBefore + 1} players!`
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 text-xs text-black font-black uppercase tracking-wider animate-pulse">
                    Registering score details...
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-6">
              <QuizLeaderboardSection leaderboard={leaderboard} loading={leaderboardLoading} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function QuizLeaderboardSection({ 
  leaderboard, 
  loading 
}: { 
  leaderboard: LeaderboardRecord[];
  loading: boolean;
}) {
  return (
    <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000] space-y-4">
      <div className="flex items-center justify-between border-b-2 border-black pb-3">
        <h4 className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-2">
          <Trophy className="h-4 w-4 text-black shrink-0" /> Arena Leaderboard
        </h4>
        <span className="px-2 py-0.5 border border-black bg-[#FFE600] text-[9px] font-black text-black uppercase">
          Top Speedruns
        </span>
      </div>

      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        {loading ? (
          <div className="py-12 text-center text-zinc-400">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-black" />
            <p className="text-[10px] font-black uppercase tracking-wider text-black">Syncing Arena Rankings...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-12 text-center text-zinc-400">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-zinc-400" />
            <p className="text-xs font-black uppercase tracking-wider text-black">No submissions yet today</p>
          </div>
        ) : (
          leaderboard.map((record, index) => (
            <div
              key={index}
              className="p-3 border-2 border-black bg-white flex items-center justify-between gap-3 text-xs shadow-[2px_2px_0px_0px_#000000]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={cn(
                  'w-6 h-6 border-2 border-black text-[10px] font-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_0px_#000000]',
                  index === 0 ? 'bg-[#FFE600] text-black' :
                  index === 1 ? 'bg-zinc-200 text-black' :
                  index === 2 ? 'bg-orange-200 text-black' :
                  'bg-zinc-50 text-zinc-600'
                )}>
                  {index + 1}
                </span>
                <p className="font-black text-black truncate max-w-[130px] uppercase tracking-wide text-xs">{record.displayName}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
                <div className="text-right">
                  <p className="font-black text-black">{record.score} / 5</p>
                  <p className="text-[10px] text-zinc-500">{record.timeTaken}s</p>
                </div>
                <span className="font-black border border-black bg-[#FFE600] px-2 py-0.5 text-[10px] uppercase tracking-wider font-sans shadow-[1px_1px_0px_0px_#000000]">
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
