import type { Metadata } from "next";
import { AlumniSubmitPageView } from "@/components/alumni/alumni-submit-page-view";

export const metadata: Metadata = {
  title: "Share Your Words — MLSC SVEC Alumni Archive",
  description: "Share your experience, lessons, and career journey with students and juniors at Sri Vasavi Engineering College.",
  openGraph: {
    title: "Share Your Words — MLSC SVEC Alumni Archive",
    description: "Share your experience, lessons, and career journey with students and juniors at Sri Vasavi Engineering College.",
    url: "https://mlscsvec.com/what-our-alumni-say/submit",
  },
};

export default function SubmitAlumniWordsPage() {
  return (
    <main className="w-full min-h-screen bg-black">
      <AlumniSubmitPageView />
    </main>
  );
}
