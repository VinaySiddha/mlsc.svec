import type { Metadata } from "next";
import { getAlumniTestimonials } from "@/app/actions/alumni-actions";
import { AlumniBrutalistView } from "@/components/alumni/alumni-brutalist-view";

export const revalidate = 60; // Revalidate at most every minute

export const metadata: Metadata = {
  title: "What Our Alumni Say — MLSC SVEC",
  description: "Read unfiltered words, memories, and career pathways from the alumni who built and scaled MLSC SVEC.",
  openGraph: {
    title: "What Our Alumni Say — MLSC SVEC",
    description: "Read unfiltered words, memories, and career pathways from the alumni who built and scaled MLSC SVEC.",
    url: "https://mlscsvec.com/what-our-alumni-say",
  },
};

export default async function WhatOurAlumniSayPage() {
  const { testimonials } = await getAlumniTestimonials({ onlyApproved: true });

  return (
    <main className="w-full min-h-screen bg-black">
      <AlumniBrutalistView initialTestimonials={testimonials} />
    </main>
  );
}
