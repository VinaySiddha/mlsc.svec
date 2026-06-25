'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RefreshCw, Trophy, Home, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DailyRedirectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchTodayQuiz();
  }, []);

  const fetchTodayQuiz = async () => {
    setLoading(true);
    setNotFound(false);
    try {
      // Calculate today's local date string (YYYY-MM-DD)
      const d = new Date();
      const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      // Query Firestore for quiz scheduled for today
      const q = query(
        collection(db, 'daily_quizzes'),
        where('date', '==', todayStr),
        limit(1)
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
        // Redirect to unique link page
        const quizId = snap.docs[0].id;
        router.replace(`/quiz/${quizId}/`);
      } else {
        setNotFound(true);
        setLoading(false);
      }
    } catch (e) {
      console.error('Error finding today\'s quiz:', e);
      setNotFound(true);
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-black min-h-screen py-24 text-white relative overflow-hidden flex items-center justify-center">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-md w-full mx-auto px-6 relative z-10 text-center">
        {loading && (
          <div className="space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-yellow-500 mb-2" />
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">Locating Today's Challenge Arena...</p>
          </div>
        )}

        {!loading && notFound && (
          <div className="p-8 rounded-3xl border border-white/5 bg-[#050505]/60 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="inline-flex p-4 bg-yellow-500/10 rounded-full border border-yellow-500/20 text-yellow-400 mb-2">
              <AlertCircle className="h-10 w-10 text-yellow-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-black uppercase tracking-wide">Arena Closed</h3>
              <p className="text-xs text-white/40 leading-normal max-w-xs mx-auto font-medium">
                Today's daily challenge has not been published yet. Check back soon or contact your administrator!
              </p>
            </div>

            <Button asChild className="bg-white hover:bg-white/90 text-black font-black text-xs uppercase tracking-wider rounded-xl h-11 px-8">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" /> Return to Dashboard
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
