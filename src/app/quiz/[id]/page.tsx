import { DailyQuizBoard } from '@/components/daily-quiz-board';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UniqueQuizPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#FFE600] selection:text-black">
      <DailyQuizBoard quizId={id} />
    </div>
  );
}
