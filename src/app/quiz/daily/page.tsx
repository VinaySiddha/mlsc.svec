'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RefreshCw, Trophy, Home, AlertCircle, Sparkles } from 'lucide-react';
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
      const d = new Date();
      const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      const q = query(
        collection(db, 'daily_quizzes'),
        where('date', '==', todayStr),
        limit(1)
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
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
    <div className="w-full bg-white min-h-screen py-24 text-black font-sans selection:bg-[#FFE600] selection:text-black flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-6 text-center">
        {loading && (
          <div className="border-2 border-black bg-white p-8 shadow-[6px_6px_0px_0px_#000000] space-y-4">
            <div className="w-8 h-8 border-4 border-black border-t-[#FFE600] rounded-full animate-spin mx-auto" />
            <p className="text-xs font-black uppercase tracking-widest text-black">
              ⚡ Locating Today's Challenge Arena...
            </p>
          </div>
        )}

        {!loading && notFound && (
          <div className="border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_#000000] space-y-6">
            <div className="inline-flex p-4 bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-black mb-2">
              <AlertCircle className="h-10 w-10 text-black" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase italic tracking-tight text-black">Arena Closed</h3>
              <p className="text-xs text-zinc-600 leading-normal font-bold">
                Today's daily challenge has not been published yet. Check back soon or contact your administrator!
              </p>
            </div>

            <Button asChild className="w-full bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black text-xs uppercase tracking-wider h-11 px-8 shadow-[3px_3px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px]">
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
